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
      this.currentSectId = D.sects[0].id;
      this.sectContribution = 0;
      this.sectRankIndex = 0;
      this.sectQuestKills = 0;
      this.lastSectStipendAt = 0;
      this.currentClanId = null;
      this.inventory = new TT.Inventory();
      this.equipment = { Weapon: null, Armor: null, Ring: null, Boots: null, Accessory: null };
      this.quickSlots = D.startingKit.quickSlots.slice();
      this.skin = D.skins[0].id;
      this.ownedSkins = [D.skins[0].id];
      this.swordSkin = D.swordSkins[0].id;
      this.ownedSwordSkins = ['BANG_TINH', 'THANH_PHONG'];
      this.haloId = null;
      this.wingsId = null;
      this.eyeId = null;
      this.avatarSkin = null;
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

    /**
     * Nạp toàn bộ trang bị Thần Khí 5/5 Tương Sinh Ngũ Hành,
     * Cảnh giới Hóa Thần Đỉnh Phong, mở khóa toàn bộ Y Phục & Kiếm Hình demo xịn nhất.
     */
    giveUltimateDemoKit() {
      // 1. Cảnh giới tối cao: Hóa Thần (realm = 4), Đỉnh Phong (stage = 2)
      this.realm = 4;
      this.stage = 2;
      this.tuvi = 999999;
      this.danDoc = 0;
      this.linhThach = 999999;
      this.linhVan = 100;

      // 2. Mở khóa toàn bộ Y Phục (Skins) và Kiếm Hình (Sword Skins) & Thần Dực / Thần Luân
      this.ownedSkins = D.skins.map(s => s.id);
      this.skin = 'VAN_CO';
      this.ownedSwordSkins = D.swordSkins.map(s => s.id);
      this.swordSkin = D.swordSkins.some(s => s.id === 'S3_XICH_VIEM_CU_KIEM') ? 'S3_XICH_VIEM_CU_KIEM' : 'BANG_TINH';
      this.haloId = 'HALO_CRIMSON_SUN';
      this.wingsId = 'WINGS_GOLDEN_DAWN';
      this.eyeId = 'EYE_3';
      this.avatarSkin = 'AVATAR_URANOS';

      // 3. Khởi tạo túi đồ
      this.inventory.items = [];

      // 4. Tạo bộ 5 món THẦN KHÍ (ThanKhi) Cấp 15 kích hoạt trọn vẹn 5/5 Cộng Hưởng Ngũ Hành
      // Chuỗi Tương Sinh vòng tròn:
      // Weapon (Hỏa) -> Armor (Thổ) -> Ring (Kim) -> Boots (Thủy) -> Accessory (Mộc) -> Weapon (Hỏa)
      const lvl = 15;
      const growth = Math.pow(D.itemLevelGrowth, lvl - 1);

      // Weapon: Hệ Hỏa
      this.equipment.Weapon = {
        uid: TT.util.uid(), kind: 'equip', slot: 'Weapon', element: 'Hoa', rarity: 'ThanKhi', level: lvl,
        name: 'Vạn Cổ Hỗn Độn Kiếm', identified: true,
        affixes: [
          { AffixId: 'AFFIX_ATK_PERCENT', Tier: 5, RolledValue: 35.0, IsLocked: true },
          { AffixId: 'AFFIX_CRIT_RATE', Tier: 5, RolledValue: 14.0, IsLocked: true },
          { AffixId: 'AFFIX_CRIT_DMG', Tier: 5, RolledValue: 65.0, IsLocked: true },
          { AffixId: 'AFFIX_SWORD_COUNT', Tier: 5, RolledValue: 3, IsLocked: true },
          { AffixId: 'AFFIX_UNIQUE_THUNDER_CHAIN', Tier: 5, RolledValue: 150.0, IsLocked: true }
        ]
      };

      // Armor: Hệ Thổ (Hỏa sinh Thổ -> tương sinh từ Weapon)
      this.equipment.Armor = {
        uid: TT.util.uid(), kind: 'equip', slot: 'Armor', element: 'Tho', rarity: 'ThanKhi', level: lvl,
        name: 'Huyền Hoàng Bất Diệt Giáp', identified: true,
        affixes: [
          { AffixId: 'AFFIX_HP_FLAT', Tier: 5, RolledValue: Math.round(120 * growth), IsLocked: true },
          { AffixId: 'AFFIX_DEF_FLAT', Tier: 5, RolledValue: Math.round(18 * growth), IsLocked: true },
          { AffixId: 'AFFIX_MOVE_SPEED', Tier: 5, RolledValue: 18.0, IsLocked: true },
          { AffixId: 'AFFIX_HP_FLAT', Tier: 5, RolledValue: Math.round(110 * growth), IsLocked: true },
          { AffixId: 'AFFIX_DEF_FLAT', Tier: 5, RolledValue: Math.round(16 * growth), IsLocked: true }
        ]
      };

      // Ring: Hệ Kim (Thổ sinh Kim -> tương sinh từ Armor)
      this.equipment.Ring = {
        uid: TT.util.uid(), kind: 'equip', slot: 'Ring', element: 'Kim', rarity: 'ThanKhi', level: lvl,
        name: 'Cửu Thiên Giới Tử Giới', identified: true,
        affixes: [
          { AffixId: 'AFFIX_CRIT_RATE', Tier: 5, RolledValue: 14.0, IsLocked: true },
          { AffixId: 'AFFIX_ATK_FLAT', Tier: 5, RolledValue: Math.round(25 * growth), IsLocked: true },
          { AffixId: 'AFFIX_ELEM_DMG', Tier: 5, RolledValue: 32.0, IsLocked: true },
          { AffixId: 'AFFIX_DEF_FLAT', Tier: 5, RolledValue: Math.round(18 * growth), IsLocked: true },
          { AffixId: 'AFFIX_HP_FLAT', Tier: 5, RolledValue: Math.round(120 * growth), IsLocked: true }
        ]
      };

      // Boots: Hệ Thủy (Kim sinh Thủy -> tương sinh từ Ring)
      this.equipment.Boots = {
        uid: TT.util.uid(), kind: 'equip', slot: 'Boots', element: 'Thuy', rarity: 'ThanKhi', level: lvl,
        name: 'Đạp Hư Lăng Ba Hài', identified: true,
        affixes: [
          { AffixId: 'AFFIX_MOVE_SPEED', Tier: 5, RolledValue: 18.0, IsLocked: true },
          { AffixId: 'AFFIX_PROJ_SPEED', Tier: 5, RolledValue: 40.0, IsLocked: true },
          { AffixId: 'AFFIX_DEF_FLAT', Tier: 5, RolledValue: Math.round(18 * growth), IsLocked: true },
          { AffixId: 'AFFIX_HP_FLAT', Tier: 5, RolledValue: Math.round(120 * growth), IsLocked: true },
          { AffixId: 'AFFIX_MOVE_SPEED', Tier: 5, RolledValue: 16.0, IsLocked: true }
        ]
      };

      // Accessory: Hệ Mộc (Thủy sinh Mộc -> tương sinh từ Boots, Mộc sinh Hỏa -> truyền tương sinh cho Weapon)
      this.equipment.Accessory = {
        uid: TT.util.uid(), kind: 'equip', slot: 'Accessory', element: 'Moc', rarity: 'ThanKhi', level: lvl,
        name: 'Trường Sinh Bồ Đề Bội', identified: true,
        affixes: [
          { AffixId: 'AFFIX_ATK_PERCENT', Tier: 5, RolledValue: 35.0, IsLocked: true },
          { AffixId: 'AFFIX_CRIT_DMG', Tier: 5, RolledValue: 65.0, IsLocked: true },
          { AffixId: 'AFFIX_UNIQUE_CRIT_LIFESTEAL', Tier: 5, RolledValue: 12.0, IsLocked: true },
          { AffixId: 'AFFIX_UNIQUE_SWORD_SPLIT', Tier: 5, RolledValue: 45.0, IsLocked: true },
          { AffixId: 'AFFIX_CRIT_RATE', Tier: 5, RolledValue: 14.0, IsLocked: true }
        ]
      };

      // 5. Nạp đan dược và vật phẩm cao cấp
      const consumables = [
        ['HOI_HUYET_DAN', 99],
        ['HOI_LINH_DAN', 99],
        ['THANH_TAM_DAN', 99],
        ['TI_LOI_PHU', 99],
        ['HUYEN_QUY_GIAP', 99],
        ['KET_DAN_DAN', 99],
        ['TAY_LUYEN_THACH', 999],
        ['DINH_HON_CHAU', 99],
        ['YEU_DAN', 99],
        ['BANG_TAM_HOA', 99]
      ];
      consumables.forEach(([id, count]) => {
        this.inventory.add(I.createStack(id, count));
      });

      this.quickSlots = ['HOI_HUYET_DAN', 'HOI_LINH_DAN', 'THANH_TAM_DAN', 'TI_LOI_PHU'];

      // 6. Tính toán lại toàn bộ chỉ số và đầy máu/mana
      this.recompute();
      this.hp = this.stats.maxHp;
      this.mp = this.stats.maxMp;
    }

    get realmDef() { return D.realms[this.realm]; }
    get currentSect() { return D.sects.find(sect => sect.id === this.currentSectId) || D.sects[0]; }
    get currentClan() { return D.clans.find(clan => clan.id === this.currentClanId) || null; }
    get sectRank() { return D.sectRanks[this.sectRankIndex] || D.sectRanks[0]; }
    get sectTitle() {
      return this.currentClan
        ? `[${this.currentClan.title} • ${this.currentSect.shortName} ${this.sectRank.title}]`
        : `[${this.currentSect.shortName} ${this.sectRank.title}]`;
    }
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

    addDanDoc(n) {
      const sect = this.currentSect;
      const adjusted = n > 0 ? n * (sect.buffs.danDocGainMultiplier || 1) : n;
      this.danDoc = TT.util.clamp(this.danDoc + adjusted, 0, 100);
    }

    /** Ghi nhận cống hiến và trả về số bậc có thể thăng tiếp. */
    addSectContribution(amount) {
      if (!Number.isFinite(amount) || amount <= 0) return false;
      this.sectContribution += Math.floor(amount);
      return this.canPromoteSectRank();
    }

    canPromoteSectRank() {
      const next = D.sectRanks[this.sectRankIndex + 1];
      return !!next && this.sectContribution >= next.contribution;
    }

    promoteSectRank() {
      if (!this.canPromoteSectRank()) return false;
      this.sectRankIndex++;
      this.recompute();
      return true;
    }

    addSectQuestKill() {
      this.sectQuestKills = Math.min(D.sectSystem.questKills, this.sectQuestKills + 1);
      return this.sectQuestKills >= D.sectSystem.questKills;
    }

    claimSectQuestReward() {
      if (this.sectQuestKills < D.sectSystem.questKills) return false;
      this.sectQuestKills = 0;
      this.addSectContribution(D.sectSystem.questContribution);
      return true;
    }

    claimSectStipend(now) {
      const rank = this.sectRank;
      const currentTime = Number.isFinite(now) ? now : Date.now();
      if (rank.stipend <= 0 || currentTime - this.lastSectStipendAt < D.sectSystem.stipendIntervalMs) return 0;
      this.lastSectStipendAt = currentTime;
      this.linhThach += rank.stipend;
      return rank.stipend;
    }

    joinSect(id) {
      const sect = D.sects.find(item => item.id === id);
      if (!sect) return 'Tông môn không hợp lệ.';
      if (sect.id === this.currentSectId) return 'Bạn đã ở trong tông môn này.';
      const cost = D.sectSystem.sectChangeCost;
      if (this.linhThach < cost) return `Cần ${TT.util.fmt(cost)} Linh Thạch để đổi tông.`;
      this.linhThach -= cost;
      this.currentSectId = sect.id;
      this.recompute();
      return null;
    }

    chooseClan(id) {
      const clan = D.clans.find(item => item.id === id);
      if (!clan) return 'Gia tộc không hợp lệ.';
      if (clan.id === this.currentClanId) return 'Bạn đã mang huyết mạch này.';
      const cost = this.currentClanId ? D.sectSystem.clanChangeCost : 0;
      if (this.linhThach < cost) return `Cần ${TT.util.fmt(cost)} Linh Thạch để tẩy tủy đổi huyết mạch.`;
      this.linhThach -= cost;
      this.currentClanId = clan.id;
      this.recompute();
      return null;
    }

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
      const sect = this.currentSect, clan = this.currentClan, rank = this.sectRank;
      const clanBuffs = clan ? clan.buffs : {};
      const rankMultiplier = 1 + rank.statPct / 100;
      const attackMultiplier = 1 + (sum.AttackPercent + (clanBuffs.attackPct || 0)) / 100;
      this.stats = {
        atk: Math.round(baseAtk * attackMultiplier * rankMultiplier),
        atkBonus: Math.round(baseAtk * attackMultiplier * rankMultiplier - r.atk * g),
        maxHp: Math.round((r.hp * g + sum.FlatHP) * (1 + (clanBuffs.maxHpPct || 0) / 100) * rankMultiplier),
        maxMp: Math.round((r.mp * g + sum.FlatMP) * rankMultiplier),
        def: Math.round(r.def * g + sum.FlatDEF),
        critRate: P.baseCritRate + sum.CritRate + (clanBuffs.critRate || 0),
        critDmg: P.baseCritDamage + sum.CritDamage,
        elemDmg: sum.ElementalDamage,
        swords: P.baseSwords + sum.ProjectileCount + (clanBuffs.additionalSwords || 0),
        pierce: P.basePierce + sum.PierceCount,
        swordSpeed: P.swordSpeedMps * (1 + sum.ProjectileSpeed / 100),
        aoe: sum.AoERadius,
        moveSpeed: P.moveSpeedMps * (1 + (sum.MoveSpeed + (sect.buffs.moveSpeedPct || 0)) / 100),
        thunder: sum.SpecialTrigger_ThunderOnHit,
        lifesteal: sum.SpecialTrigger_CritLifesteal,
        split: sum.SpecialTrigger_SwordSplit,
        sectSwordDamagePct: sect.buffs.swordDamagePct || 0,
        sectLifesteal: sect.buffs.lifesteal || 0,
        sectLowHpDamagePct: sect.buffs.lowHpDamagePct || 0,
        sectShieldMpCostReduction: sect.buffs.shieldMpCostReduction || 0,
        sectDashCooldownReduction: sect.buffs.dashCooldownReduction || 0,
        sectChainEvery: sect.buffs.chainEvery || 0,
        sectPotionEffectPct: sect.buffs.potionEffectPct || 0,
        sectHpRegenPctPerSec: sect.buffs.hpRegenPctPerSec || 0,
        sectShieldDamageReductionPct: sect.buffs.shieldDamageReductionPct || 0,
        sectAttackSlowPct: sect.buffs.attackSlowPct || 0,
        sectAttackSlowDurationSec: sect.buffs.attackSlowDurationSec || 0,
        sectFreezeChance: sect.buffs.freezeChance || 0,
        sectFreezeDurationSec: sect.buffs.freezeDurationSec || 0,
        clanDamageReduction: clanBuffs.damageReduction || 0,
        clanLightningResistance: clanBuffs.lightningResistance || 0,
        clanLinhThachDropPct: clanBuffs.linhThachDropPct || 0,
        clanShopDiscount: clanBuffs.shopDiscount || 0,
        clanBurnDamagePctPerSec: clanBuffs.burnDamagePctPerSec || 0,
        clanBurnDurationSec: clanBuffs.burnDurationSec || 0,
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
        skin: this.skin, ownedSkins: this.ownedSkins, swordSkin: this.swordSkin, ownedSwordSkins: this.ownedSwordSkins,
        haloId: this.haloId, wingsId: this.wingsId, eyeId: this.eyeId, avatarSkin: this.avatarSkin,
        currentSectId: this.currentSectId, sectContribution: this.sectContribution, sectRankIndex: this.sectRankIndex,
        sectQuestKills: this.sectQuestKills, lastSectStipendAt: this.lastSectStipendAt, currentClanId: this.currentClanId };
    }

    static fromJSON(o) {
      const p = new PlayerState();
      Object.assign(p, { realm: o.realm, stage: o.stage, tuvi: o.tuvi, danDoc: o.danDoc, linhThach: o.linhThach, linhVan: o.linhVan || 0 });
      if (D.sects.some(sect => sect.id === o.currentSectId)) p.currentSectId = o.currentSectId;
      if (D.clans.some(clan => clan.id === o.currentClanId)) p.currentClanId = o.currentClanId;
      p.sectContribution = Number.isFinite(o.sectContribution) ? Math.max(0, o.sectContribution) : 0;
      p.sectRankIndex = Number.isInteger(o.sectRankIndex) ? Math.max(0, Math.min(D.sectRanks.length - 1, o.sectRankIndex)) : 0;
      p.sectQuestKills = Number.isFinite(o.sectQuestKills) ? Math.max(0, Math.min(D.sectSystem.questKills, o.sectQuestKills)) : 0;
      p.lastSectStipendAt = Number.isFinite(o.lastSectStipendAt) ? Math.max(0, o.lastSectStipendAt) : 0;
      p.inventory.items = o.inventory || [];
      p.equipment = Object.assign(p.equipment, o.equipment || {});
      p.quickSlots = o.quickSlots || p.quickSlots;
      p.haloId = o.haloId || null;
      p.wingsId = o.wingsId || null;
      p.eyeId = o.eyeId || null;
      p.avatarSkin = o.avatarSkin || null;
      if (o.ownedSkins) p.ownedSkins = o.ownedSkins;
      if (o.skin && p.ownedSkins.includes(o.skin)) p.skin = o.skin;
      if (o.ownedSwordSkins) {
        p.ownedSwordSkins = o.ownedSwordSkins;
        if (!p.ownedSwordSkins.includes('BANG_TINH')) p.ownedSwordSkins.push('BANG_TINH');
      }
      if (o.swordSkin && p.ownedSwordSkins.includes(o.swordSkin)) {
        p.swordSkin = o.swordSkin;
      } else {
        p.swordSkin = 'BANG_TINH';
      }
      while (p.sectRankIndex > 0 && p.sectContribution < D.sectRanks[p.sectRankIndex].contribution) p.sectRankIndex--;
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
