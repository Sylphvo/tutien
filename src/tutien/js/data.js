window.TT = window.TT || {};

/**
 * TT.DATA — toàn bộ số liệu cân bằng game (data-driven theo GDD tailieugame.md).
 * Chỉnh sửa file này để cân bằng mà không cần đụng vào logic.
 * Đơn vị khoảng cách: mét (1m = DATA.world.pixelsPerMeter pixel).
 */
window.TT.DATA = {
  world: {
    pixelsPerMeter: 32,
    bicanhSizeM: 70,
    dongphuSizeM: 26,
    pickupMagnetM: 2.2,
    autosaveKey: 'tutien_save_v1'
  },

  // ---- Ngũ Hành (GDD 1.2) -------------------------------------------------
  elements: {
    order: ['Kim', 'Thuy', 'Moc', 'Hoa', 'Tho'],
    names: { Kim: 'Kim', Thuy: 'Thủy', Moc: 'Mộc', Hoa: 'Hỏa', Tho: 'Thổ' },
    colors: { Kim: '#F2D46B', Thuy: '#4FB3FF', Moc: '#5BD66A', Hoa: '#FF5A36', Tho: '#C9925A' },
    // A sinh B
    generates: { Kim: 'Thuy', Thuy: 'Moc', Moc: 'Hoa', Hoa: 'Tho', Tho: 'Kim' },
    resonanceBonus: 0.15
  },

  // ---- Ô trang bị (theo vòng tròn wireframe 5.1) ---------------------------
  equipSlots: [
    { id: 'Weapon', name: 'Pháp Bảo' },
    { id: 'Armor', name: 'Linh Giáp' },
    { id: 'Ring', name: 'Nạp Giới' },
    { id: 'Boots', name: 'Hài' },
    { id: 'Accessory', name: 'Ngọc Bội' }
  ],

  // Chỉ số gốc theo ô. value = base * growth^(itemLevel-1)
  slotBaseStats: {
    Weapon: { FlatATK: 8, ProjectileCount: 1 },
    Armor: { FlatHP: 45, FlatDEF: 4 },
    Ring: { FlatDEF: 2, FlatMP: 15 },
    Boots: { FlatHP: 20, FlatDEF: 2 },
    Accessory: { FlatATK: 4, FlatHP: 25 }
  },
  // Các chỉ số không nhân theo cấp
  nonScalingBaseStats: ['ProjectileCount'],
  itemLevelGrowth: 1.5,

  slotBaseNames: {
    Weapon: ['Phi Kiếm', 'Linh Kiếm', 'Kiếm Hoàn'],
    Armor: ['Đạo Bào', 'Hộ Tâm Kính', 'Linh Giáp'],
    Ring: ['Nạp Giới', 'Trữ Vật Giới'],
    Boots: ['Vân Hài', 'Đạp Phong Hài'],
    Accessory: ['Ngọc Bội', 'Hộ Thân Phù Ngọc']
  },
  elementNamePrefix: {
    Kim: ['Canh Kim', 'Thiên Cương', 'Kim Quang'],
    Thuy: ['Huyền Băng', 'Thanh Thủy', 'Hàn Đàm'],
    Moc: ['Thanh Vân', 'Bích Lạc', 'Thanh Mộc'],
    Hoa: ['Xích Hỏa', 'Liệt Diễm', 'Chu Tước'],
    Tho: ['Huyền Thổ', 'Hậu Thổ', 'Sơn Nhạc']
  },

  // ---- Túi đồ (GDD 1.2) ----------------------------------------------------
  inventory: {
    baseSlots: 12,
    // Nạp Giới mở rộng thêm ô theo phẩm chất
    ringBonusSlots: { PhapKhi: 12, LinhKhi: 12, BaoKhi: 24, TienKhi: 24, ThanKhi: 48 },
    identifyMpCost: 50,
    identifyHoldSec: 1.0
  },

  // ---- Phẩm chất (GDD 2.2) -------------------------------------------------
  rarities: [
    { id: 'PhapKhi', name: 'Pháp Khí', color: '#FFFFFF', affixCount: 1, minTier: 1, maxTier: 2, maxUnique: 0, dropWeight: 55, sellPrice: 10 },
    { id: 'LinhKhi', name: 'Linh Khí', color: '#2ECC71', affixCount: 2, minTier: 1, maxTier: 3, maxUnique: 0, dropWeight: 28, sellPrice: 25 },
    { id: 'BaoKhi', name: 'Bảo Khí', color: '#3498DB', affixCount: 3, minTier: 1, maxTier: 4, maxUnique: 0, dropWeight: 12, sellPrice: 60 },
    { id: 'TienKhi', name: 'Tiên Khí', color: '#9B59B6', affixCount: 4, minTier: 1, maxTier: 5, maxUnique: 1, dropWeight: 4, sellPrice: 160 },
    { id: 'ThanKhi', name: 'Thần Khí', color: '#F39C12', affixCount: 5, minTier: 2, maxTier: 5, maxUnique: 2, dropWeight: 1, sellPrice: 400 }
  ],
  bossRarityWeights: { PhapKhi: 0, LinhKhi: 30, BaoKhi: 40, TienKhi: 22, ThanKhi: 8 },

  // ---- Tẩy Luyện (GDD 2.3) -------------------------------------------------
  reroll: {
    baseCost: 20,               // BaseCost trong công thức
    tayLuyenThachPerRoll: 1,    // Tẩy Luyện Thạch mỗi lần
    pityMax: 100                // Linh Vận
  },

  // ---- affix_pool.json (GDD 4.1, mở rộng thêm từ tố) -----------------------
  affixPool: {
    TierWeights: [
      { Tier: 1, Weight: 500, ColorHex: '#FFFFFF', Name: 'Hạ Phẩm' },
      { Tier: 2, Weight: 300, ColorHex: '#2ECC71', Name: 'Trung Phẩm' },
      { Tier: 3, Weight: 140, ColorHex: '#3498DB', Name: 'Thượng Phẩm' },
      { Tier: 4, Weight: 50, ColorHex: '#9B59B6', Name: 'Cực Phẩm' },
      { Tier: 5, Weight: 10, ColorHex: '#F39C12', Name: 'Tiên Phẩm' }
    ],
    AffixDefinitions: [
      // Prefix
      { AffixId: 'AFFIX_ATK_PERCENT', Name: 'Khung Thương', Category: 'Prefix', ApplicableSlots: ['Weapon', 'Accessory'], StatType: 'AttackPercent',
        DescriptionTemplate: 'Tăng {0}% Công kích cơ bản',
        TierRanges: { 1: { Min: 3.0, Max: 6.0, IsInteger: false }, 2: { Min: 6.5, Max: 10.0, IsInteger: false }, 3: { Min: 10.5, Max: 15.0, IsInteger: false }, 4: { Min: 16.0, Max: 22.0, IsInteger: false }, 5: { Min: 25.0, Max: 35.0, IsInteger: false } } },
      { AffixId: 'AFFIX_ATK_FLAT', Name: 'Phá Quân', Category: 'Prefix', ApplicableSlots: ['Weapon', 'Ring', 'Accessory'], StatType: 'FlatATK', ScalesWithLevel: true,
        DescriptionTemplate: 'Công kích +{0}',
        TierRanges: { 1: { Min: 2, Max: 4, IsInteger: true }, 2: { Min: 4, Max: 7, IsInteger: true }, 3: { Min: 7, Max: 11, IsInteger: true }, 4: { Min: 11, Max: 16, IsInteger: true }, 5: { Min: 17, Max: 25, IsInteger: true } } },
      { AffixId: 'AFFIX_HP_FLAT', Name: 'Trường Sinh', Category: 'Prefix', ApplicableSlots: ['Armor', 'Boots', 'Accessory', 'Ring'], StatType: 'FlatHP', ScalesWithLevel: true,
        DescriptionTemplate: 'Sinh lực +{0}',
        TierRanges: { 1: { Min: 10, Max: 20, IsInteger: true }, 2: { Min: 20, Max: 35, IsInteger: true }, 3: { Min: 35, Max: 55, IsInteger: true }, 4: { Min: 55, Max: 80, IsInteger: true }, 5: { Min: 85, Max: 120, IsInteger: true } } },
      { AffixId: 'AFFIX_DEF_FLAT', Name: 'Kim Cương', Category: 'Prefix', ApplicableSlots: ['Armor', 'Boots', 'Ring'], StatType: 'FlatDEF', ScalesWithLevel: true,
        DescriptionTemplate: 'Phòng ngự +{0}',
        TierRanges: { 1: { Min: 1, Max: 3, IsInteger: true }, 2: { Min: 3, Max: 5, IsInteger: true }, 3: { Min: 5, Max: 8, IsInteger: true }, 4: { Min: 8, Max: 12, IsInteger: true }, 5: { Min: 12, Max: 18, IsInteger: true } } },
      { AffixId: 'AFFIX_CRIT_RATE', Name: 'Tuệ Nhãn', Category: 'Prefix', ApplicableSlots: ['Weapon', 'Ring', 'Accessory'], StatType: 'CritRate',
        DescriptionTemplate: 'Tỷ lệ chí mạng +{0}%',
        TierRanges: { 1: { Min: 1.0, Max: 2.0, IsInteger: false }, 2: { Min: 2.5, Max: 4.0, IsInteger: false }, 3: { Min: 4.5, Max: 6.0, IsInteger: false }, 4: { Min: 6.5, Max: 9.0, IsInteger: false }, 5: { Min: 10.0, Max: 14.0, IsInteger: false } } },
      { AffixId: 'AFFIX_CRIT_DMG', Name: 'Diệt Hồn', Category: 'Prefix', ApplicableSlots: ['Weapon', 'Accessory'], StatType: 'CritDamage',
        DescriptionTemplate: 'Sát thương chí mạng +{0}%',
        TierRanges: { 1: { Min: 5, Max: 10, IsInteger: false }, 2: { Min: 10, Max: 18, IsInteger: false }, 3: { Min: 18, Max: 28, IsInteger: false }, 4: { Min: 28, Max: 40, IsInteger: false }, 5: { Min: 45, Max: 65, IsInteger: false } } },
      { AffixId: 'AFFIX_ELEM_DMG', Name: 'Ngũ Hành Chi Lực', Category: 'Prefix', ApplicableSlots: ['Weapon', 'Ring'], StatType: 'ElementalDamage',
        DescriptionTemplate: 'Sát thương Ngũ Hành +{0}%',
        TierRanges: { 1: { Min: 3, Max: 6, IsInteger: false }, 2: { Min: 6, Max: 10, IsInteger: false }, 3: { Min: 10, Max: 15, IsInteger: false }, 4: { Min: 15, Max: 22, IsInteger: false }, 5: { Min: 24, Max: 32, IsInteger: false } } },
      // Suffix
      { AffixId: 'AFFIX_SWORD_COUNT', Name: 'Phân Quang', Category: 'Suffix', ApplicableSlots: ['Weapon'], StatType: 'ProjectileCount',
        DescriptionTemplate: 'Số lượng Phi Kiếm xuất trận +{0}',
        TierRanges: { 1: { Min: 1, Max: 1, IsInteger: true }, 2: { Min: 1, Max: 1, IsInteger: true }, 3: { Min: 1, Max: 2, IsInteger: true }, 4: { Min: 2, Max: 2, IsInteger: true }, 5: { Min: 2, Max: 3, IsInteger: true } } },
      { AffixId: 'AFFIX_PIERCE_COUNT', Name: 'Xuyên Vân', Category: 'Suffix', ApplicableSlots: ['Weapon'], StatType: 'PierceCount',
        DescriptionTemplate: 'Phi Kiếm đâm xuyên thêm +{0} mục tiêu trước khi quay về',
        TierRanges: { 1: { Min: 1, Max: 1, IsInteger: true }, 2: { Min: 1, Max: 2, IsInteger: true }, 3: { Min: 2, Max: 2, IsInteger: true }, 4: { Min: 2, Max: 3, IsInteger: true }, 5: { Min: 3, Max: 4, IsInteger: true } } },
      { AffixId: 'AFFIX_PROJ_SPEED', Name: 'Truy Phong', Category: 'Suffix', ApplicableSlots: ['Weapon', 'Boots'], StatType: 'ProjectileSpeed',
        DescriptionTemplate: 'Tốc độ bay Phi Kiếm +{0}%',
        TierRanges: { 1: { Min: 4, Max: 8, IsInteger: false }, 2: { Min: 8, Max: 12, IsInteger: false }, 3: { Min: 12, Max: 18, IsInteger: false }, 4: { Min: 18, Max: 25, IsInteger: false }, 5: { Min: 28, Max: 40, IsInteger: false } } },
      { AffixId: 'AFFIX_AOE_RADIUS', Name: 'Bạo Liệt', Category: 'Suffix', ApplicableSlots: ['Weapon', 'Accessory'], StatType: 'AoERadius',
        DescriptionTemplate: 'Kiếm khí nổ khi trúng, bán kính +{0}m',
        TierRanges: { 1: { Min: 0.3, Max: 0.5, IsInteger: false }, 2: { Min: 0.5, Max: 0.8, IsInteger: false }, 3: { Min: 0.8, Max: 1.1, IsInteger: false }, 4: { Min: 1.1, Max: 1.5, IsInteger: false }, 5: { Min: 1.6, Max: 2.2, IsInteger: false } } },
      { AffixId: 'AFFIX_MOVE_SPEED', Name: 'Thần Hành', Category: 'Suffix', ApplicableSlots: ['Boots', 'Armor'], StatType: 'MoveSpeed',
        DescriptionTemplate: 'Tốc độ di chuyển +{0}%',
        TierRanges: { 1: { Min: 2, Max: 4, IsInteger: false }, 2: { Min: 4, Max: 6, IsInteger: false }, 3: { Min: 6, Max: 9, IsInteger: false }, 4: { Min: 9, Max: 12, IsInteger: false }, 5: { Min: 13, Max: 18, IsInteger: false } } },
      // Unique (chỉ Tier 4-5)
      { AffixId: 'AFFIX_UNIQUE_THUNDER_CHAIN', Name: 'Thiên Lôi Dẫn', Category: 'Unique', ApplicableSlots: ['Weapon'], StatType: 'SpecialTrigger_ThunderOnHit',
        DescriptionTemplate: 'Mỗi đòn đâm thứ 5 giáng Cửu Thiên Lôi gây {0}% sát thương hệ Lôi',
        TierRanges: { 4: { Min: 60.0, Max: 90.0, IsInteger: false }, 5: { Min: 100.0, Max: 150.0, IsInteger: false } } },
      { AffixId: 'AFFIX_UNIQUE_CRIT_LIFESTEAL', Name: 'Huyết Ma Phệ', Category: 'Unique', ApplicableSlots: ['Weapon', 'Accessory'], StatType: 'SpecialTrigger_CritLifesteal',
        DescriptionTemplate: 'Đòn chí mạng hút {0}% sát thương thành Sinh lực',
        TierRanges: { 4: { Min: 4, Max: 7, IsInteger: false }, 5: { Min: 8, Max: 12, IsInteger: false } } },
      { AffixId: 'AFFIX_UNIQUE_SWORD_SPLIT', Name: 'Kiếm Khí Tung Hoành', Category: 'Unique', ApplicableSlots: ['Weapon'], StatType: 'SpecialTrigger_SwordSplit',
        DescriptionTemplate: '{0}% cơ hội tách 2 đạo kiếm khí khi đâm trúng',
        TierRanges: { 4: { Min: 15, Max: 25, IsInteger: false }, 5: { Min: 30, Max: 45, IsInteger: false } } }
    ]
  },

  // ---- Cảnh giới -----------------------------------------------------------
  stageNames: ['Sơ Kỳ', 'Trung Kỳ', 'Hậu Kỳ'],
  realms: [
    { id: 'LUYEN_KHI', name: 'Luyện Khí', tuviPerStage: 60, hp: 300, atk: 15, mp: 120, def: 2, tribulation: null },
    { id: 'TRUC_CO', name: 'Trúc Cơ', tuviPerStage: 220, hp: 1000, atk: 50, mp: 220, def: 8, tribulation: 'TRUC_CO' },
    { id: 'KIM_DAN', name: 'Kim Đan', tuviPerStage: 800, hp: 3500, atk: 170, mp: 400, def: 25, tribulation: 'KIM_DAN' },
    { id: 'NGUYEN_ANH', name: 'Nguyên Anh', tuviPerStage: 3000, hp: 12000, atk: 600, mp: 800, def: 80, tribulation: 'NGUYEN_ANH' },
    { id: 'HOA_THAN', name: 'Hóa Thần', tuviPerStage: 999999, hp: 40000, atk: 2000, mp: 1600, def: 250, tribulation: null, final: true }
  ],
  stageStatGrowth: 0.25, // +25% chỉ số mỗi tiểu cảnh giới

  player: {
    baseCritRate: 5,
    baseCritDamage: 150,
    basePierce: 1,
    baseSwords: 1,
    swordSpeedMps: 14,
    swordRangeM: 9,
    swordFireInterval: 0.16,
    moveSpeedMps: 5.2,
    mpRegenPerSec: 4,
    dash: { distanceM: 4.2, durationSec: 0.15, cooldownSec: 0.8, mpCost: 10 },
    shield: { damageReduction: 0.5, mpPerSec: 15, slow: 0.3 },
    radiusM: 0.45,
    hurtInvulnSec: 0.4
  },

  // ---- Độ Kiếp (GDD 3) -----------------------------------------------------
  tribulations: {
    TRUC_CO: { name: 'Trúc Cơ Kiếp', waves: 3, radiusM: 12, baseDamage: 150, scorchSec: 2.05,
      pattern: [['track'], ['track'], ['track', 'final']] },
    KIM_DAN: { name: 'Kim Đan Kiếp', waves: 6, radiusM: 14, baseDamage: 600, scorchSec: 2.05,
      pattern: [['track'], ['track'], ['grid'], ['track', 'grid'], ['grid', 'track'], ['track', 'final']] },
    NGUYEN_ANH: { name: 'Nguyên Anh Kiếp', waves: 9, radiusM: 16, baseDamage: 2500, scorchSec: 6.0,
      pattern: [['track'], ['grid'], ['track', 'grid'], ['track', 'track'], ['grid', 'grid'], ['track', 'grid'], ['track', 'grid', 'track'], ['grid', 'track', 'grid'], ['track', 'grid', 'final']] }
  },
  lightning: {
    warnRadiusM: 2.5,
    trackEnd: 0.5, lockEnd: 0.8, strikeEnd: 0.95, hitWindow: 0.1,
    trackSpeedMps: 2.2,
    scorchDpsRatio: 0.15,
    scorchSlow: 0.3,
    trackStrikesBase: 2,     // số tia mỗi lượt truy kích = base + floor(k/2)
    trackInterval: 0.65,
    gridSpacingM: 3.4,
    finalRadiusM: 4.5,
    finalRing: 8,
    waveGapSec: 3.0,
    danDocDivisor: 200,
    stepK: 0.25,
    maxFormationReduction: 0.6
  },
  failTuviLoss: 0.3,

  // ---- Tông Môn & Tu Tiên Thế Gia -----------------------------------------
  sects: [
    { id: 'THIEN_KIEM', name: 'Thiên Kiếm Tông', shortName: 'Thiên Kiếm', alignment: 'Chính Đạo', discipline: 'Kiếm Tu',
      badge: { col: 2, row: 1 },
      description: 'Tông môn khởi đầu, lấy Ngự Kiếm Thuật và Kiếm Trận làm căn cơ.',
      color: '#38bdf8', robe: '#e8f4fb', buffs: { swordDamagePct: 20, shieldMpCostReduction: 0.15 },
      ultimate: { id: 'sword_storm', name: 'Vạn Kiếm Quy Tông', description: 'Triệu hồi mưa kiếm quanh người, gây sát thương diện rộng.' } },
    { id: 'HUYET_MA', name: 'Huyết Ma Giáo', shortName: 'Huyết Ma', alignment: 'Ma Đạo', discipline: 'Huyết Tu & Trảm Đao',
      badge: { col: 3, row: 0 },
      description: 'Cuồng bạo hút máu, lấy chiến dưỡng chiến; càng cận kề sinh tử, sát thương càng lớn.',
      color: '#ef4444', robe: '#38151a', buffs: { lifesteal: 0.15, lowHpDamagePct: 35 },
      ultimate: { id: 'blood_tide', name: 'Huyết Hải Cuồng Đào', description: 'Tạo vòng huyết sát gây sát thương và hút máu kẻ địch xung quanh.' } },
    { id: 'CUU_TIEU', name: 'Cửu Tiêu Lôi Các', shortName: 'Cửu Tiêu', alignment: 'Chính Đạo', discipline: 'Lôi Pháp & Tốc Độ',
      badge: { col: 4, row: 0 },
      description: 'Ngự lôi khống địch, thân pháp và xuất chiêu nhanh như chớp.',
      color: '#a855f7', robe: '#30204a', buffs: { moveSpeedPct: 25, chainEvery: 3, dashCooldownReduction: 0.2 },
      ultimate: { id: 'thunderfall', name: 'Cửu Thiên Thần Lôi', description: 'Giáng thiên lôi liên hoàn lên các yêu thú trong vùng.' } },
    { id: 'DUOC_VUONG', name: 'Dược Vương Cốc', shortName: 'Dược Vương', alignment: 'Trung Lập', discipline: 'Đan Đạo & Mộc Linh',
      badge: { col: 1, row: 0 },
      description: 'Am tường đan đạo, kháng độc và hồi phục bền bỉ.',
      color: '#10b981', robe: '#f3d9e8', buffs: { danDocGainMultiplier: 0.5, potionEffectPct: 30, hpRegenPctPerSec: 0.02 },
      ultimate: { id: 'spring_blossom', name: 'Vạn Hoa Hồi Xuân', description: 'Hồi phục sinh lực, linh lực và giải trừ toàn bộ Đan Độc.' } },
    { id: 'HAN_BANG', name: 'Hàn Băng Cung', shortName: 'Hàn Băng', alignment: 'Ẩn Thế', discipline: 'Băng Tuyết & Khống Chế',
      badge: { col: 4, row: 1 },
      description: 'Băng phong vạn vật, lấy hàn khí dựng nên phòng tuyến tuyệt đối.',
      color: '#67e8f9', robe: '#dff7fb', buffs: { attackSlowPct: 30, attackSlowDurationSec: 1.5, freezeChance: 0.15, freezeDurationSec: 1.5, shieldDamageReductionPct: 0.25 },
      ultimate: { id: 'absolute_zero', name: 'Tuyệt Đối Linh Độ', description: 'Đóng băng toàn bộ yêu thú trong phạm vi rộng.' } }
  ],
  clans: [
    { id: 'DU_GU', name: 'Độc Cô Thế Gia', title: 'Độc Cô Thị', epithet: 'Kiếm Đạo Thế Gia',
      badge: { col: 0, row: 0 },
      description: 'Huyết mạch Kiếm Tâm Thông Minh, kiếm ý sáng tỏ từ thuở sơ khai.',
      color: '#93c5fd', buffs: { additionalSwords: 1, critRate: 10 } },
    { id: 'VIEM_HOANG', name: 'Viêm Hoàng Cổ Tộc', title: 'Viêm Hoàng', epithet: 'Thượng Cổ Hỏa Tộc',
      badge: { col: 2, row: 0 },
      description: 'Thái Dương Chân Hỏa thiêu đốt linh mạch, khiến mỗi đòn đánh đều mang hỏa độc.',
      color: '#fb923c', buffs: { attackPct: 15, burnDamagePctPerSec: 8, burnDurationSec: 3 } },
    { id: 'BAC_MINH', name: 'Bắc Minh Gia Tộc', title: 'Bắc Minh', epithet: 'Thương Hội & Linh Mạch',
      badge: { col: 3, row: 1 },
      description: 'Nắm giữ linh mạch và thương hội rộng khắp, của cải tích tụ như biển.',
      color: '#67e8f9', buffs: { linhThachDropPct: 35, shopDiscount: 0.2 } },
    { id: 'CO_THAN', name: 'Cổ Thần Nhất Tộc', title: 'Cổ Thần', epithet: 'Luyện Thể Thế Gia',
      badge: { col: 1, row: 1 },
      description: 'Kim Cương Bất Hoại, lấy thân thể làm lò luyện và chống đỡ thiên lôi.',
      color: '#fbbf24', buffs: { maxHpPct: 30, damageReduction: 0.15, lightningResistance: 0.15 } }
  ],
  sectRanks: [
    { name: 'Tạp Dịch Đệ Tử', title: 'Tạp Dịch', contribution: 0, statPct: 0, stipend: 0 },
    { name: 'Ngoại Môn Đệ Tử', title: 'Ngoại Môn', contribution: 200, statPct: 2, stipend: 50 },
    { name: 'Nội Môn Đệ Tử', title: 'Nội Môn', contribution: 600, statPct: 4, stipend: 100 },
    { name: 'Chân Truyền Đệ Tử', title: 'Chân Truyền', contribution: 1500, statPct: 6, stipend: 200 },
    { name: 'Hộ Pháp Trưởng Lão', title: 'Hộ Pháp', contribution: 3000, statPct: 8, stipend: 400 },
    { name: 'Thái Thượng Trưởng Lão', title: 'Thái Thượng', contribution: 6000, statPct: 10, stipend: 800 }
  ],
  sectSystem: {
    sectChangeCost: 5000,
    clanChangeCost: 10000,
    questKills: 10,
    questContribution: 50,
    stipendIntervalMs: 86400000,
    ultimate: { mpCostPct: 30, cooldownSec: 60, multiStrikeCount: 3, strikeIntervalSec: 0.22, damageMultiplier: 1.5, bloodHealPct: 0.15, springHealPct: 0.6, springMpPct: 0.6,
      springBarrierSec: 5, springBarrierReduction: 0.5,
      ranges: { swordStormM: 4.5, bloodTideM: 5, thunderfallM: 7, absoluteZeroM: 12 } }
  },

  // ---- Vật phẩm không phải trang bị ---------------------------------------
  // category: Consumable | Material | Gem | SkillBook
  items: {
    HOI_HUYET_DAN: { name: 'Hồi Huyết Đan', category: 'Consumable', maxStack: 99, color: '#E74C3C', icon: 'pill',
      desc: 'Hồi 40% Sinh lực. Đan độc +8.', effect: { healPct: 0.4, danDoc: 8 }, price: 15 },
    HOI_LINH_DAN: { name: 'Hồi Linh Đan', category: 'Consumable', maxStack: 99, color: '#3FA9F5', icon: 'pill',
      desc: 'Hồi 50% Linh lực. Đan độc +5.', effect: { mpPct: 0.5, danDoc: 5 }, price: 12 },
    TU_KHI_DAN: { name: 'Tụ Khí Đan', category: 'Consumable', maxStack: 99, color: '#F1C40F', icon: 'pill',
      desc: 'Tăng 25% Tu vi tiểu cảnh giới hiện tại. Đan độc +12.', effect: { tuviPct: 0.25, danDoc: 12 }, price: 40 },
    THANH_TAM_DAN: { name: 'Thanh Tâm Đan', category: 'Consumable', maxStack: 99, color: '#7FE3D0', icon: 'pill',
      desc: 'Giải 30 điểm Đan độc.', effect: { danDoc: -30 }, price: 50 },
    TI_LOI_PHU: { name: 'Tị Lôi Phù', category: 'Consumable', maxStack: 99, color: '#F7DC6F', icon: 'talisman', formation: 'Talisman',
      desc: 'Độ Kiếp: đỡ hoàn toàn 1 tia sét. Giảm 10% ST Lôi.', formationEffect: { blockCharges: 1, reduction: 0.10 }, price: 80 },
    HUYEN_QUY_GIAP: { name: 'Huyền Quy Giáp', category: 'Consumable', maxStack: 99, color: '#5D8AA8', icon: 'shell', formation: 'Treasure',
      desc: 'Độ Kiếp: giảm 25% ST Lôi.', formationEffect: { reduction: 0.25 }, price: 120 },
    KET_DAN_DAN: { name: 'Phá Cảnh Đan', category: 'Consumable', maxStack: 99, color: '#E67E22', icon: 'pill', formation: 'Pill',
      desc: 'Độ Kiếp: hồi 30% Sinh lực sau mỗi đạo sét.', formationEffect: { healPerWave: 0.3 }, price: 150 },
    LINH_THAO: { name: 'Linh Thảo', category: 'Material', maxStack: 999, color: '#58D68D', icon: 'herb', desc: 'Nguyên liệu luyện đan.', price: 2 },
    HUYEN_THIET: { name: 'Huyền Thiết', category: 'Material', maxStack: 999, color: '#95A5A6', icon: 'ore', desc: 'Khoáng thạch luyện khí.', price: 3 },
    YEU_DAN: { name: 'Yêu Đan', category: 'Material', maxStack: 999, color: '#C0392B', icon: 'orb', desc: 'Nội đan yêu thú, linh lực dồi dào.', price: 20 },
    TAY_LUYEN_THACH: { name: 'Tẩy Luyện Thạch', category: 'Material', maxStack: 999, color: '#AF7AC5', icon: 'ore', desc: 'Tiêu hao khi Tẩy Luyện.', price: 10 },
    DINH_HON_CHAU: { name: 'Định Hồn Châu', category: 'Material', maxStack: 999, color: '#F5B7B1', icon: 'orb', desc: 'Khóa 1 dòng từ tố khi Tẩy Luyện.', price: 30 },
    BANG_TAM_HOA: { name: 'Băng Tâm Hoa', category: 'Material', maxStack: 999, color: '#AED6F1', icon: 'herb', desc: 'Kỳ hoa thanh lọc đan độc.', price: 8 }
  },

  recipes: [
    { out: 'HOI_HUYET_DAN', count: 2, cost: { LINH_THAO: 3 }, linhThach: 5 },
    { out: 'HOI_LINH_DAN', count: 2, cost: { LINH_THAO: 2, BANG_TAM_HOA: 1 }, linhThach: 5 },
    { out: 'TU_KHI_DAN', count: 1, cost: { LINH_THAO: 4, YEU_DAN: 1 }, linhThach: 20 },
    { out: 'THANH_TAM_DAN', count: 1, cost: { BANG_TAM_HOA: 3, LINH_THAO: 2 }, linhThach: 15 },
    { out: 'TI_LOI_PHU', count: 1, cost: { HUYEN_THIET: 4, YEU_DAN: 1 }, linhThach: 40 },
    { out: 'HUYEN_QUY_GIAP', count: 1, cost: { HUYEN_THIET: 10, YEU_DAN: 2 }, linhThach: 80 },
    { out: 'KET_DAN_DAN', count: 1, cost: { LINH_THAO: 10, YEU_DAN: 3, BANG_TAM_HOA: 2 }, linhThach: 100 },
    { out: 'TAY_LUYEN_THACH', count: 3, cost: { HUYEN_THIET: 5 }, linhThach: 30 },
    { out: 'DINH_HON_CHAU', count: 1, cost: { YEU_DAN: 2, HUYEN_THIET: 3 }, linhThach: 60 }
  ],

  // ---- Yêu thú --------------------------------------------------------------
  // Chỉ số nhân với enemyScale^(globalStage)
  enemyScale: 1.5,
  // ai: melee (áp sát) | ranged (giữ khoảng cách bắn) | boss. Kỹ năng thêm:
  //   pack: số con mỗi lần xuất hiện; chargeEvery: lao húc; ringCount: xả đạn vòng tròn;
  //   projColor / projSlow {amount, sec}: đạn làm chậm.
  enemies: {
    HAC_LANG: { name: 'Hắc Lang', ai: 'melee', hp: 45, atk: 9, def: 1, speedMps: 3.3, radiusM: 0.5, tuvi: 3, linhThach: 3, color: '#3a3f5c', eye: '#ff3b3b',
      desc: 'Sói đen săn theo bầy, lao thẳng vào cắn xé. Có mặt ở mọi Bí Cảnh.' },
    DOC_TRUNG: { name: 'Độc Trùng', ai: 'melee', hp: 16, atk: 5, def: 0, speedMps: 4.6, radiusM: 0.32, tuvi: 1, linhThach: 1, color: '#2f5a32', eye: '#c6ff4d', pack: 3,
      desc: 'Rết độc đốm vàng chanh, cực nhanh, kéo đến theo đàn 3 con.' },
    QUY_HOA: { name: 'Quỷ Hỏa', ai: 'ranged', hp: 32, atk: 11, def: 0, speedMps: 2.3, radiusM: 0.45, tuvi: 3, linhThach: 3, color: '#4b1f3a', eye: '#ff9a3c',
      shootEvery: 2.0, projSpeedMps: 7, keepDistM: 6, desc: 'Hồn lửa giữ khoảng cách 6m, phóng cầu lửa mỗi 2 giây.' },
    THACH_MA: { name: 'Thạch Ma', ai: 'melee', hp: 170, atk: 18, def: 4, speedMps: 1.6, radiusM: 0.9, tuvi: 8, linhThach: 8, color: '#4a4a52', eye: '#5ff0ff',
      desc: 'Ma đá khổng lồ chạy vân linh khí, chậm nhưng máu và giáp dày.' },
    MOC_YEU: { name: 'Mộc Yêu', ai: 'melee', hp: 90, atk: 12, def: 3, speedMps: 1.8, radiusM: 0.6, tuvi: 5, linhThach: 5, color: '#4a3220', eye: '#9dff6a',
      desc: 'Cây non thành tinh trong Linh Mộc Lâm, bò bằng rễ, quất cành gai. Chịu đòn tốt.' },
    DOC_CHU: { name: 'Độc Chu', ai: 'ranged', hp: 40, atk: 9, def: 1, speedMps: 2.6, radiusM: 0.5, tuvi: 3, linhThach: 3, color: '#2a1438', eye: '#ff3355',
      shootEvery: 2.4, projSpeedMps: 6, keepDistM: 5, projColor: '#e8f0d8', projSlow: { amount: 0.45, sec: 1.5 },
      desc: 'Nhện độc lưng khắc vân đầu lâu đỏ, phun tơ dính làm chậm 45% trong 1.5 giây.' },
    HOA_TICH: { name: 'Hỏa Tích', ai: 'melee', hp: 30, atk: 10, def: 1, speedMps: 4.2, radiusM: 0.45, tuvi: 3, linhThach: 3, color: '#c0401a', eye: '#ffe14a', pack: 2,
      desc: 'Thằn lằn lửa gai lưng bốc cháy, đuôi đốm hỏa diễm. Chạy rất nhanh, đi theo cặp.' },
    BANG_HO: { name: 'Băng Hồ', ai: 'ranged', hp: 35, atk: 10, def: 1, speedMps: 3.4, radiusM: 0.45, tuvi: 3, linhThach: 3, color: '#dfeefa', eye: '#7fd6ff',
      shootEvery: 1.8, projSpeedMps: 8, keepDistM: 5.5, projColor: '#bfe6ff', projSlow: { amount: 0.35, sec: 1.2 },
      desc: 'Cáo tuyết trán khảm băng tinh, bắn băng tiễn làm chậm 35%.' },
    TUYET_VIEN: { name: 'Tuyết Viên', ai: 'melee', hp: 180, atk: 20, def: 4, speedMps: 2.0, radiusM: 0.85, tuvi: 9, linhThach: 9, color: '#e6eef6', eye: '#ff5a3a',
      chargeEvery: 4.5, chargeSpeedMps: 11, desc: 'Vượn tuyết tay dài, gầm lên rồi lao húc (có tia đỏ báo trước 0.6 giây).' },
    YEU_VUONG: { name: 'Huyết Lang Vương', ai: 'boss', hp: 1600, atk: 24, def: 4, speedMps: 2.8, radiusM: 1.4, tuvi: 60, linhThach: 120, color: '#5a1a22', eye: '#ffdd33', boss: true,
      shootEvery: 3.2, projSpeedMps: 6.5, ringCount: 14, chargeEvery: 5, chargeSpeedMps: 13,
      desc: 'Vương của Linh Mộc Lâm. Xả 14 cầu lửa vòng tròn và lao húc.' },
    DUNG_NHAM_MA: { name: 'Dung Nham Cự Ma', ai: 'boss', hp: 2000, atk: 26, def: 6, speedMps: 1.9, radiusM: 1.5, tuvi: 70, linhThach: 140, color: '#2e2422', eye: '#ffb03a', boss: true,
      shootEvery: 2.8, projSpeedMps: 6, ringCount: 12, chargeEvery: 6.5, chargeSpeedMps: 10, projColor: '#ff6a1a',
      desc: 'Vương của Hỏa Diệm Cốc. Cự ma bazan rỉ dung nham, xả 12 khối dung nham và dậm lao tới.' },
    CUU_VI_HO: { name: 'Cửu Vĩ Băng Hồ', ai: 'boss', hp: 1700, atk: 24, def: 4, speedMps: 3.0, radiusM: 1.3, tuvi: 70, linhThach: 140, color: '#eaf6ff', eye: '#bfe6ff', boss: true,
      shootEvery: 2.4, projSpeedMps: 7, ringCount: 16, chargeEvery: 5, chargeSpeedMps: 14, projColor: '#bfe6ff', projSlow: { amount: 0.35, sec: 1.2 },
      desc: 'Vương của Huyền Băng Động. Hồ ly chín đuôi, xả 16 băng tiễn làm chậm và lướt chớp nhoáng.' },
    THANH_CHU: { name: 'Trấn Thành Thạch Vương', ai: 'boss', hp: 2300, atk: 28, def: 8, speedMps: 1.8, radiusM: 1.7, tuvi: 85, linhThach: 180, color: '#786b55', eye: '#ffd36a', boss: true,
      shootEvery: 3.2, projSpeedMps: 5.5, ringCount: 12, chargeEvery: 6.5, chargeSpeedMps: 9, projColor: '#d8b778',
      desc: 'Thạch tướng trấn giữ Cổ Thành, bắn đá linh khí theo vòng và lao tới nghiền nát kẻ xâm nhập.' },

    // === CÁC ĐẠI BOSS THƯỢNG CỔ MỚI ===
    CUU_VI_THIEN_HO: { name: 'Cửu Vĩ Thiên Hồ', ai: 'boss', hp: 3500, atk: 45, def: 8, speedMps: 3.2, radiusM: 1.8, tuvi: 150, linhThach: 300, color: '#38bdf8', eye: '#7fe3ff', boss: true, sprite: 'boss_fox.jpg',
      shootEvery: 2.0, projSpeedMps: 7.5, ringCount: 18, chargeEvery: 4.5, chargeSpeedMps: 15, projColor: '#38bdf8',
      desc: 'Thiên hồ thượng cổ chín đuôi lam hỏa lộng lẫy, thao túng u linh và bắn chuỗi hồ hỏa cầu xanh uy lực.' },
    LOI_DINH_CU_SA: { name: 'Lôi Đình Cự Sa', ai: 'boss', hp: 3200, atk: 42, def: 7, speedMps: 4.2, radiusM: 1.7, tuvi: 140, linhThach: 280, color: '#0ea5e9', eye: '#facc15', boss: true, sprite: 'boss_shark.jpg',
      chargeEvery: 3.5, chargeSpeedMps: 16, shootEvery: 2.5, projSpeedMps: 8, ringCount: 12, projColor: '#38bdf8',
      desc: 'Cá mập sấm sét cự đại của Bắc Hải, lướt nhanh như chớp và cắn nát kiếm trận của đối thủ.' },
    HAC_AM_CU_HUNG: { name: 'Hắc Ám Cự Hùng', ai: 'boss', hp: 4200, atk: 52, def: 12, speedMps: 1.8, radiusM: 1.9, tuvi: 160, linhThach: 320, color: '#1e1b4b', eye: '#dc2626', boss: true, sprite: 'boss_bear.jpg',
      chargeEvery: 5.0, chargeSpeedMps: 12, ringCount: 8, projColor: '#ef4444',
      desc: 'Gấu ma hắc ám khổng lồ mang cốt giáp nhọn hoắt, dậm chân chấn động mặt đất và gây địa chấn khủng khiếp.' },
    HAN_BANG_CU_MA: { name: 'Hàn Băng Cự Ma', ai: 'boss', hp: 4500, atk: 48, def: 14, speedMps: 1.6, radiusM: 2.0, tuvi: 170, linhThach: 350, color: '#0284c7', eye: '#38bdf8', boss: true, sprite: 'boss_golem.jpg',
      shootEvery: 3.0, projSpeedMps: 6, ringCount: 16, projColor: '#7dd3fc', projSlow: { amount: 0.5, sec: 2 },
      desc: 'Người đá băng vạn trượng tích tụ hàn khí ngàn năm, phóng mưa băng gai làm chậm cực lớn và bất hoại.' },
    HU_KHONG_AM_LONG: { name: 'Hư Không Ám Long', ai: 'boss', hp: 5000, atk: 55, def: 15, speedMps: 3.0, radiusM: 2.2, tuvi: 200, linhThach: 450, color: '#18181b', eye: '#a855f7', boss: true, sprite: 'boss_void_dragon.jpg',
      shootEvery: 2.2, projSpeedMps: 8.5, ringCount: 20, chargeEvery: 4.0, chargeSpeedMps: 15, projColor: '#c084fc',
      desc: 'Long tộc hư không cánh sừng kỳ dị, nuốt chửng linh lực và xả ma cầu tím hủy diệt chư thiên.' },

    // === QUÂN ĐOÀN HẮC ẢNH ===
    HAC_ANH_TU_THAN: { name: 'Hắc Ảnh Tử Thần', ai: 'ranged', hp: 450, atk: 28, def: 4, speedMps: 2.8, radiusM: 0.8, tuvi: 25, linhThach: 35, color: '#312e81', eye: '#818cf8', sprite: 'shadow_reaper.jpg',
      shootEvery: 2.2, projSpeedMps: 8, keepDistM: 6, projColor: '#6366f1',
      desc: 'Tử thần liêm đao trong bóng tối, vung lưỡi hái bóng đêm và bắn liêm khí tầm xa.' },
    HAC_ANH_KIEM_SI: { name: 'Hắc Ảnh Kiếm Sĩ', ai: 'melee', hp: 550, atk: 32, def: 6, speedMps: 3.6, radiusM: 0.85, tuvi: 30, linhThach: 40, color: '#1e1b4b', eye: '#60a5fa', sprite: 'shadow_swordsman.jpg',
      chargeEvery: 4.0, chargeSpeedMps: 13,
      desc: 'Chiến binh hắc ảnh giáp trụ hắc thiết, kiếm pháp xuất quỷ nhập thần và lướt chém liên hoàn.' },
    BACH_COT_THICH_KHACH: { name: 'Bạch Cốt Thích Khách', ai: 'melee', hp: 380, atk: 36, def: 3, speedMps: 4.8, radiusM: 0.7, tuvi: 28, linhThach: 42, color: '#431407', eye: '#f97316', pack: 2, sprite: 'shadow_assassin.jpg',
      desc: 'Thích khách mang mặt nạ bạch cốt, tốc độ cực nhanh, ám sát bất ngờ từ góc khuất.' },
    HU_KHONG_U_HON: { name: 'Hư Không U Hồn', ai: 'ranged', hp: 320, atk: 26, def: 2, speedMps: 3.2, radiusM: 0.75, tuvi: 22, linhThach: 30, color: '#1e293b', eye: '#38bdf8', sprite: 'shadow_wraith.jpg',
      shootEvery: 1.8, projSpeedMps: 7, keepDistM: 5.5, projColor: '#38bdf8',
      desc: 'U hồn bay lơ lửng, thoắt ẩn thoắt hiện trong không gian hư vô.' },
    TOA_LIEM_MA_QUAN: { name: 'Tỏa Liêm Ma Quân', ai: 'boss', hp: 3800, atk: 46, def: 9, speedMps: 2.6, radiusM: 1.7, tuvi: 160, linhThach: 320, color: '#172554', eye: '#60a5fa', boss: true, sprite: 'shadow_chain_lord.png',
      shootEvery: 2.5, projSpeedMps: 7.5, ringCount: 14, chargeEvery: 5.0, chargeSpeedMps: 14,
      desc: 'Ma quân phong ấn xích sắt, vung song liêm khổng lồ tạo vòng xoáy xiềng xích chết chóc.' },
    HAC_DA_THONG_SOAI: { name: 'Hắc Dạ Thống Soái Bellion', ai: 'boss', hp: 4800, atk: 54, def: 12, speedMps: 3.0, radiusM: 2.0, tuvi: 190, linhThach: 400, color: '#0f172a', eye: '#38bdf8', boss: true, sprite: 'boss_shadow_general.jpg',
      shootEvery: 2.0, projSpeedMps: 8, ringCount: 16, chargeEvery: 4.2, chargeSpeedMps: 15,
      desc: 'Thống soái tối cao của Quân Đoàn Hắc Ảnh, khoác giáp hoàng gia bóng đêm, uy lực vô song.' },

    // === YÊU THÚ & THẦN THÚ BỔ SUNG ===
    MONSTER_SCORPION: { name: 'U Hỏa Độc Hạt', ai: 'melee', hp: 600, atk: 30, def: 7, speedMps: 3.4, radiusM: 0.9, tuvi: 32, linhThach: 45, color: '#312e81', eye: '#a855f7', sprite: 'monster_scorpion.jpg',
      desc: 'Bọ cạp khổng lồ đuôi rực u hỏa, lớp vỏ giáp gai nhọn kháng vật lý cao.' },
    NHAT_THUC_THAN_CAM: { name: 'Nhật Thực Thần Cầm', ai: 'boss', hp: 3600, atk: 46, def: 8, speedMps: 3.4, radiusM: 1.8, tuvi: 160, linhThach: 340, color: '#451a03', eye: '#f59e0b', boss: true, sprite: 'boss_solar_eclipse.jpg',
      shootEvery: 2.2, projSpeedMps: 8, ringCount: 16, projColor: '#f59e0b',
      desc: 'Thần điểu mang sức mạnh Nhật Thực, xòe cánh lửa đen thiêu đốt chiến trường.' },
    BANG_LINH_THAN_THU: { name: 'Băng Linh Thần Điểu', ai: 'boss', hp: 3700, atk: 44, def: 8, speedMps: 3.5, radiusM: 1.8, tuvi: 160, linhThach: 340, color: '#0c4a6e', eye: '#7dd3fc', boss: true, sprite: 'boss_ice_phoenix.jpg',
      shootEvery: 2.0, projSpeedMps: 8.5, ringCount: 16, projColor: '#bae6fd', projSlow: { amount: 0.4, sec: 1.8 },
      desc: 'Thần cầm băng phong sải cánh tuyết ngàn trượng, tạo bão tuyết đóng băng kẻ thù.' },
    KIM_SUNG_THIEN_LONG: { name: 'Cửu U Minh Long', ai: 'boss', hp: 5200, atk: 58, def: 15, speedMps: 3.0, radiusM: 2.3, tuvi: 220, linhThach: 480, color: '#1e1b4b', eye: '#c084fc', boss: true, sprite: 'boss_nether_dragon.jpg',
      shootEvery: 2.0, projSpeedMps: 9, ringCount: 22, chargeEvery: 4.0, chargeSpeedMps: 16, projColor: '#e879f9',
      desc: 'Minh long ngự trị nơi sâu thẳm Cửu U, sừng vàng lấp lánh ma lôi, long tức hủy diệt càn khôn.' }
  },
  // Cửa hàng của Vạn Bảo Thương Nhân: [itemId, giá Linh Thạch]
  shop: [['HOI_HUYET_DAN', 30], ['HOI_LINH_DAN', 25], ['THANH_TAM_DAN', 100], ['TI_LOI_PHU', 180],
    ['TAY_LUYEN_THACH', 25], ['DINH_HON_CHAU', 90], ['LINH_THAO', 6], ['HUYEN_THIET', 8], ['BANG_TAM_HOA', 16]],

  // ---- NPC Tông Môn ---------------------------------------------------------
  // look: tạo hình (bảng màu + đặc điểm); x,y: mét so với tâm; path: điểm tuần tra (đi lại);
  // actions: nút trong hộp thoại; aura: có linh khí (cảnh giới aura.realm, màu aura.color).
  npcLooks: {
    CHUONG_MON: { pal: { robe: '#f6f0dc', robeShade: '#d8ccaa', robeDeep: '#a8986e', inner: '#c8962e', innerDark: '#7a5414', hair: '#e8e8ee', hairMid: '#ffffff', hairShine: 'rgba(255,255,255,0.8)', sash: '#7a5414' },
      feat: { beard: 'long', hat: 'daoguan', squint: true } },
    DAN_SU: { pal: { robe: '#8a4a2a', robeShade: '#6a3418', robeDeep: '#3e1c0c', inner: '#e9b44c', innerDark: '#9a6a1e', hair: '#9aa0aa', hairMid: '#d0d4dc', sash: '#2a160c' },
      feat: { beard: 'goatee', squint: true } },
    KIEM_LAO: { pal: { robe: '#5a6a7a', robeShade: '#3e4a58', robeDeep: '#242c36', inner: '#c8d8e8', innerDark: '#7a8a9a', hair: '#cfd4dc', hairMid: '#ffffff', sash: '#1a1e24' },
      feat: { beard: 'long', squint: true } },
    LOI_LAO: { pal: { robe: '#4a3a6a', robeShade: '#33264e', robeDeep: '#1e1530', inner: '#c9a4ff', innerDark: '#7a54c0', hair: '#4a4060', hairMid: '#8a7aa8', sash: '#140e20' },
      feat: { beard: 'goatee', hat: 'daoguan' } },
    THUONG_NHAN: { pal: { robe: '#c8a050', robeShade: '#9a7432', robeDeep: '#5e4418', inner: '#6a2a1a', innerDark: '#3a140a', hair: '#3a2a1e', hairMid: '#7a5a40', sash: '#3a2410' },
      feat: { hat: 'straw', beard: 'mustache' } },
    SU_TY: { pal: { robe: '#f6dbe6', robeShade: '#dcb0c4', robeDeep: '#a87890', inner: '#d8487a', innerDark: '#8a1e48', tassel: '#d8487a', hair: '#5a3430', hairMid: '#a8706a', iris: '#a03a6a' },
      feat: { buns: true } },
    DE_TU: { pal: { robe: '#dfe8ec', robeShade: '#b4c4cc', robeDeep: '#7e909a', inner: '#2a5a7a', innerDark: '#163448', hair: '#2e2e3e', hairMid: '#6a6a8a', iris: '#4a3a30' },
      feat: {} }
  },
  npcs: [
    { id: 'CHUONG_MON', name: 'Thiên Kiếm Tử', title: 'Chưởng Môn', look: 'CHUONG_MON', x: 0, y: -10.8, aura: { realm: 4, color: '#ffe39a' },
      lines: ['Kiếm đạo vô cực, tâm phải tĩnh như mặt hồ thu. Đệ tử, ngươi tu luyện thế nào rồi?',
        'Thiên Kiếm Tông lập phái ba nghìn năm, dựa vào bốn chữ: Kiếm – Tâm – Hợp – Nhất.'],
      context: true, actions: [['Động Phủ', 'dongphu']] },
    { id: 'DAN_SU', name: 'Đan Trần', title: 'Đan Sư Trưởng Lão', look: 'DAN_SU', x: 14.6, y: -4.2, aura: { realm: 2, color: '#ff9a3c' },
      lines: ['Luyện đan cốt ở hỏa hầu. Lửa non thì đan sống, lửa già thì đan cháy.',
        'Đan dược tốt nhưng tích đan độc. Trước khi Độ Kiếp nhớ uống Thanh Tâm Đan!'],
      actions: [['Luyện Đan', 'alchemy']] },
    { id: 'KIEM_LAO', name: 'Kiếm Si', title: 'Kiếm Các Lão Nhân', look: 'KIEM_LAO', x: -13.8, y: 9.6, aura: { realm: 3, color: '#9fe8ff' },
      lines: ['Kiếm như người, người như kiếm. Kiếm ý thông suốt thì vạn vật đều là kiếm.',
        'Xếp trang bị đúng vòng Kim → Thủy → Mộc → Hỏa → Thổ, kiếm khí sẽ cộng hưởng.'],
      actions: [['Vũ Khí & Kiếm', 'weapons'], ['Y Phục', 'skins']] },
    { id: 'LOI_LAO', name: 'Lôi Hỏa', title: 'Hộ Pháp Lôi Đài', look: 'LOI_LAO', x: 13.6, y: 10.6, aura: { realm: 3, color: '#b48cff' },
      lines: ['Thiên kiếp không thương xót ai. Khi vòng đỏ dừng lại, ngươi chỉ có 0.3 hơi thở để lướt đi.',
        'Tị Lôi Phù đỡ trọn một đạo sét, Huyền Quy Giáp giảm một phần tư lôi lực.'],
      actions: [['Chuẩn Bị Độ Kiếp', 'tribulation']] },
    { id: 'THUONG_NHAN', name: 'Vạn Bảo', title: 'Thương Nhân', look: 'THUONG_NHAN', x: 8, y: 19.4,
      lines: ['Khách quan ghé xem! Đan dược, phù lục, linh thạch luyện khí… hàng thật giá thật!',
        'Đồ nhặt trong Bí Cảnh không dùng thì mở túi, rê chuột và bấm X để bán.'],
      actions: [['Mua Hàng', 'shop']] },
    { id: 'SU_TY', name: 'Tô Thanh Dao', title: 'Đại Sư Tỷ', look: 'SU_TY', x: -5, y: 2, speed: 1.4,
      path: [[-5, 2], [5, 2], [5.5, 6.5], [-5.5, 6.5]],
      lines: ['Sư đệ lại đi Bí Cảnh à? Linh Mộc Lâm nhiều linh thảo, Hỏa Diệm Cốc nhiều khoáng mạch đấy.',
        'Bảo rương trong Bí Cảnh rơi trang bị đúng hệ của vùng. Muốn đồ hệ Thủy thì vào Huyền Băng Động.',
        'Đừng tham chiến với Tuyết Viên khi nó gầm lên. Lướt sang ngang là né được.'] },
    { id: 'DE_TU_1', name: 'Lâm Phong', title: 'Đệ Tử Tuần Tra', look: 'DE_TU', x: -1.3, y: 13, speed: 1.6,
      path: [[-1.3, 14], [-1.3, -4], [-14, -4.6], [-1.3, -4]],
      lines: ['Hôm nay trời trong, kiếm khí ở quảng trường đặc biệt dồi dào.', 'Nghe nói Cửu Vĩ Băng Hồ lại xuất hiện ở Huyền Băng Động…'] },
    { id: 'DE_TU_2', name: 'Triệu Vân Hạc', title: 'Đệ Tử Tuần Tra', look: 'DE_TU', x: 1.3, y: -4, speed: 1.6,
      path: [[1.3, -4], [14, -4.6], [1.3, -4], [1.3, 14]],
      lines: ['Đừng chạm vào lư hương của Chưởng Môn, ngài sẽ biết đấy.', 'Dung Nham Cự Ma rất chậm, nhưng mỗi khối dung nham của nó nóng đến tan kiếm.'] }
  ],
  bicanh: {
    killsForBoss: 45,
    maxAlive: 26,
    spawnEvery: 0.9,
    spawnWeights: { HAC_LANG: 40, DOC_TRUNG: 30, QUY_HOA: 20, THACH_MA: 10 },
    equipDropChance: 0.07,
    matDrops: [
      { id: 'LINH_THAO', chance: 0.25, min: 1, max: 3 },
      { id: 'HUYEN_THIET', chance: 0.14, min: 1, max: 2 },
      { id: 'BANG_TAM_HOA', chance: 0.08, min: 1, max: 1 },
      { id: 'TAY_LUYEN_THACH', chance: 0.08, min: 1, max: 2 },
      { id: 'YEU_DAN', chance: 0.04, min: 1, max: 1 },
      { id: 'DINH_HON_CHAU', chance: 0.015, min: 1, max: 1 },
      { id: 'HOI_HUYET_DAN', chance: 0.03, min: 1, max: 1 }
    ],
    bossDrops: [
      { id: 'YEU_DAN', min: 2, max: 4 }, { id: 'DINH_HON_CHAU', min: 1, max: 2 }, { id: 'TAY_LUYEN_THACH', min: 3, max: 6 }, { id: 'BANG_TAM_HOA', min: 1, max: 3 }
    ],
    bossEquipDrops: 2,
    deathLinhThachLoss: 0.2
  },

  // ---- Tông Môn (bản đồ chính) --------------------------------------------
  // Toạ độ tính bằng mét so với tâm bản đồ. interact: hành động khi bấm E.
  sect: {
    name: 'Thiên Kiếm Tông',
    sizeM: 66,
    spawn: [0, 9],
    plaza: [0, 1, 7.5],
    // [x1, y1, x2, y2, bề rộng] (m)
    paths: [[0, 21, 0, -12, 3], [-17, -5, 17, -5, 2.6], [-15, 6, -6, 6, 2.2], [6, 6, 15, 6, 2.2]],
    props: [
      { kind: 'main_hall', x: 0, y: -13, interact: 'dongphu', label: 'Thiên Kiếm Điện — Động Phủ [E]' },
      { kind: 'pagoda', x: -18, y: -7, interact: 'help', label: 'Tàng Kinh Các — Đạo Pháp [E]' },
      { kind: 'alchemy_hall', x: 18, y: -7, interact: 'alchemy', label: 'Đan Phòng — Luyện Đan [E]' },
      { kind: 'sword_pavilion', x: -17, y: 8, interact: 'weapons', label: 'Kiếm Các — Vũ Khí [E]' },
      { kind: 'thunder_altar', x: 17, y: 9, interact: 'tribulation', label: 'Lôi Đài — Độ Kiếp [E]' },
      { kind: 'sect_gate', x: 0, y: 22, interact: 'bicanh', label: 'Sơn Môn — Vào Bí Cảnh [E]' },
      { kind: 'incense', x: 0, y: -8 },
      { kind: 'stone_lion', x: -4, y: -9 }, { kind: 'stone_lion', x: 4, y: -9, variant: 'flip' },
      { kind: 'stone_lion', x: -5, y: 21.5 }, { kind: 'stone_lion', x: 5, y: 21.5, variant: 'flip' },
      { kind: 'stone_lantern', x: -2.6, y: 12 }, { kind: 'stone_lantern', x: 2.6, y: 12 },
      { kind: 'stone_lantern', x: -2.6, y: 17 }, { kind: 'stone_lantern', x: 2.6, y: 17 },
      { kind: 'stone_lantern', x: -9.5, y: -6.6 }, { kind: 'stone_lantern', x: 9.5, y: -6.6 },
      { kind: 'stone_lantern', x: -8.5, y: 1 }, { kind: 'stone_lantern', x: 8.5, y: 1 },
      { kind: 'banner', x: -7.5, y: -11, text: '劍' }, { kind: 'banner', x: 7.5, y: -11, text: '道' },
      { kind: 'banner', x: -12, y: 20, text: '天' }, { kind: 'banner', x: 11, y: 20, text: '宗' },
      { kind: 'fence', x: -9, y: 15.5 }, { kind: 'fence', x: 13, y: 15.5 },
      { kind: 'market_stall', x: 8, y: 18 },
      { kind: 'lotus_pond', x: -22, y: 17 }, { kind: 'lotus_pond', x: 22, y: -19 },
      { kind: 'peach', x: -9, y: -18 }, { kind: 'peach', x: 9, y: -18 }, { kind: 'peach', x: -24, y: 4 },
      { kind: 'peach', x: 25, y: 3 }, { kind: 'peach', x: -15, y: 18 }, { kind: 'peach', x: 14, y: 17 },
      { kind: 'bamboo', x: -25, y: -14 }, { kind: 'bamboo', x: 26, y: -10 }, { kind: 'bamboo', x: -27, y: 11 }, { kind: 'bamboo', x: 27, y: 14 },
      { kind: 'rock_moss', x: -11, y: 12 }, { kind: 'rock_moss', x: 12, y: 13 }, { kind: 'rock_moss', x: -20, y: 23 },
      { kind: 'flower_bush', x: -6, y: 4 }, { kind: 'flower_bush', x: 6, y: 4 }, { kind: 'flower_bush', x: -12, y: -2 },
      { kind: 'flower_bush', x: 12, y: -2 }, { kind: 'flower_bush', x: -3.5, y: 19.5 }, { kind: 'flower_bush', x: 3.5, y: 19.5 }
    ],
    // Vành rừng tùng bao quanh bản đồ
    borderTrees: { kind: 'pine', count: 46, innerM: 27, outerM: 31 }
  },

  // ---- Bí Cảnh --------------------------------------------------------------
  // props: [kind, trọng số]; gather: số lượng vật phẩm thu thập; loot: [itemId, min, max]
  biomes: {
    LINH_MOC: {
      name: 'Linh Mộc Lâm', element: 'Moc', ground: 'linhmoc', dark: 0.36, fog: '#16343a',
      desc: 'Rừng cổ thụ vạn năm, nấm linh phát sáng, phế tích thượng cổ phủ rêu. Linh thảo mọc dày.',
      ambient: { color: '#7affd0', vy: [-14, -4], rate: 6 },
      spawnWeights: { HAC_LANG: 25, DOC_TRUNG: 30, MOC_YEU: 20, DOC_CHU: 15, THACH_MA: 10 }, boss: 'YEU_VUONG',
      props: [['ancient_tree', 16], ['glow_mushroom', 26], ['fern', 32], ['ruin_pillar', 8], ['ruin_stele', 4], ['rock_moss', 14]],
      propCount: 130,
      gather: { herb: 16, ore: 5, chest: 3, spring: 1 },
      herbVariant: 'linhthao', oreVariant: 'moc',
      herbLoot: [['LINH_THAO', 2, 4], ['BANG_TAM_HOA', 0, 1]], oreLoot: [['HUYEN_THIET', 1, 3], ['TAY_LUYEN_THACH', 0, 1]]
    },
    HOA_DIEM: {
      name: 'Hỏa Diệm Cốc', element: 'Hoa', ground: 'hoadiem', dark: 0.32, fog: '#3a1a10',
      desc: 'Thung lũng núi lửa, khe dung nham rực đỏ, gai hắc diệu thạch và tinh thể hỏa linh. Khoáng mạch phong phú.',
      ambient: { color: '#ffa04a', vy: [-40, -18], rate: 10 },
      spawnWeights: { HAC_LANG: 15, QUY_HOA: 35, HOA_TICH: 35, THACH_MA: 15 }, boss: 'DUNG_NHAM_MA',
      props: [['obsidian', 24], ['fire_crystal', 18], ['dead_tree', 18], ['lava_pool', 5], ['ember_vent', 10]],
      propCount: 100,
      gather: { herb: 7, ore: 14, chest: 3, spring: 1 },
      herbVariant: 'hoachi', oreVariant: 'hoa',
      herbLoot: [['LINH_THAO', 1, 3], ['YEU_DAN', 0, 1]], oreLoot: [['HUYEN_THIET', 2, 4], ['TAY_LUYEN_THACH', 1, 2]]
    },
    HUYEN_BANG: {
      name: 'Huyền Băng Động', element: 'Thuy', ground: 'huyenbang', dark: 0.3, fog: '#4a6a8a',
      desc: 'Hang băng ngàn năm, trụ đá đóng băng, cổ kiếm phong ấn trong khối băng. Băng Tâm Hoa nở trong giá lạnh.',
      ambient: { color: '#ffffff', vy: [14, 30], rate: 14 },
      spawnWeights: { HAC_LANG: 20, BANG_HO: 30, TUYET_VIEN: 25, THACH_MA: 25 }, boss: 'CUU_VI_HO',
      props: [['ice_crystal', 26], ['frozen_pillar', 12], ['snow_drift', 20], ['rock_moss', 10], ['frozen_sword', 2]],
      propCount: 95,
      gather: { herb: 12, ore: 8, chest: 3, spring: 1 },
      herbVariant: 'bangtam', oreVariant: 'bang',
      herbLoot: [['BANG_TAM_HOA', 1, 3], ['LINH_THAO', 0, 1]], oreLoot: [['HUYEN_THIET', 1, 2], ['DINH_HON_CHAU', 0, 1]]
    },
    THANH_LUY: {
      name: 'Cổ Thành Trấn Ma', element: 'Tho', ground: 'thanh_luy', dark: 0.3, fog: '#37352e',
      desc: 'Phế thành đá giữa hoang mạc, tường thành khép kín, tháp canh cổ và cổng ải dẫn vào sân trong.',
      ambient: { color: '#e6bf78', vy: [-10, 4], rate: 4 },
      spawnWeights: { HAC_LANG: 20, DOC_TRUNG: 20, THACH_MA: 45, QUY_HOA: 15 }, boss: 'THANH_CHU',
      props: [['fortress_rubble', 18], ['ruin_pillar', 12], ['ruin_stele', 10], ['rock_moss', 16], ['stone_lantern', 8]],
      propCount: 54, fortress: true,
      gather: { herb: 10, ore: 12, chest: 4, spring: 1 },
      herbVariant: 'linhthao', oreVariant: 'moc',
      herbLoot: [['LINH_THAO', 1, 3], ['HUYEN_THIET', 0, 1]], oreLoot: [['HUYEN_THIET', 2, 4], ['DINH_HON_CHAU', 0, 1]]
    }
  },
  chestRarityWeights: { PhapKhi: 0, LinhKhi: 45, BaoKhi: 35, TienKhi: 15, ThanKhi: 5 },
  chestLinhThach: [30, 70],
  chestDinhHonChauChance: 0.25,
  spring: { healPct: 1, mpPct: 1, danDoc: -10 },
  gatherRangeM: 1.8,

  // ---- Y phục (skin nhân vật) ------------------------------------------------
  // pal: ghi đè bảng màu nhân vật (xem TT.Character.PAL). realm: cảnh giới tối thiểu.
  skins: [
    { id: 'THANH_VAN', name: 'Thanh Vân Kiếm Khách', price: 0, realm: 0,
      desc: 'Áo khoác lam đậm cổ lông trắng, tóc ngọc bích buộc ruy băng lam, vương miện nhỏ. Trang phục đệ tử Thiên Kiếm Tông.', pal: {} },
    { id: 'HUYEN_Y', name: 'Huyền Y Dạ Hành', price: 800, realm: 0,
      desc: 'Áo khoác đen viền đỏ thẫm, tóc đen tuyền của ám vệ tông môn, thích hợp hành tẩu đêm trong Bí Cảnh.',
      pal: { robe: '#4a4e62', robeShade: '#2c2f3e', robeDeep: '#1a1c26', inner: '#a8242c', innerDark: '#5a1016', hair: '#3a3a4c', hairMid: '#7a7a9a', tassel: '#a8242c', iris: '#8a2a2a' } },
    { id: 'XICH_DIEM', name: 'Xích Diễm Chiến Bào', price: 1500, realm: 1,
      desc: 'Chiến bào đỏ rực thêu kim tuyến, tóc đỏ lửa, may từ tơ Hỏa Tàm của Hỏa Diệm Cốc.',
      pal: { robe: '#d8463a', robeShade: '#9a2626', robeDeep: '#5e1414', inner: '#f2c45a', innerDark: '#9a6a1e', hair: '#c2523e', hairMid: '#ffb08a', tassel: '#f2c45a', iris: '#c8642a' } },
    { id: 'BANG_TAM', name: 'Băng Tâm Tiên Y', price: 2500, realm: 1,
      desc: 'Tiên y lam nhạt dệt từ sợi băng tằm, tóc bạc như tuyết của truyền nhân Huyền Băng.',
      pal: { robe: '#eaf6fd', robeShade: '#b4d3e6', robeDeep: '#7fa4c0', inner: '#4a8ec0', innerDark: '#2a5a86', hair: '#d4dcea', hairMid: '#ffffff', hairShine: 'rgba(255,255,255,0.7)', iris: '#3a7ac0' } },
    { id: 'TU_HA', name: 'Tử Hà Thần Bào', price: 5000, realm: 2,
      desc: 'Thần bào tím sẫm phủ ráng chiều, chỉ bậc Kim Đan trở lên mới khoác được linh áp của nó.',
      pal: { robe: '#5a4486', robeShade: '#3a2a5e', robeDeep: '#22163a', inner: '#d8b4ff', innerDark: '#8a5ac8', hair: '#8a72c0', hairMid: '#e0d0ff', iris: '#a06ae0' } },
    { id: 'LONG_THAN', name: 'Cửu Long Thần Bào', price: 12000, realm: 3,
      desc: 'Long bào hoàng kim thêu cửu long đạp tường vân, tóc bạch kim uy nghiêm, toát ra khí chất chí tôn vô thượng của bậc Nguyên Anh chân quân.',
      pal: { robe: '#d4af37', robeShade: '#997d1e', robeDeep: '#5e4c0d', inner: '#221910', innerDark: '#110b06', hair: '#fef5dc', hairMid: '#ffffff', hairShine: 'rgba(255,240,160,0.85)', sash: '#871a14', tassel: '#d4af37', iris: '#d4ac0d', gold: '#ffe066', goldHi: '#fff8cc' } },
    { id: 'CUU_U', name: 'Cửu U Ma Tôn Y', price: 16000, realm: 3,
      desc: 'Hắc ma bào thêu phù văn Cửu U đỏ huyết, tóc tím ma mị, linh áp cuồn cuộn chấn nhiếp bát hoang chư ma.',
      pal: { robe: '#22182e', robeShade: '#150d1f', robeDeep: '#0b0610', inner: '#a81c1c', innerDark: '#5c0d0d', hair: '#6c3483', hairMid: '#bb8fce', hairShine: 'rgba(215,160,255,0.8)', sash: '#100a16', tassel: '#c0392b', iris: '#ff3355', gold: '#9b59b6', goldHi: '#e8daef' } },
    { id: 'THAI_HU', name: 'Thái Hư Hỗn Độn Tiên Y', price: 35000, realm: 4,
      desc: 'Tiên y dệt từ hỗn độn hư không và tinh hà vạn trượng, sắc lam ngọc ánh ngân quang lấp lánh tiên hoa, bậc Hóa Thần đại năng mới có thể ngưng tụ.',
      pal: { robe: '#185a6b', robeShade: '#0e3742', robeDeep: '#061c22', inner: '#38ef7d', innerDark: '#11998e', hair: '#e0f8ff', hairMid: '#ffffff', hairShine: 'rgba(56,239,125,0.9)', sash: '#09252c', tassel: '#38ef7d', iris: '#00d2d3', gold: '#7bed9f', goldHi: '#ffffff' } },
    { id: 'VAN_CO', name: 'Vạn Cổ Tiên Đế Bào', price: 50000, realm: 4,
      desc: 'Chí cao thần bào đế tôn vạn cổ bất hủ, thân khoác tử kim cửu trọng thiên quang, vạn pháp bất xâm, ngạo thị chư thiên tiên ma.',
      pal: { robe: '#38164b', robeShade: '#1f0a2c', robeDeep: '#100318', inner: '#f39c12', innerDark: '#935116', hair: '#ffffff', hairMid: '#f5eeff', hairShine: 'rgba(255,215,0,0.95)', sash: '#250836', tassel: '#f39c12', iris: '#f1c40f', gold: '#f5b041', goldHi: '#fef9e7' } }
  ],

  // ---- Kiếm hình (skin kiếm) -------------------------------------------------
  // Chỉ đổi ngoại hình: kiếm cầm tay + phi kiếm. Màu hào quang/vệt kiếm vẫn theo hệ của vũ khí.
  // Hỗ trợ:
  // 1. Sprite đơn: sprite: 'assets/crystal_sword.png', baseAngleOffset, pivotX, pivotY
  // 2. Sprite Sheet: sheet: 'sheet1'|'sheet2'|'sheet3', sx, sy, sw, sh (hoặc row, col, rows, cols)
  // 3. Procedural shape: shape: 'jian'|'thin'|'broad'|'heavy'|'solar_flame', pal: { blade, bladeShade, hilt, gold, gem }
  swordSkins: [
    // === CRYSTAL SWORD ===
    { id: 'BANG_TINH', name: 'Băng Tinh Thần Kiếm', rarity: 'ThanBinh', price: 0, realm: 0, shape: 'crystal_sword',
      sprite: 'assets/crystal_sword.png', baseAngleOffset: 1.88015, pivotX: 0.65, pivotY: 0.30, bladeLen: 852,
      glowColor: '#7fe3ff', trailColor: '#9ee8ff',
      desc: 'Cực phẩm thần kiếm đúc từ pha lê băng tinh, thân kiếm trong suốt lấp lánh hàn quang kỳ ảo.',
      pal: { blade: '#e0f8ff', bladeShade: '#72c8f0', hilt: '#1a3048', gold: '#9ee8ff', goldHi: '#ffffff', goldDark: '#4a8aa8', gem: '#7fe3ff' } },

    // === SHEET 1: THẦN BINH ĐẠI ĐAO & CHIẾN KIẾM (Mũi kiếm hướng lên trên) ===
    // Hàng trên (Top Row):
    { id: 'S1_THIET_GIAP', name: 'Thiết Giáp Trảm Đao', rarity: 'Hiem', price: 600, realm: 0, shape: 'sprite',
      sheet: 'sheet1', sx: 13, sy: 14, sw: 102, sh: 466, baseAngleOffset: -Math.PI / 2, pivotX: 0.50, pivotY: 0.90, bladeLen: 466,
      glowColor: '#e0c27a', trailColor: '#d0d8e8',
      desc: 'Trọng đao bọc giáp thép bạc viền đồng cổ, lưỡi đao dày dặn chém sắt như chém bùn.',
      pal: { blade: '#d0d8e8', bladeShade: '#8898b0', hilt: '#3a2a1a', gold: '#b08850', gem: '#ffd27a' } },
    { id: 'S1_AM_HAC', name: 'Ám Hắc Ma Đao', rarity: 'CucPham', price: 1200, realm: 1, shape: 'sprite',
      sheet: 'sheet1', sx: 115, sy: 19, sw: 69, sh: 459, baseAngleOffset: -Math.PI / 2, pivotX: 0.50, pivotY: 0.90, bladeLen: 459,
      glowColor: '#ff3b45', trailColor: '#b82028',
      desc: 'Ma đao rèn từ hắc diệu thạch Hỏa Diệm Cốc, khắc phù văn huyết sát tỏa hàn khí lạnh thấu xương.',
      pal: { blade: '#1c181a', bladeShade: '#4a1518', hilt: '#120d10', gold: '#b82028', gem: '#ff3b45' } },
    { id: 'S1_HAN_BANG_SONG_NHAN', name: 'Hàn Băng Song Nhận', rarity: 'CucPham', price: 1500, realm: 1, shape: 'sprite',
      sheet: 'sheet1', sx: 216, sy: 23, sw: 63, sh: 457, baseAngleOffset: -Math.PI / 2, pivotX: 0.50, pivotY: 0.90, bladeLen: 457,
      glowColor: '#7fe3ff', trailColor: '#3498db',
      desc: 'Thần binh phân nhánh song phong đúc từ hàn băng vạn năm dưới đáy Huyền Băng Động.',
      pal: { blade: '#7fe3ff', bladeShade: '#3498db', hilt: '#1a3048', gold: '#a8f0ff', gem: '#50c8ff' } },
    { id: 'S1_KIM_QUANG_CHIEN_DAO', name: 'Kim Quang Chiến Đao', rarity: 'CucPham', price: 1800, realm: 1, shape: 'sprite',
      sheet: 'sheet1', sx: 297, sy: 23, sw: 98, sh: 457, baseAngleOffset: -Math.PI / 2, pivotX: 0.50, pivotY: 0.90, bladeLen: 457,
      glowColor: '#ffd23f', trailColor: '#f5c542',
      desc: 'Chiến đao rực ánh kim quang của đại năng Thiên Kiếm Tông, trảm phá yêu ma trong chớp mắt.',
      pal: { blade: '#f5c542', bladeShade: '#e89020', hilt: '#4a3010', gold: '#ffd700', gem: '#ffe066' } },
    { id: 'S1_HUYET_LONG_TRAM_DAO', name: 'Huyết Long Trảm Đao', rarity: 'ThanBinh', price: 2800, realm: 2, shape: 'sprite',
      sheet: 'sheet1', sx: 395, sy: 16, sw: 90, sh: 464, baseAngleOffset: -Math.PI / 2, pivotX: 0.50, pivotY: 0.90, bladeLen: 464,
      glowColor: '#ff6b4a', trailColor: '#e74c3c',
      desc: 'Trảm đao mang huyết mạch Chân Long, tôi luyện trong dung nham địa mạch ngàn năm.',
      pal: { blade: '#e74c3c', bladeShade: '#962d1c', hilt: '#3a1210', gold: '#f39c12', gem: '#ff4500' } },
    { id: 'S1_THUONG_LAM_THANH_KIEM', name: 'Thương Lam Thánh Kiếm', rarity: 'ThanBinh', price: 3200, realm: 2, shape: 'sprite',
      sheet: 'sheet1', sx: 489, sy: 19, sw: 101, sh: 460, baseAngleOffset: -Math.PI / 2, pivotX: 0.50, pivotY: 0.90, bladeLen: 460,
      glowColor: '#70d6ff', trailColor: '#f1c40f',
      desc: 'Thánh kiếm hộ tông khảm ngọc thái dương, hộ thủ bát quái xoay vần dẫn động thiên lôi.',
      pal: { blade: '#f1c40f', bladeShade: '#d4ac0d', hilt: '#2980b9', gold: '#ffd700', gem: '#70d6ff' } },
    { id: 'S1_HAC_THIET_TRONG_KIEM', name: 'Hắc Thiết Trọng Kiếm', rarity: 'Hiem', price: 800, realm: 0, shape: 'sprite',
      sheet: 'sheet1', sx: 590, sy: 20, sw: 80, sh: 444, baseAngleOffset: -Math.PI / 2, pivotX: 0.50, pivotY: 0.90, bladeLen: 444,
      glowColor: '#5dade2', trailColor: '#34495e',
      desc: 'Cổ kiếm thép rèn dày dặn của đệ tử chân truyền, trọng lượng ngàn cân vững như bàn thạch.',
      pal: { blade: '#2c3e50', bladeShade: '#1a252f', hilt: '#17202a', gold: '#5dade2', gem: '#85c1e9' } },

    // Hàng dưới (Bottom Row):
    { id: 'S1_TU_VIEM_MA_DAO', name: 'Tử Viêm Ma Đao', rarity: 'CucPham', price: 2000, realm: 1, shape: 'sprite',
      sheet: 'sheet1', sx: 30, sy: 480, sw: 85, sh: 544, baseAngleOffset: -Math.PI / 2, pivotX: 0.50, pivotY: 0.90, bladeLen: 544,
      glowColor: '#e056fd', trailColor: '#be2edd',
      desc: 'Ma nhận uốn lượn mang tà hỏa Tử Viêm, lưỡi kiếm sắc bén rạch toang hư không.',
      pal: { blade: '#c0392b', bladeShade: '#8e44ad', hilt: '#2c1a4d', gold: '#e056fd', gem: '#be2edd' } },
    { id: 'S1_HUYET_NGUC_TRONG_DAO', name: 'Huyết Ngục Trọng Đao', rarity: 'ThanBinh', price: 4200, realm: 2, shape: 'sprite',
      sheet: 'sheet1', sx: 115, sy: 480, sw: 134, sh: 550, baseAngleOffset: -Math.PI / 2, pivotX: 0.50, pivotY: 0.90, bladeLen: 550,
      glowColor: '#ff2d55', trailColor: '#8b0000',
      desc: 'Cự đao hung bạo từ Cửu U Huyết Ngục, mỗi nhát chém kèm theo tiếng gầm thét của vạn quỷ.',
      pal: { blade: '#111111', bladeShade: '#8b0000', hilt: '#2a0808', gold: '#e74c3c', gem: '#780206' } },
    { id: 'S1_BACH_KIM_THAN_THUONG', name: 'Bạch Kim Thần Thương', rarity: 'ThanBinh', price: 3600, realm: 2, shape: 'sprite',
      sheet: 'sheet1', sx: 265, sy: 480, sw: 80, sh: 545, baseAngleOffset: -Math.PI / 2, pivotX: 0.50, pivotY: 0.90, bladeLen: 545,
      glowColor: '#f1c40f', trailColor: '#ffffff',
      desc: 'Chiến nhận thần khải kết hợp bạch kim và hoàng kim giáp, uy phong lẫm liệt trảm yêu trừ ma.',
      pal: { blade: '#ecf0f1', bladeShade: '#bdc3c7', hilt: '#2c3e50', gold: '#f39c12', gem: '#f1c40f' } },
    { id: 'S1_HOANG_KIM_CU_KIEM', name: 'Hoàng Kim Cự Kiếm', rarity: 'ThanBinh', price: 3800, realm: 2, shape: 'sprite',
      sheet: 'sheet1', sx: 345, sy: 480, sw: 90, sh: 546, baseAngleOffset: -Math.PI / 2, pivotX: 0.50, pivotY: 0.90, bladeLen: 546,
      glowColor: '#f9e79f', trailColor: '#f4d03f',
      desc: 'Kiếm mang hình cánh phượng hoàng kim, ngưng tụ hỏa linh khí thuần khiết của thiên địa.',
      pal: { blade: '#d4ac0d', bladeShade: '#7d6608', hilt: '#4a3806', gold: '#f4d03f', gem: '#f9e79f' } },
    { id: 'S1_THANH_NGOC_CO_KIEM', name: 'Thanh Ngọc Cổ Kiếm', rarity: 'ThanBinh', price: 5500, realm: 3, shape: 'sprite',
      sheet: 'sheet1', sx: 435, sy: 480, sw: 75, sh: 536, baseAngleOffset: -Math.PI / 2, pivotX: 0.50, pivotY: 0.90, bladeLen: 536,
      glowColor: '#48c9b0', trailColor: '#16a085',
      desc: 'Cổ mâu ngưng tụ linh khí thượng cổ, thân kiếm như phi tiêu hắc thạch viền ngọc bích.',
      pal: { blade: '#17202a', bladeShade: '#1abc9c', hilt: '#0e1111', gold: '#48c9b0', gem: '#16a085' } },
    { id: 'S1_LOI_DINH_CHIEN_DAO', name: 'Lôi Đình Chiến Đao', rarity: 'TienKhi', price: 7200, realm: 3, shape: 'sprite',
      sheet: 'sheet1', sx: 510, sy: 487, sw: 61, sh: 540, baseAngleOffset: -Math.PI / 2, pivotX: 0.50, pivotY: 0.90, bladeLen: 540,
      glowColor: '#00f2fe', trailColor: '#4facfe',
      desc: 'Chiến kiếm laser lôi điện cửu thiên, chứa đựng lực phá hoại hủy thiên diệt địa của Lôi Kiếp.',
      pal: { blade: '#00f2fe', bladeShade: '#4facfe', hilt: '#1a2a40', gold: '#00f2fe', gem: '#4facfe' } },
    { id: 'S1_HAC_NGUYET_THAN_KIEM', name: 'Hắc Nguyệt Thần Kiếm', rarity: 'TienKhi', price: 9900, realm: 4, shape: 'sprite',
      sheet: 'sheet1', sx: 583, sy: 480, sw: 142, sh: 541, baseAngleOffset: -Math.PI / 2, pivotX: 0.50, pivotY: 0.90, bladeLen: 541,
      glowColor: '#f39c12', trailColor: '#ffffff',
      desc: 'Chí bảo tuyệt thế mang hình thánh thập tự và vầng trăng khuyết, chỉ bậc Hóa Thần chân nhân mới ngự nổi.',
      pal: { blade: '#ffffff', bladeShade: '#e67e22', hilt: '#332010', gold: '#f39c12', gem: '#ffffff' } },

    // === SHEET 2: TIÊN KHÍ HUYỄN TINH (Mũi kiếm hướng chéo xuống trái ~104°) ===
    { id: 'S2_TU_TINH_TIEN_KIEM', name: 'Tử Tinh Tiên Kiếm', rarity: 'CucPham', price: 2200, realm: 1, shape: 'sprite',
      sheet: 'sheet2', sx: 28, sy: 19, sw: 172, sh: 554, baseAngleOffset: 1.8118, pivotX: 0.80, pivotY: 0.06, bladeLen: 554,
      glowColor: '#d2b4de', trailColor: '#bb8fce',
      desc: 'Tế kiếm đúc từ tinh thể sao băng tử sắc, hộ thủ cánh sao lấp lánh tiên khí hộ thể.',
      pal: { blade: '#9b59b6', bladeShade: '#8e44ad', hilt: '#2c1a4d', gold: '#d2b4de', gem: '#bb8fce' } },
    { id: 'S2_HUYEN_BANG_THAN_KIEM', name: 'Huyền Băng Tiên Kiếm', rarity: 'ThanBinh', price: 4500, realm: 2, shape: 'sprite',
      sheet: 'sheet2', sx: 200, sy: 34, sw: 190, sh: 535, baseAngleOffset: 1.8118, pivotX: 0.82, pivotY: 0.08, bladeLen: 535,
      glowColor: '#70d6ff', trailColor: '#00c6ff',
      desc: 'Tuyệt phẩm thần kiếm kết tinh từ hàn băng ngàn năm, tỏa hàn khí đóng băng vạn dặm.',
      pal: { blade: '#00c6ff', bladeShade: '#0072ff', hilt: '#0c2840', gold: '#70d6ff', gem: '#00c6ff' } },
    { id: 'S2_HUYET_MAN_YEU_KIEM', name: 'Huyết Mạn Yêu Kiếm', rarity: 'ThanBinh', price: 4800, realm: 2, shape: 'sprite',
      sheet: 'sheet2', sx: 390, sy: 21, sw: 180, sh: 553, baseAngleOffset: 1.8118, pivotX: 0.88, pivotY: 0.06, bladeLen: 553,
      glowColor: '#e74c3c', trailColor: '#900c3f',
      desc: 'Yêu kiếm quấn dây leo huyết đằng Huyết Ngục, hút máu địch nhân để gia tăng uy lực.',
      pal: { blade: '#c0392b', bladeShade: '#780206', hilt: '#3a0c0c', gold: '#e74c3c', gem: '#900c3f' } },
    { id: 'S2_BANG_TY_HUYEN_KIEM', name: 'Băng Ty Huyễn Kiếm', rarity: 'TienKhi', price: 6800, realm: 3, shape: 'sprite',
      sheet: 'sheet2', sx: 593, sy: 24, sw: 187, sh: 554, baseAngleOffset: 1.8118, pivotX: 0.74, pivotY: 0.06, bladeLen: 554,
      glowColor: '#b2ebf2', trailColor: '#e0f7fa',
      desc: 'Kiếm mảnh như sợi tơ băng nhện, vô hình vô tướng, xuất chiêu trong chớp mắt không để lại dấu vết.',
      pal: { blade: '#e0f7fa', bladeShade: '#80deea', hilt: '#1a3a40', gold: '#b2ebf2', gem: '#e0f7fa' } },
    { id: 'S2_THANH_LIEN_TIEN_KIEM', name: 'Thanh Liên Tiên Kiếm', rarity: 'TienKhi', price: 7500, realm: 3, shape: 'sprite',
      sheet: 'sheet2', sx: 780, sy: 35, sw: 211, sh: 531, baseAngleOffset: 1.8118, pivotX: 0.75, pivotY: 0.07, bladeLen: 531,
      glowColor: '#ffeaa7', trailColor: '#55efc4',
      desc: 'Tiên kiếm ngưng tụ từ hoa sen nghìn năm trong hồ Dao Trì, chuôi kiếm nở đóa sen thần hộ chủ vĩnh hằng.',
      pal: { blade: '#2ecc71', bladeShade: '#fd79a8', hilt: '#1b4d2e', gold: '#ffeaa7', gem: '#55efc4' } },

    // === SHEET 3: CỔ ĐẠI THẦN BINH & MA KIẾM (Mũi kiếm hướng xuống dưới) ===
    // Hàng trên (Top Row):
    { id: 'S3_U_MOC_DOAN_KIEM', name: 'U Mộc Đoản Kiếm', rarity: 'Hiem', price: 600, realm: 0, shape: 'sprite',
      sheet: 'sheet3', sx: 41, sy: 52, sw: 52, sh: 351, baseAngleOffset: Math.PI / 2, pivotX: 0.50, pivotY: 0.09, bladeLen: 351,
      glowColor: '#58d68d', trailColor: '#2ecc71',
      desc: 'Đoản kiếm uốn lượn rèn từ lõi lim ngàn năm Linh Mộc Lâm, độc tính âm hàn khó lường.',
      pal: { blade: '#27ae60', bladeShade: '#145a32', hilt: '#1b261b', gold: '#58d68d', gem: '#2ecc71' } },
    { id: 'S3_CO_KIM_TRONG_DAO', name: 'Cổ Kim Trọng Đao', rarity: 'Hiem', price: 750, realm: 0, shape: 'sprite',
      sheet: 'sheet3', sx: 122, sy: 41, sw: 64, sh: 363, baseAngleOffset: Math.PI / 2, pivotX: 0.50, pivotY: 0.09, bladeLen: 363,
      glowColor: '#f1c40f', trailColor: '#d4ac0d',
      desc: 'Trọng đao cổ hoàng kim khảm phù văn thần bí, uy phong lẫm liệt vững chãi như núi.',
      pal: { blade: '#b7950b', bladeShade: '#7d6608', hilt: '#3a2e06', gold: '#f1c40f', gem: '#d4ac0d' } },
    { id: 'S3_DA_SAT_MA_DAO', name: 'Dạ Sát Ma Đao', rarity: 'CucPham', price: 1400, realm: 1, shape: 'sprite',
      sheet: 'sheet3', sx: 212, sy: 48, sw: 50, sh: 355, baseAngleOffset: Math.PI / 2, pivotX: 0.50, pivotY: 0.09, bladeLen: 355,
      glowColor: '#85929e', trailColor: '#2c3e50',
      desc: 'Chiến đao cong sắc nhọn của thích khách ám dạ, chém rách màn đêm không một tiếng động.',
      pal: { blade: '#1c2833', bladeShade: '#5d6d7e', hilt: '#11171d', gold: '#85929e', gem: '#2c3e50' } },
    { id: 'S3_TRAM_MA_DAI_DAO', name: 'Trảm Mã Đại Đao', rarity: 'CucPham', price: 1700, realm: 1, shape: 'sprite',
      sheet: 'sheet3', sx: 286, sy: 67, sw: 77, sh: 338, baseAngleOffset: Math.PI / 2, pivotX: 0.50, pivotY: 0.09, bladeLen: 338,
      glowColor: '#aeb6bf', trailColor: '#34495e',
      desc: 'Bản đao hình quạt dày nặng phi thường, uy lực quét sạch thiên quân vạn mã.',
      pal: { blade: '#2e4053', bladeShade: '#1b2631', hilt: '#121921', gold: '#aeb6bf', gem: '#34495e' } },
    { id: 'S3_VO_ANH_TE_KIEM', name: 'Vô Ảnh Tế Kiếm', rarity: 'CucPham', price: 2100, realm: 1, shape: 'sprite',
      sheet: 'sheet3', sx: 372, sy: 41, sw: 79, sh: 359, baseAngleOffset: Math.PI / 2, pivotX: 0.50, pivotY: 0.09, bladeLen: 359,
      glowColor: '#eaeded', trailColor: '#bdc3c7',
      desc: 'Tế kiếm hộ thủ cánh dơi mảnh mai tuyệt đối, tốc độ đâm nhanh tựa ánh chớp xé trời.',
      pal: { blade: '#d5d8dc', bladeShade: '#7f8c8d', hilt: '#2c3033', gold: '#eaeded', gem: '#bdc3c7' } },
    { id: 'S3_THAP_TU_MA_KIEM', name: 'Thập Tự Ma Kiếm', rarity: 'ThanBinh', price: 3300, realm: 2, shape: 'sprite',
      sheet: 'sheet3', sx: 462, sy: 35, sw: 61, sh: 367, baseAngleOffset: Math.PI / 2, pivotX: 0.50, pivotY: 0.09, bladeLen: 367,
      glowColor: '#7f8c8d', trailColor: '#17202a',
      desc: 'Ma kiếm hộ thủ chữ thập mang tà niệm thượng cổ, hộ thủ tựa cánh quỷ bảo vệ chủ nhân.',
      pal: { blade: '#17202a', bladeShade: '#2c3e50', hilt: '#0e1111', gold: '#7f8c8d', gem: '#17202a' } },
    { id: 'S3_HUYEN_CANG_TRUONG_KIEM', name: 'Huyền Cang Trường Kiếm', rarity: 'ThanBinh', price: 3500, realm: 2, shape: 'sprite',
      sheet: 'sheet3', sx: 547, sy: 34, sw: 38, sh: 370, baseAngleOffset: Math.PI / 2, pivotX: 0.50, pivotY: 0.09, bladeLen: 370,
      glowColor: '#95a5a6', trailColor: '#566573',
      desc: 'Trường kiếm thẳng tắp bằng thép tôi luyện ngàn năm, phong cách kiếm đạo chính tông của đại hiệp.',
      pal: { blade: '#34495e', bladeShade: '#1b2631', hilt: '#1a1f26', gold: '#95a5a6', gem: '#566573' } },
    { id: 'S3_THON_MA_COT_KIEM', name: 'Thôn Ma Cốt Kiếm', rarity: 'ThanBinh', price: 4000, realm: 2, shape: 'sprite',
      sheet: 'sheet3', sx: 622, sy: 53, sw: 57, sh: 351, baseAngleOffset: Math.PI / 2, pivotX: 0.50, pivotY: 0.09, bladeLen: 351,
      glowColor: '#e5e7e9', trailColor: '#17202a',
      desc: 'Lưỡi kiếm gai góc rèn từ hài cốt cự thú thời hồng hoang, mỗi gai sắc đều có thể cắn xé nguyên thần.',
      pal: { blade: '#2c3e50', bladeShade: '#839192', hilt: '#1c1b18', gold: '#e5e7e9', gem: '#17202a' } },

    // Hàng dưới (Bottom Row):
    { id: 'S3_KY_SI_THAP_TU', name: 'Kỵ Sĩ Thập Tự Kiếm', rarity: 'Hiem', price: 900, realm: 0, shape: 'sprite',
      sheet: 'sheet3', sx: 0, sy: 520, sw: 115, sh: 458, baseAngleOffset: Math.PI / 2, pivotX: 0.50, pivotY: 0.09, bladeLen: 458,
      glowColor: '#f1c40f', trailColor: '#bdc3c7',
      desc: 'Thánh kiếm thập tự kinh điển viền vàng, tượng trưng cho đức tin và lòng dũng cảm bất diệt.',
      pal: { blade: '#ecf0f1', bladeShade: '#bdc3c7', hilt: '#2c3e50', gold: '#d4ac0d', gem: '#f1c40f' } },
    { id: 'S3_SONG_DAU_THU_KIEM', name: 'Song Đầu Thứ Kiếm', rarity: 'CucPham', price: 2400, realm: 1, shape: 'sprite',
      sheet: 'sheet3', sx: 115, sy: 521, sw: 79, sh: 501, baseAngleOffset: Math.PI / 2, pivotX: 0.50, pivotY: 0.09, bladeLen: 501,
      glowColor: '#c0392b', trailColor: '#7b241c',
      desc: 'Kiếm hoa văn song đầu sắc lạnh, cả hai đầu đều có thể đâm xuyên mọi lớp hộ thể chân khí.',
      pal: { blade: '#922b21', bladeShade: '#641e16', hilt: '#310f0c', gold: '#c0392b', gem: '#7b241c' } },
    { id: 'S3_HAC_LONG_BA_VAN', name: 'Hắc Long Ba Văn Kiếm', rarity: 'ThanBinh', price: 3900, realm: 2, shape: 'sprite',
      sheet: 'sheet3', sx: 222, sy: 523, sw: 65, sh: 465, baseAngleOffset: Math.PI / 2, pivotX: 0.50, pivotY: 0.09, bladeLen: 465,
      glowColor: '#566573', trailColor: '#0e1111',
      desc: 'Thần kiếm uốn lượn như vảy rồng đen bơi trong nước lũ, lưỡi kiếm xoáy lượn sát phạt vô song.',
      pal: { blade: '#17202a', bladeShade: '#212f3d', hilt: '#0a0d10', gold: '#566573', gem: '#0e1111' } },
    { id: 'S3_THUONG_CO_LONG_DAO', name: 'Thượng Cổ Long Đao', rarity: 'ThanBinh', price: 5800, realm: 3, shape: 'sprite',
      sheet: 'sheet3', sx: 310, sy: 521, sw: 75, sh: 469, baseAngleOffset: Math.PI / 2, pivotX: 0.50, pivotY: 0.09, bladeLen: 469,
      glowColor: '#d4ac0d', trailColor: '#b9770e',
      desc: 'Long đao rèn từ vảy rồng đất thời hồng hoang, thân đao chạm trổ rồng thiêng gầm vang rung chuyển đất trời.',
      pal: { blade: '#b7950b', bladeShade: '#784212', hilt: '#3a200a', gold: '#d4ac0d', gem: '#b9770e' } },
    { id: 'S3_NGAN_HOA_THANH_KIEM', name: 'Ngân Hoa Thánh Kiếm', rarity: 'ThanBinh', price: 6200, realm: 3, shape: 'sprite',
      sheet: 'sheet3', sx: 400, sy: 521, sw: 103, sh: 499, baseAngleOffset: Math.PI / 2, pivotX: 0.50, pivotY: 0.09, bladeLen: 499,
      glowColor: '#e5e8e8', trailColor: '#a6acaf',
      desc: 'Thánh kiếm chạm khắc hoa văn bạch ngân tinh xảo, hộ thủ xòe rộng tựa hoa bách hợp nở rộ.',
      pal: { blade: '#d0d3d4', bladeShade: '#616a6b', hilt: '#273746', gold: '#e5e8e8', gem: '#a6acaf' } },
    { id: 'S3_DOAN_PHONG_KHOAN_KIEM', name: 'Đoản Phong Khoan Kiếm', rarity: 'TienKhi', price: 6900, realm: 3, shape: 'sprite',
      sheet: 'sheet3', sx: 510, sy: 520, sw: 85, sh: 474, baseAngleOffset: Math.PI / 2, pivotX: 0.50, pivotY: 0.09, bladeLen: 474,
      glowColor: '#5dade2', trailColor: '#212f3d',
      desc: 'Cổ kiếm bản rộng uy nghiêm rèn bằng huyền thiết ngàn năm, trảm phá phong ba bảo vệ tông môn.',
      pal: { blade: '#1c2833', bladeShade: '#2e4053', hilt: '#11171d', gold: '#5dade2', gem: '#212f3d' } },
    { id: 'S3_XICH_VIEM_CU_KIEM', name: 'Xích Viêm Cự Kiếm', rarity: 'TienKhi', price: 12000, realm: 4, shape: 'sprite',
      sheet: 'sheet3', sx: 595, sy: 434, sw: 95, sh: 667, baseAngleOffset: Math.PI / 2, pivotX: 0.50, pivotY: 0.07, bladeLen: 667,
      glowColor: '#f39c12', trailColor: '#ba4a00',
      desc: 'Tuyệt đại cự kiếm khổng lồ mang hồn phách Hỏa Long thượng cổ, lưỡi kiếm rực cháy dung nham vĩnh cửu.',
      pal: { blade: '#d35400', bladeShade: '#e74c3c', hilt: '#3d1604', gold: '#f39c12', gem: '#ba4a00' } },

    // === CÁC DÁNG KIẾM TRUYỀN THỐNG (Procedural Vector) ===
    { id: 'THANH_PHONG', name: 'Thanh Phong Kiếm', rarity: 'Hiem', price: 0, realm: 0, shape: 'jian',
      desc: 'Trường kiếm thép xanh của đệ tử nhập môn, hộ thủ đồng vàng.', pal: {} },
    { id: 'HAN_BANG', name: 'Hàn Băng Kiếm', rarity: 'Hiem', price: 900, realm: 0, shape: 'thin',
      desc: 'Kiếm mảnh rèn từ băng tinh ngàn năm, lưỡi mỏng như lá lúa, hộ thủ bạc.',
      pal: { blade: '#e6fbff', bladeShade: '#6fc4e8', hilt: '#2a4a6a', gold: '#c8e6f4', goldHi: '#ffffff', goldDark: '#5a8aa8' } },
    { id: 'XICH_LONG', name: 'Xích Long Kiếm', rarity: 'CucPham', price: 1800, realm: 1, shape: 'broad',
      desc: 'Bản kiếm rộng tôi trong hỏa mạch Hỏa Diệm Cốc, lưỡi ánh đỏ như vảy rồng.',
      pal: { blade: '#ffe2c8', bladeShade: '#e0603a', hilt: '#5a1a14', gold: '#f2b03a', goldHi: '#ffe08a', goldDark: '#8a4a10' } },
    { id: 'LOI_AM', name: 'Lôi Âm Kiếm', rarity: 'ThanBinh', price: 3000, realm: 2, shape: 'jian',
      desc: 'Lưỡi kiếm tím nhạt hấp thụ lôi kiếp, khẽ vung đã nghe tiếng sấm rền.',
      pal: { blade: '#f2e8ff', bladeShade: '#9a6ae0', hilt: '#2a1a40', gold: '#b48cff', goldHi: '#e8d8ff', goldDark: '#5a3a8a' } },
    { id: 'HUYEN_THIET', name: 'Huyền Thiết Trọng Kiếm', rarity: 'ThanBinh', price: 4000, realm: 2, shape: 'heavy',
      desc: 'Trọng kiếm vô phong bằng huyền thiết đen, mũi bằng, nặng tựa núi.',
      pal: { blade: '#9aa0b0', bladeShade: '#3a3e4a', hilt: '#1a1a22', gold: '#6a6a7a', goldHi: '#b0b0c0', goldDark: '#2a2a34' } },
    { id: 'KIM_O', name: 'Kim Ô Thần Kiếm', rarity: 'TienKhi', price: 7000, realm: 3, shape: 'broad',
      desc: 'Thần kiếm vàng rực mang hỏa tinh Kim Ô, chỉ bậc Nguyên Anh mới cầm nổi.',
      pal: { blade: '#fff4c8', bladeShade: '#e0a83a', hilt: '#7a1a1a', gold: '#ffd23f', goldHi: '#fff2a8', goldDark: '#a0660e' } },
    { id: 'NHAT_DIEM', name: 'Nhật Diệm Thần Kiếm', rarity: 'TienKhi', price: 9000, realm: 3, shape: 'solar_flame',
      desc: 'Thần kiếm hắc kim khảm Nhật Luân, lưỡi kiếm uốn như hỏa diệm và tỏa linh quang vàng rực.',
      pal: { blade: '#201b18', bladeShade: '#62513b', hilt: '#211b18', gold: '#d99a25', goldHi: '#fff2a6',
        goldDark: '#624018', accent: '#ffb52e', gem: '#fff3a0' } }
  ],

  // ---- Thần Luân (Halos xoay sau lưng) ---------------------------------------
  halos: [
    { id: 'HALO_CRIMSON_SUN', name: 'Huyết Nhật Thần Luân', color: '#ff3b3b', price: 5000, realm: 3,
      desc: 'Thần luân thái dương đỏ rực như máu, tỏa ra nhiệt lượng cực hạn thiêu đốt vạn vật chư thiên.' },
    { id: 'HALO_1', name: 'Ngũ Hành Linh Luân', color: '#38bdf8', col: 0, row: 0, price: 1500, realm: 1,
      desc: 'Thần luân tụ hợp linh khí Ngũ Hành Kim - Mộc - Thủy - Hỏa - Thổ luân chuyển bất tận.' },
    { id: 'HALO_2', name: 'Bát Quái Càn Khôn Luân', color: '#ffd23f', col: 1, row: 0, price: 2000, realm: 1,
      desc: 'Khắc họa 64 quẻ Càn Khôn Bát Quái, hộ thể trừ tà, vạn pháp bất xâm.' },
    { id: 'HALO_3', name: 'Thái Cực Âm Dương Luân', color: '#e2e8f0', col: 2, row: 0, price: 2500, realm: 2,
      desc: 'Đạo pháp tự nhiên, Âm Dương tương sinh tương khắc, huyền diệu khôn lường.' },
    { id: 'HALO_4', name: 'Cửu Thiên Lôi Luân', color: '#c084fc', col: 0, row: 1, price: 3000, realm: 2,
      desc: 'Tụ lôi đình chín tầng trời, mỗi vòng xoay tỏa ra hàng ngàn tia điện cuồng bạo.' },
    { id: 'HALO_5', name: 'Huyền Băng Hàn Luân', color: '#67e8f9', col: 1, row: 1, price: 3500, realm: 2,
      desc: 'Đúc từ băng phách vạn năm, hàn khí thấu xương phong tỏa hư không.' },
    { id: 'HALO_6', name: 'Hỗn Độn Thần Luân', color: '#f43f5e', col: 2, row: 1, price: 4000, realm: 3,
      desc: 'Mang khí tức thuở khai thiên lập địa, phá vỡ mọi quy tắc trật tự linh lực.' },
    { id: 'HALO_7', name: 'Hư Không Tinh Luân', color: '#818cf8', col: 0, row: 2, price: 4500, realm: 3,
      desc: 'Tinh hà cuồn cuộn trong thần luân, dịch chuyển không gian trong chớp mắt.' },
    { id: 'HALO_8', name: 'Vạn Tinh Trận Luân', color: '#facc15', col: 1, row: 2, price: 5000, realm: 3,
      desc: 'Đại trận chu thiên tinh tú ngưng tụ sau lưng, uy áp như thiên thần giáng thế.' },
    { id: 'HALO_9', name: 'Phật Quang Kim Luân', color: '#fbbf24', col: 2, row: 2, price: 6000, realm: 3,
      desc: 'Kim quang phổ chiếu, phổ độ chúng sinh, hàng phục ma chướng vạn giới.' },
    { id: 'HALO_10', name: 'U Minh Ma Luân', color: '#a855f7', col: 0, row: 3, price: 7000, realm: 4,
      desc: 'Thần luân ma đạo từ U Minh giới, hấp thụ linh hồn và tà niệm thiên địa.' },
    { id: 'HALO_11', name: 'Chu Tước Hỏa Luân', color: '#fb923c', col: 1, row: 3, price: 8000, realm: 4,
      desc: 'Lửa Chu Tước Niết Bàn rực rỡ, thiêu rụi tà ma và hồi sinh sinh lực vô tận.' },
    { id: 'HALO_12', name: 'Vô Cực Thần Luân', color: '#4ade80', col: 2, row: 3, price: 10000, realm: 4,
      desc: 'Đỉnh cao đại đạo vô cực, quy về hư vô, vạn giới tôn sùng làm chí tôn.' }
  ],

  // ---- Cánh (Tiên Dực đập cánh) ----------------------------------------------
  wings: [
    { id: 'WINGS_NIGHT_BLUE', name: 'Dạ Lam Tiên Dực', row: 0, col: 0, color: '#38bdf8', price: 4500, realm: 2,
      desc: 'Đôi cánh lông vũ lam đêm đan xen tinh hoa dạ quang kỳ ảo, giúp thân pháp nhẹ như làn gió.' },
    { id: 'WINGS_GOLDEN_DAWN', name: 'Hoàng Kim Tiên Dực', row: 1, col: 0, color: '#fbbf24', price: 9000, realm: 3,
      desc: 'Đôi cánh hoàng kim chói lọi mang sức mạnh thần thánh của bình minh xé tan bóng tối.' }
  ],

  // ---- Tiên Nhãn / Ma Nhãn (Mắt) ---------------------------------------------
  eyes: [
    { id: 'EYE_1', name: 'Tử Đồng Ma Nhãn', col: 0, row: 0, desc: 'Ma nhãn tím huyền bí nhìn thấu mọi ảo ảnh và điểm yếu của đối thủ.' },
    { id: 'EYE_2', name: 'Băng Phách Tinh Nhãn', col: 1, row: 0, desc: 'Đồng tử băng lam trong suốt tỏa ra hàn khí đông cứng tâm trí kẻ thù.' },
    { id: 'EYE_3', name: 'Xích Diễm Thần Nhãn', col: 2, row: 0, desc: 'Mắt đỏ rực lửa thiêu đốt linh hồn kẻ dám nhìn thẳng.' },
    { id: 'EYE_4', name: 'Lôi Đình Thần Đồng', col: 3, row: 0, desc: 'Chớp giật liên hồi trong đáy mắt, dẫn động thiên kiếp thần lôi.' },
    { id: 'EYE_5', name: 'Hắc Ám Thôn Phệ Nhãn', col: 4, row: 0, desc: 'Vực sâu bóng tối nuốt chửng mọi ánh sáng và pháp thuật chiếu tới.' },
    { id: 'EYE_6', name: 'Bích Ngọc Tiên Đồng', col: 0, row: 1, desc: 'Mắt ngọc bích thanh khiết cảm ứng mộc linh và sinh khí trời đất.' },
    { id: 'EYE_7', name: 'Hoàng Kim Long Nhãn', col: 1, row: 1, desc: 'Đồng tử hoàng kim của Thần Long thượng cổ, uy áp nhiếp hồn đoạt phách.' },
    { id: 'EYE_8', name: 'Hư Không Huyễn Nhãn', col: 2, row: 1, desc: 'Biến hóa khôn lường giữa thực và ảo, né tránh công kích chí mạng.' },
    { id: 'EYE_9', name: 'U Minh Quỷ Nhãn', col: 3, row: 1, desc: 'Nhìn thấy luân hồi sinh tử và dấu vết linh hồn phiêu bạt.' },
    { id: 'EYE_10', name: 'Bạch Ngân Thánh Nhãn', col: 4, row: 1, desc: 'Ánh mắt thần thánh của đấng cứu thế, thanh tẩy mọi tà khí độc chướng.' },
    { id: 'EYE_11', name: 'Thương Khung Vân Nhãn', col: 0, row: 2, desc: 'Bao quát chín tầng mây, quan sát vạn dặm sơn hà không góc chết.' },
    { id: 'EYE_12', name: 'Huyết Sát Cuồng Đồng', col: 1, row: 2, desc: 'Huyết quang cuồng bạo kích phát chiến ý tột đỉnh trong nghịch cảnh.' },
    { id: 'EYE_13', name: 'Thái Cực Đạo Nhãn', col: 2, row: 2, desc: 'Âm Dương xoay vần, hóa giải công kích kẻ địch thành linh lực bản thân.' },
    { id: 'EYE_14', name: 'Cửu U Linh Nhãn', col: 3, row: 2, desc: 'Linh nhãn sâu thẳm nơi Cửu U, thông suốt cổ kim vạn kiếp.' },
    { id: 'EYE_15', name: 'Chu Tước Hỏa Nhãn', col: 4, row: 2, desc: 'Ngọn lửa bất tử rực cháy, nhìn thấu chân hỏa căn nguyên.' },
    { id: 'EYE_16', name: 'Huyền Vũ Thần Đồng', col: 0, row: 3, desc: 'Trấn thủ tâm can, định thần bất động trước mọi đòn tâm linh.' },
    { id: 'EYE_17', name: 'Bạch Hổ Sát Nhãn', col: 1, row: 3, desc: 'Sát khí Tây phương ngút trời, trảm phá tâm ma chỉ bằng một ánh nhìn.' },
    { id: 'EYE_18', name: 'Thanh Long Tinh Đồng', col: 2, row: 3, desc: 'Thần thông Đông hải, ngưng tụ phong lôi biến ảo khôn cùng.' },
    { id: 'EYE_19', name: 'Kim Cương Bất Diệt Nhãn', col: 3, row: 3, desc: 'Ánh vàng kim cương bất hoại, kiên định trước vạn kiếp trầm luân.' },
    { id: 'EYE_20', name: 'Hỗn Độn Sơ Khai Nhãn', col: 4, row: 3, desc: 'Vũ trụ sơ sinh trong đáy mắt, giải cấu mọi trận pháp thế gian.' },
    { id: 'EYE_21', name: 'Lưu Ly Tịnh Quang Nhãn', col: 0, row: 4, desc: 'Trong vắt không tỳ vết, miễn nhiễm toàn bộ trạng thái khống chế.' },
    { id: 'EYE_22', name: 'Tịch Diệt Ma Đồng', col: 1, row: 4, desc: 'Hủy diệt vạn vật, mang lại cái chết êm đềm trong hư vô.' },
    { id: 'EYE_23', name: 'Vạn Hoa Tiên Nhãn', col: 2, row: 4, desc: 'Cánh hoa luân chuyển tạo ảo mộng mê hoặc ngũ giác kẻ thù.' },
    { id: 'EYE_24', name: 'Tinh Thần Khải Thị Nhãn', col: 3, row: 4, desc: 'Đọc trước hướng đi của đối phương qua quỹ đạo các vì sao.' },
    { id: 'EYE_25', name: 'Minh Phủ Luân Hồi Nhãn', col: 4, row: 4, desc: 'Mở ra cánh cổng âm ti, câu hồn đoạt phách yêu ma quỷ quái.' },
    { id: 'EYE_26', name: 'Vô Nhai Tiên Nhãn', col: 0, row: 5, desc: 'Bể học vô nhai, gia tăng tốc độ lĩnh ngộ công pháp gấp bội.' },
    { id: 'EYE_27', name: 'Thiên Đạo Trọng Nhãn', col: 1, row: 5, desc: 'Ý chí Thiên Đạo giáng lâm, trừng phạt kẻ nghịch thiên bằng sấm sét.' },
    { id: 'EYE_28', name: 'Chí Tôn Thần Hoàng Nhãn', col: 2, row: 5, desc: 'Ánh mắt hoàng giả đế vương, vạn thú cúi đầu thần phục.' }
  ],

  // ---- Ngoại Trang Hóa Thần / Pháp Tướng (Avatars) --------------------------
  avatarSkins: [
    { id: 'AVATAR_URANOS', name: 'Uranos · Thiên Không Chiến Thần', file: 'skin_uranos.jpg', price: 15000, realm: 3,
      desc: 'Chiến giáp cơ giới thiên không tối thượng, đôi cánh hoàng kim rực rỡ mang sức mạnh thống trị vòm trời.' },
    { id: 'AVATAR_COSMIC', name: 'Cosmic · Tinh Vũ Chúa Tể', file: 'skin_cosmic.jpg', price: 20000, realm: 3,
      desc: 'Pháp tướng tinh tú vũ trụ bao la, khoác dải ngân hà lấp lánh và triệu hồi thiên thạch hủy diệt.' },
    { id: 'AVATAR_PRISM', name: 'Prism · Thất Sắc Quang Thần', file: 'skin_prism.jpg', price: 25000, realm: 3,
      desc: 'Hóa thân của lăng kính ánh sáng bảy sắc, phản chiếu và khúc xạ mọi đòn đánh ma pháp.' },
    { id: 'AVATAR_WATER_DRAGON', name: 'Hải Thần Thủy Long Tướng', file: 'skin_water_dragon.jpg', price: 30000, realm: 4,
      desc: 'Thần tướng ngự long từ đáy Bắc Hải, điều khiển sóng thần cuồn cuộn chấn nhiếp bát hoang.' },
    { id: 'AVATAR_WHITE_PURPLE', name: 'Bạch Tử Ngự Kiếm Chân Quân', file: 'skin_white_purple.jpg', price: 35000, realm: 4,
      desc: 'Chân quân áo trắng viền tím phong độ phi phàm, vạn kiếm quy tông xuất quỷ nhập thần.' },
    { id: 'AVATAR_CHAOS_TRINITY', name: 'Hỗn Độn Tam Vị Pháp Tướng', file: 'skin_chaos_trinity.jpg', price: 40000, realm: 4,
      desc: 'Ba vị pháp thân hợp nhất trong luồng năng lượng hỗn độn vô tận, uy áp chư thiên tiên ma.' },
    { id: 'AVATAR_RIKAMU', name: 'Rikami · Xích Diễm Cơ Giáp', file: 'skin_rikami.jpg', price: 42000, realm: 4,
      desc: 'Chiến thần cơ giáp bốc lửa đỏ rực, thiêu đốt chiến trường bằng hỏa tiễn và đại đao hạt nhân.' },
    { id: 'AVATAR_NETHER_EMPRESS', name: 'U Minh Nữ Đế Pháp Tướng', file: 'skin_nether_empress.jpg', price: 48000, realm: 4,
      desc: 'Nữ đế tôn quý chốn Cửu U Minh Giới, cử chỉ thanh tao nhưng ẩn chứa uy lực diệt thế.' },
    { id: 'AVATAR_WINGED_SERAPH', name: 'Lục Dực Thiên Sứ Pháp Thân', file: 'skin_winged_seraph.jpg', price: 50000, realm: 4,
      desc: 'Pháp thân sáu cánh thiên sứ thánh khiết, hào quang rực rỡ che chở sinh linh khỏi mọi kiếp nạn.' }
  ],

  startingKit: {
    linhThach: 300,
    items: [['HOI_HUYET_DAN', 5], ['HOI_LINH_DAN', 3], ['TAY_LUYEN_THACH', 10], ['DINH_HON_CHAU', 2], ['THANH_TAM_DAN', 1], ['TI_LOI_PHU', 1]],
    quickSlots: ['HOI_HUYET_DAN', 'HOI_LINH_DAN', null, null],
    weapon: { slot: 'Weapon', element: 'Kim', rarity: 'LinhKhi' }
  }
};
