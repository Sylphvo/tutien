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
      desc: 'Vương của Huyền Băng Động. Hồ ly chín đuôi, xả 16 băng tiễn làm chậm và lướt chớp nhoáng.' }
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
      lines: ['Kiếm như người, người như kiếm. Y phục cũng là một phần của kiếm ý.',
        'Xếp trang bị đúng vòng Kim → Thủy → Mộc → Hỏa → Thổ, kiếm khí sẽ cộng hưởng.'],
      actions: [['Y Phục', 'skins']] },
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
      { kind: 'sword_pavilion', x: -17, y: 8, interact: 'skins', label: 'Kiếm Các — Y Phục [E]' },
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

  // ---- Bí Cảnh: 3 vùng ------------------------------------------------------
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
      pal: { robe: '#5a4486', robeShade: '#3a2a5e', robeDeep: '#22163a', inner: '#d8b4ff', innerDark: '#8a5ac8', hair: '#8a72c0', hairMid: '#e0d0ff', iris: '#a06ae0' } }
  ],

  // ---- Kiếm hình (skin kiếm) -------------------------------------------------
  // Chỉ đổi ngoại hình: kiếm cầm tay + phi kiếm. Màu hào quang/vệt kiếm vẫn theo hệ của vũ khí.
  // shape: dáng lưỡi (xem TT.Art.swordShape). pal: blade/bladeShade (lưỡi), hilt (chuôi), gold/goldHi/goldDark (hộ thủ).
  swordSkins: [
    { id: 'THANH_PHONG', name: 'Thanh Phong Kiếm', price: 0, realm: 0, shape: 'jian',
      desc: 'Trường kiếm thép xanh của đệ tử nhập môn, hộ thủ đồng vàng.', pal: {} },
    { id: 'HAN_BANG', name: 'Hàn Băng Kiếm', price: 900, realm: 0, shape: 'thin',
      desc: 'Kiếm mảnh rèn từ băng tinh ngàn năm, lưỡi mỏng như lá lúa, hộ thủ bạc.',
      pal: { blade: '#e6fbff', bladeShade: '#6fc4e8', hilt: '#2a4a6a', gold: '#c8e6f4', goldHi: '#ffffff', goldDark: '#5a8aa8' } },
    { id: 'XICH_LONG', name: 'Xích Long Kiếm', price: 1800, realm: 1, shape: 'broad',
      desc: 'Bản kiếm rộng tôi trong hỏa mạch Hỏa Diệm Cốc, lưỡi ánh đỏ như vảy rồng.',
      pal: { blade: '#ffe2c8', bladeShade: '#e0603a', hilt: '#5a1a14', gold: '#f2b03a', goldHi: '#ffe08a', goldDark: '#8a4a10' } },
    { id: 'LOI_AM', name: 'Lôi Âm Kiếm', price: 3000, realm: 2, shape: 'jian',
      desc: 'Lưỡi kiếm tím nhạt hấp thụ lôi kiếp, khẽ vung đã nghe tiếng sấm rền.',
      pal: { blade: '#f2e8ff', bladeShade: '#9a6ae0', hilt: '#2a1a40', gold: '#b48cff', goldHi: '#e8d8ff', goldDark: '#5a3a8a' } },
    { id: 'HUYEN_THIET', name: 'Huyền Thiết Trọng Kiếm', price: 4000, realm: 2, shape: 'heavy',
      desc: 'Trọng kiếm vô phong bằng huyền thiết đen, mũi bằng, nặng tựa núi.',
      pal: { blade: '#9aa0b0', bladeShade: '#3a3e4a', hilt: '#1a1a22', gold: '#6a6a7a', goldHi: '#b0b0c0', goldDark: '#2a2a34' } },
    { id: 'KIM_O', name: 'Kim Ô Thần Kiếm', price: 7000, realm: 3, shape: 'broad',
      desc: 'Thần kiếm vàng rực mang hỏa tinh Kim Ô, chỉ bậc Nguyên Anh mới cầm nổi.',
      pal: { blade: '#fff4c8', bladeShade: '#e0a83a', hilt: '#7a1a1a', gold: '#ffd23f', goldHi: '#fff2a8', goldDark: '#a0660e' } }
  ],

  startingKit: {
    linhThach: 300,
    items: [['HOI_HUYET_DAN', 5], ['HOI_LINH_DAN', 3], ['TAY_LUYEN_THACH', 10], ['DINH_HON_CHAU', 2], ['THANH_TAM_DAN', 1], ['TI_LOI_PHU', 1]],
    quickSlots: ['HOI_HUYET_DAN', 'HOI_LINH_DAN', null, null],
    weapon: { slot: 'Weapon', element: 'Kim', rarity: 'LinhKhi' }
  }
};
