window.TT = window.TT || {};

/**
 * TT.State — tiến trình nhân vật (cảnh giới, tu vi, đan độc, trang bị, túi đồ),
 * tính chỉ số tổng hợp có Cộng Hưởng Ngũ Hành, và lưu/tải localStorage.
 */
(function (TT) {
  'use strict';
  const D = TT.DATA;
  const I = TT.Items;

  class PlayerState {
    constructor() {
      this.realm = 0;
      this.stage = 0;
      this.tuvi = 0;
      this.danDoc = 0;
      this.linhThach = D.startingKit.linhThach;
      this.linhVan = 0;
      this.inventory = new TT.Inventory();
      this.equipment = { Weapon: null, Armor: null, Ring: null, Boots: null, Accessory: null };
      this.quickSlots = D.startingKit.quickSlots.slice();
      this.skin = D.skins[0].id;
      this.ownedSkins = [D.skins[0].id];
      this.swordSkin = D.swordSkins[0].id;
      this.ownedSwordSkins = [D.swordSkins[0].id];
      this.hp = 1; this.mp = 1;
      this.stats = null;
    }

    /** Khởi tạo bộ đồ ban đầu. */
    giveStartingKit() {
      for (const [id, n] of D.startingKit.items) this.inventory.add(I.createStack(id, n));
      const w = D.startingKit.weapon;
      this.equipment.Weapon = I.createEquipment({ slot: w.slot, element: w.element, rarity: w.rarity, level: 1, identified: true });
      this.recompute();
      this.hp = this.stats.maxHp; this.mp = this.stats.maxMp;
    }

    get realmDef() { return D.realms[this.realm]; }
    get globalStage() { return this.realm * 3 + this.stage; }
    get itemLevel() { return this.globalStage + 1; }
    get tuviNeeded() { return this.realmDef.tuviPerStage; }
    realmLabel() { return this.realmDef.name + (this.realmDef.final ? '' : ' ' + D.stageNames[this.stage]); }

    /** Đang ở bình cảnh, cần Độ Kiếp để lên đại cảnh giới kế tiếp. */
    atBottleneck() {
      return this.stage === 2 && this.tuvi >= this.tuviNeeded && !this.realmDef.final;
    }
    nextTribulation() {
      const next = D.realms[this.realm + 1];
      return next ? next.tribulation : null;
    }

    /** Cộng tu vi; tự đột phá tiểu cảnh giới. Trả về thông báo nếu có. */
    addTuvi(n) {
      if (this.realmDef.final) return null;
      this.tuvi += n;
      let msg = null;
      while (this.tuvi >= this.tuviNeeded) {
        if (this.stage < 2) {
          this.tuvi -= this.tuviNeeded; this.stage++;
          msg = 'Đột phá ' + this.realmLabel() + '!';
          this.recompute(); this.hp = this.stats.maxHp; this.mp = this.stats.maxMp;
        } else {
          const next = D.realms[this.realm + 1];
          if (next && !next.tribulation) { this.advanceRealm(); msg = 'Đột phá ' + this.realmLabel() + '!'; }
          else { this.tuvi = this.tuviNeeded; break; }
        }
      }
      return msg;
    }

    advanceRealm() {
      this.realm++; this.stage = 0; this.tuvi = 0;
      this.recompute(); this.hp = this.stats.maxHp; this.mp = this.stats.maxMp;
    }

    addDanDoc(n) { this.danDoc = TT.util.clamp(this.danDoc + n, 0, 100); }

    /** Danh sách ô có Cộng Hưởng: ô i nhận bonus nếu ô i-1 (vòng tròn) tương sinh ra nó. */
    resonance() {
      const slots = D.equipSlots.map(s => s.id);
      const active = {};
      for (let i = 0; i < slots.length; i++) {
        const prev = this.equipment[slots[(i + slots.length - 1) % slots.length]];
        const cur = this.equipment[slots[i]];
        active[slots[i]] = !!(prev && cur && D.elements.generates[prev.element] === cur.element);
      }
      return active;
    }

    /** Tính lại chỉ số tổng hợp. */
    recompute() {
      const P = D.player;
      const r = this.realmDef;
      const g = 1 + D.stageStatGrowth * this.stage;
      const sum = { FlatATK: 0, FlatHP: 0, FlatDEF: 0, FlatMP: 0, ProjectileCount: 0, AttackPercent: 0, CritRate: 0, CritDamage: 0,
        ElementalDamage: 0, PierceCount: 0, ProjectileSpeed: 0, AoERadius: 0, MoveSpeed: 0,
        SpecialTrigger_ThunderOnHit: 0, SpecialTrigger_CritLifesteal: 0, SpecialTrigger_SwordSplit: 0 };
      const res = this.resonance();
      let bonusSlots = 0;
      for (const slot in this.equipment) {
        const it = this.equipment[slot];
        if (!it) continue;
        const base = I.baseStats(it);
        const mult = res[slot] ? 1 + D.elements.resonanceBonus : 1;
        for (const k in base) sum[k] += k === 'ProjectileCount' ? base[k] : Math.round(base[k] * mult);
        if (it.identified) for (const a of it.affixes) sum[I.affixById[a.AffixId].StatType] += a.RolledValue;
        bonusSlots += I.ringBonusSlots(it);
      }
      const baseAtk = r.atk * g + sum.FlatATK;
      this.stats = {
        atk: Math.round(baseAtk * (1 + sum.AttackPercent / 100)),
        atkBonus: Math.round(baseAtk * (1 + sum.AttackPercent / 100) - r.atk * g),
        maxHp: Math.round(r.hp * g + sum.FlatHP),
        maxMp: Math.round(r.mp * g + sum.FlatMP),
        def: Math.round(r.def * g + sum.FlatDEF),
        critRate: P.baseCritRate + sum.CritRate,
        critDmg: P.baseCritDamage + sum.CritDamage,
        elemDmg: sum.ElementalDamage,
        swords: P.baseSwords + sum.ProjectileCount,
        pierce: P.basePierce + sum.PierceCount,
        swordSpeed: P.swordSpeedMps * (1 + sum.ProjectileSpeed / 100),
        aoe: sum.AoERadius,
        moveSpeed: P.moveSpeedMps * (1 + sum.MoveSpeed / 100),
        thunder: sum.SpecialTrigger_ThunderOnHit,
        lifesteal: sum.SpecialTrigger_CritLifesteal,
        split: sum.SpecialTrigger_SwordSplit,
        resonance: res,
        resonanceCount: Object.values(res).filter(Boolean).length
      };
      this.inventory.capacity = D.inventory.baseSlots + bonusSlots;
      this.hp = Math.min(this.hp, this.stats.maxHp);
      this.mp = Math.min(this.mp, this.stats.maxMp);
    }

    /** Trang bị item từ túi. Trả về chuỗi lỗi hoặc null. */
    equip(item) {
      if (item.kind !== 'equip') return 'Không phải trang bị.';
      if (!item.identified) return 'Cần Giám Định (giữ chuột phải) trước khi trang bị.';
      const old = this.equipment[item.slot];
      this.inventory.removeItem(item);
      this.equipment[item.slot] = item;
      if (old) this.inventory.items.push(old);
      this.recompute();
      if (this.inventory.items.length > this.inventory.capacity) {
        // Tháo Nạp Giới làm túi tràn -> hoàn tác
        this.inventory.removeItem(old);
        this.equipment[item.slot] = old;
        this.inventory.items.push(item);
        this.recompute();
        return 'Túi đồ sẽ bị tràn khi đổi Nạp Giới này.';
      }
      return null;
    }

    unequip(slot) {
      const it = this.equipment[slot];
      if (!it) return null;
      const cap = this.inventory.capacity - I.ringBonusSlots(it);
      if (this.inventory.items.length + 1 > cap) return 'Túi đồ không đủ chỗ.';
      this.equipment[slot] = null;
      this.inventory.items.push(it);
      this.recompute();
      return null;
    }

    toJSON() {
      return { realm: this.realm, stage: this.stage, tuvi: this.tuvi, danDoc: this.danDoc, linhThach: this.linhThach,
        linhVan: this.linhVan, inventory: this.inventory.items, equipment: this.equipment, quickSlots: this.quickSlots,
        skin: this.skin, ownedSkins: this.ownedSkins, swordSkin: this.swordSkin, ownedSwordSkins: this.ownedSwordSkins };
    }

    static fromJSON(o) {
      const p = new PlayerState();
      Object.assign(p, { realm: o.realm, stage: o.stage, tuvi: o.tuvi, danDoc: o.danDoc, linhThach: o.linhThach, linhVan: o.linhVan || 0 });
      p.inventory.items = o.inventory || [];
      p.equipment = Object.assign(p.equipment, o.equipment || {});
      p.quickSlots = o.quickSlots || p.quickSlots;
      if (o.ownedSkins) p.ownedSkins = o.ownedSkins;
      if (o.skin && p.ownedSkins.includes(o.skin)) p.skin = o.skin;
      if (o.ownedSwordSkins) p.ownedSwordSkins = o.ownedSwordSkins;
      if (o.swordSkin && p.ownedSwordSkins.includes(o.swordSkin)) p.swordSkin = o.swordSkin;
      p.recompute();
      p.hp = p.stats.maxHp; p.mp = p.stats.maxMp;
      return p;
    }
  }

  TT.PlayerState = PlayerState;

  TT.Save = {
    save(state) {
      try { localStorage.setItem(D.world.autosaveKey, JSON.stringify(state)); } catch (e) { /* bộ nhớ đầy hoặc bị chặn */ }
    },
    load() {
      try {
        const s = localStorage.getItem(D.world.autosaveKey);
        return s ? PlayerState.fromJSON(JSON.parse(s)) : null;
      } catch (e) { return null; }
    },
    clear() { try { localStorage.removeItem(D.world.autosaveKey); } catch (e) { /* bỏ qua */ } }
  };
})(window.TT);
