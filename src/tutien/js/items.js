window.TT = window.TT || {};

/**
 * TT.Items — sinh trang bị, từ tố, túi đồ và dịch vụ Tẩy Luyện (GDD mục 1, 2, 4.2).
 */
(function (TT) {
  'use strict';
  const D = TT.DATA;
  const U = TT.util;

  const affixById = {};
  for (const a of D.affixPool.AffixDefinitions) affixById[a.AffixId] = a;
  const rarityById = {};
  D.rarities.forEach((r, i) => { rarityById[r.id] = Object.assign({ index: i }, r); });
  const tierWeight = {};
  for (const t of D.affixPool.TierWeights) tierWeight[t.Tier] = t;

  /** Quay Tier theo trọng số trong khoảng [minTier, maxTier]. */
  function rollWeightedTier(minTier, maxTier) {
    const tiers = [];
    for (let t = minTier; t <= maxTier; t++) tiers.push(t);
    return U.weighted(tiers, t => tierWeight[t].Weight);
  }

  /** Quay giá trị trong [Min, Max] của Tier, nhân theo cấp nếu cần. */
  function rollValue(def, tier, level) {
    const r = def.TierRanges[tier];
    const mult = def.ScalesWithLevel ? Math.pow(D.itemLevelGrowth, level - 1) : 1;
    if (r.IsInteger) return Math.max(1, Math.round(U.randInt(r.Min, r.Max) * mult));
    return Math.round(U.rand(r.Min, r.Max) * mult * 10) / 10;
  }

  /**
   * Quay 1 dòng từ tố hợp lệ cho item.
   * @param {object} item trang bị
   * @param {Set<string>} usedIds các AffixId đã dùng (chống trùng)
   * @param {number} uniqueCount số dòng Unique hiện có
   * @param {boolean} forceTier5 ép Tier 5 (Linh Vận)
   * @returns {object|null} RolledAffixInstance
   */
  function rollAffixLine(item, usedIds, uniqueCount, forceTier5) {
    const rar = rarityById[item.rarity];
    const tier = (forceTier5 && rar.maxTier >= 5) ? 5 : rollWeightedTier(rar.minTier, rar.maxTier);
    const candidates = D.affixPool.AffixDefinitions.filter(def =>
      def.ApplicableSlots.includes(item.slot) &&
      !usedIds.has(def.AffixId) &&
      def.TierRanges[tier] !== undefined &&
      (def.Category !== 'Unique' || uniqueCount < rar.maxUnique));
    if (candidates.length === 0) return null;
    const def = U.pick(candidates);
    return { AffixId: def.AffixId, Tier: tier, RolledValue: rollValue(def, tier, item.level), IsLocked: false };
  }

  function generateName(slot, element) {
    return U.pick(D.elementNamePrefix[element]) + ' ' + U.pick(D.slotBaseNames[slot]);
  }

  TT.Items = {
    affixById, rarityById, tierWeight, rollWeightedTier,

    /**
     * Tạo trang bị mới. opts: {slot, element, rarity, level, identified}
     */
    createEquipment(opts) {
      const slot = opts.slot || U.pick(D.equipSlots).id;
      const element = opts.element || U.pick(D.elements.order);
      const rarity = opts.rarity || U.weighted(D.rarities, r => r.dropWeight).id;
      const item = {
        uid: U.uid(), kind: 'equip', slot, element, rarity,
        level: Math.max(1, opts.level || 1),
        name: generateName(slot, element),
        identified: opts.identified !== undefined ? opts.identified : false,
        affixes: []
      };
      const used = new Set();
      let uniq = 0;
      for (let i = 0; i < rarityById[rarity].affixCount; i++) {
        const a = rollAffixLine(item, used, uniq, false);
        if (!a) break;
        used.add(a.AffixId);
        if (affixById[a.AffixId].Category === 'Unique') uniq++;
        item.affixes.push(a);
      }
      return item;
    },

    /** Tạo vật phẩm xếp chồng. */
    createStack(id, count) {
      return { uid: U.uid(), kind: 'stack', id, count: count || 1 };
    },

    /** Chỉ số gốc của trang bị (chưa tính cộng hưởng). */
    baseStats(item) {
      const base = D.slotBaseStats[item.slot];
      const out = {};
      const m = Math.pow(D.itemLevelGrowth, item.level - 1);
      for (const k in base) {
        out[k] = D.nonScalingBaseStats.includes(k) ? base[k] : Math.round(base[k] * m);
      }
      return out;
    },

    /** Số ô túi Nạp Giới cộng thêm. */
    ringBonusSlots(item) {
      return item && item.slot === 'Ring' ? (D.inventory.ringBonusSlots[item.rarity] || 0) : 0;
    },

    describeAffix(a) {
      const def = affixById[a.AffixId];
      const v = Number.isInteger(a.RolledValue) ? a.RolledValue : U.fmt1(a.RolledValue);
      return def.DescriptionTemplate.replace('{0}', v);
    },

    tierColor(tier) { return tierWeight[tier].ColorHex; },

    def(id) { return D.items[id]; },

    maxStack(item) { return item.kind === 'equip' ? 1 : D.items[item.id].maxStack; },

    displayName(item) {
      return item.kind === 'equip' ? item.name : D.items[item.id].name;
    },

    sellPrice(item) {
      if (item.kind === 'equip') return Math.round(rarityById[item.rarity].sellPrice * Math.pow(1.4, item.level - 1));
      return D.items[item.id].price * item.count;
    },

    statLabel: {
      FlatATK: 'Công kích', FlatHP: 'Sinh lực', FlatDEF: 'Phòng ngự', FlatMP: 'Linh lực', ProjectileCount: 'Số Phi Kiếm'
    }
  };

  // ======================================================================
  // TÚI TRỮ VẬT
  // ======================================================================
  /**
   * Túi đồ dạng danh sách gọn. Sức chứa = baseSlots + bonus Nạp Giới.
   */
  class Inventory {
    constructor() { this.items = []; this.capacity = D.inventory.baseSlots; }

    count(id) {
      let n = 0;
      for (const it of this.items) if (it.kind === 'stack' && it.id === id) n += it.count;
      return n;
    }

    freeSlots() { return this.capacity - this.items.length; }

    /** Thêm vật phẩm, trả về số lượng KHÔNG thêm được (0 = thành công). */
    add(item) {
      if (item.kind === 'equip') {
        if (this.items.length >= this.capacity) return 1;
        this.items.push(item);
        return 0;
      }
      let left = item.count;
      const max = D.items[item.id].maxStack;
      for (const it of this.items) {
        if (left <= 0) break;
        if (it.kind === 'stack' && it.id === item.id && it.count < max) {
          const n = Math.min(max - it.count, left);
          it.count += n; left -= n;
        }
      }
      while (left > 0 && this.items.length < this.capacity) {
        const n = Math.min(max, left);
        this.items.push(TT.Items.createStack(item.id, n));
        left -= n;
      }
      return left;
    }

    /** Trừ số lượng; trả về true nếu đủ. */
    remove(id, n) {
      if (this.count(id) < n) return false;
      for (let i = this.items.length - 1; i >= 0 && n > 0; i--) {
        const it = this.items[i];
        if (it.kind === 'stack' && it.id === id) {
          const k = Math.min(it.count, n);
          it.count -= k; n -= k;
          if (it.count <= 0) this.items.splice(i, 1);
        }
      }
      return true;
    }

    removeItem(item) {
      const i = this.items.indexOf(item);
      if (i >= 0) this.items.splice(i, 1);
    }

    toJSON() { return { items: this.items }; }
  }
  TT.Inventory = Inventory;

  // ======================================================================
  // TẨY LUYỆN (port AffixRerollService, GDD 4.2 — đã sửa giới hạn Tier/Unique)
  // ======================================================================
  TT.Reroll = {
    lockedCount(item) { return item.affixes.filter(a => a.IsLocked).length; },

    maxLocks(item) { return Math.max(0, item.affixes.length - 1); },

    /** Chi phí theo GDD 2.3. */
    cost(item) {
      const L = this.lockedCount(item);
      return {
        linhThach: Math.round(D.reroll.baseCost * (item.level * 1.5) * Math.pow(2, L)),
        dinhHonChau: L,
        tayLuyenThach: D.reroll.tayLuyenThachPerRoll,
        lockMultiplier: Math.pow(2, L)
      };
    },

    /** Có dòng Tier 5 chưa khóa sẽ bị thay? */
    hasUnlockedTier5(item) { return item.affixes.some(a => !a.IsLocked && a.Tier === 5); },

    /**
     * Tẩy luyện các dòng chưa khóa. Trả về {pity, forced, newTier5:[index]}.
     * Linh Vận: nếu pity >= max thì lần này ép 1 dòng Tier 5 và reset về 0; ngược lại +1.
     */
    reroll(item, pity) {
      const rar = TT.Items.rarityById[item.rarity];
      const used = new Set(item.affixes.filter(a => a.IsLocked).map(a => a.AffixId));
      let uniq = item.affixes.filter(a => a.IsLocked && affixById[a.AffixId].Category === 'Unique').length;
      let forceT5 = pity >= D.reroll.pityMax && rar.maxTier >= 5;
      const forced = forceT5;
      const newTier5 = [];
      for (let i = 0; i < item.affixes.length; i++) {
        if (item.affixes[i].IsLocked) continue;
        const a = rollAffixLine(item, used, uniq, forceT5);
        if (!a) continue;
        if (forceT5) forceT5 = false;
        used.add(a.AffixId);
        if (affixById[a.AffixId].Category === 'Unique') uniq++;
        item.affixes[i] = a;
        if (a.Tier === 5) newTier5.push(i);
      }
      return { pity: forced ? 0 : Math.min(D.reroll.pityMax, pity + 1), forced, newTier5 };
    }
  };
})(window.TT);
