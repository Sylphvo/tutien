// Kiểm tra logic thuần (không cần trình duyệt): node tests/tutien/logic.test.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const root = path.join(__dirname, '../../src/tutien/js');
const dummyCtx = {
  save() {}, restore() {}, translate() {}, rotate() {},
  beginPath() {}, closePath() {}, moveTo() {}, lineTo() {},
  bezierCurveTo() {}, quadraticCurveTo() {}, arc() {}, fill() {},
  stroke() {}, fillRect() {}, strokeRect() {}, clearRect() {},
  drawImage() {}, setTransform() {}, createLinearGradient: () => ({ addColorStop() {} }),
  createRadialGradient: () => ({ addColorStop() {} }),
  measureText: () => ({ width: 10 }),
  fillText() {}, ellipse() {}, clip() {}, rect() {}, scale() {}
};
const ctx = {
  window: {},
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  Math, Date, console,
  document: {
    createElement: () => ({ getContext: () => dummyCtx, style: {}, classList: { add() {} } })
  }
};
ctx.window = ctx;
vm.createContext(ctx);
for (const f of ['util.js', 'data.js', 'items.js', 'state.js', 'art.js', 'environment.js', 'monsters.js', 'game.js']) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx);
const TT = ctx.TT, D = TT.DATA, I = TT.Items;

// 0. Skin Kiếm Nhật Diệm & Băng Tinh Kiếm (Crystal Sword) available
const solarFlameSword = D.swordSkins.find(sword => sword.id === 'NHAT_DIEM');
assert(solarFlameSword, 'thiếu skin Nhật Diệm');
assert.strictEqual(solarFlameSword.shape, 'solar_flame');
assert.strictEqual(solarFlameSword.pal.blade, '#201b18');
assert.strictEqual(solarFlameSword.pal.gem, '#fff3a0');

const crystalSword = D.swordSkins.find(sword => sword.id === 'BANG_TINH');
assert(crystalSword, 'thiếu skin Băng Tinh Kiếm');
assert.strictEqual(crystalSword.shape, 'crystal_sword');
assert.strictEqual(crystalSword.price, 0);
assert(TT.Art.renderCrystalSwordSprite, 'thiếu hàm renderCrystalSwordSprite');
assert.strictEqual(typeof TT.Art.CRYSTAL_SWORD_BASE_ANGLE, 'number');

// 0.1 Kiểm tra vũ khí từ sheet1, sheet2, sheet3
assert(TT.Art.getWeaponSprite, 'thiếu hàm getWeaponSprite');
assert(TT.Art.cleanImageBackground, 'thiếu hàm cleanImageBackground');
const s1Weapon = D.swordSkins.find(s => s.id === 'S1_HUYET_LONG_TRAM_DAO');
assert(s1Weapon, 'thiếu kiếm Huyết Long Trảm Đao từ sheet1');
assert.strictEqual(s1Weapon.sheet, 'sheet1');
assert.strictEqual(s1Weapon.baseAngleOffset, -Math.PI / 2);

const s2Weapon = D.swordSkins.find(s => s.id === 'S2_TU_TINH_TIEN_KIEM');
assert(s2Weapon, 'thiếu kiếm Tử Tinh Tiên Kiếm từ sheet2');
assert.strictEqual(s2Weapon.sheet, 'sheet2');
assert.strictEqual(s2Weapon.baseAngleOffset, 1.8118);

const s3Weapon = D.swordSkins.find(s => s.id === 'S3_XICH_VIEM_CU_KIEM');
assert(s3Weapon, 'thiếu kiếm Xích Viêm Cự Kiếm từ sheet3');
assert.strictEqual(s3Weapon.sheet, 'sheet3');
assert.strictEqual(s3Weapon.baseAngleOffset, Math.PI / 2);

// 1. Sinh trang bị đúng số dòng, Tier trong giới hạn, không trùng, Unique hợp lệ
for (let n = 0; n < 5000; n++) {
  const it = I.createEquipment({ level: 1 + (n % 12), identified: true });
  const rar = I.rarityById[it.rarity];
  const ids = new Set(it.affixes.map(a => a.AffixId));
  assert.strictEqual(ids.size, it.affixes.length, 'trùng từ tố');
  assert(it.affixes.length <= rar.affixCount);
  let uniq = 0;
  for (const a of it.affixes) {
    const def = I.affixById[a.AffixId];
    assert(a.Tier >= rar.minTier && a.Tier <= rar.maxTier, 'tier ngoài giới hạn');
    assert(def.ApplicableSlots.includes(it.slot), 'sai ô');
    assert(def.TierRanges[a.Tier], 'tier không có range');
    if (def.Category === 'Unique') uniq++;
  }
  assert(uniq <= rar.maxUnique, 'quá số Unique');
}

// 2. Tẩy luyện giữ dòng khóa, Linh Vận ép T5 ở lần thứ 101
const item = I.createEquipment({ slot: 'Weapon', rarity: 'TienKhi', level: 5, identified: true });
item.affixes[0].IsLocked = true;
const locked = JSON.stringify(item.affixes[0]);
let pity = 0, forcedAt = -1;
for (let i = 0; i < 101; i++) {
  const r = TT.Reroll.reroll(item, pity);
  assert.strictEqual(JSON.stringify(item.affixes[0]), locked, 'dòng khóa bị thay đổi');
  if (r.forced) { forcedAt = i; assert(r.newTier5.length >= 1, 'pity không ra T5'); }
  pity = r.pity;
}
assert.strictEqual(forcedAt, 100);
assert.strictEqual(pity, 0);

// 3. Chi phí theo công thức GDD
const c = TT.Reroll.cost(item);
assert.strictEqual(c.linhThach, Math.round(D.reroll.baseCost * 5 * 1.5 * 2));
assert.strictEqual(c.dinhHonChau, 1);

// 4. Cộng hưởng Ngũ Hành
const st = new TT.PlayerState();
st.giveStartingKit();
const mk = (slot, element) => I.createEquipment({ slot, element, rarity: 'PhapKhi', level: 1, identified: true });
st.equipment = { Weapon: mk('Weapon', 'Kim'), Armor: mk('Armor', 'Thuy'), Ring: mk('Ring', 'Moc'), Boots: mk('Boots', 'Hoa'), Accessory: mk('Accessory', 'Tho') };
st.recompute();
assert.strictEqual(st.stats.resonanceCount, 5);
st.equipment.Armor = mk('Armor', 'Hoa');
st.recompute();
assert.strictEqual(st.stats.resonance.Armor, false);
assert.strictEqual(st.stats.resonance.Ring, false);

// 5. Túi đồ: Nạp Giới mở rộng sức chứa
assert.strictEqual(st.inventory.capacity, D.inventory.baseSlots + D.inventory.ringBonusSlots.PhapKhi);

// 6. Xếp chồng
const inv = new TT.Inventory();
assert.strictEqual(inv.add(I.createStack('LINH_THAO', 1500)), 0);
assert.strictEqual(inv.items.length, 2);
assert(inv.remove('LINH_THAO', 1200));
assert.strictEqual(inv.count('LINH_THAO'), 300);

// 7. Công thức sát thương Lôi Kiếp (GDD 3.3): DanDoc=100 → +50%
const L = D.lightning;
const dmg = (b, k, dd, red) => b * (1 + L.stepK * k) * (1 + dd / L.danDocDivisor) * (1 - red);
assert.strictEqual(dmg(600, 1, 100, 0), 600 * 1.25 * 1.5);

// 8. Tu vi: Luyện Khí Hậu kỳ dừng ở bình cảnh
const p = new TT.PlayerState(); p.giveStartingKit();
p.addTuvi(10000);
assert.strictEqual(p.realm, 0); assert.strictEqual(p.stage, 2); assert(p.atBottleneck());
assert.strictEqual(p.nextTribulation(), 'TRUC_CO');

// 9. Bí Cảnh Cổ Thành phải có tướng trấn thành hợp lệ
assert.strictEqual(D.biomes.THANH_LUY.fortress, true);
assert.strictEqual(D.biomes.THANH_LUY.boss, 'THANH_CHU');
assert.strictEqual(D.enemies.THANH_CHU.boss, true);

// 10. Tất cả quái trong DATA.enemies phải có loại tương ứng trong TT.Monsters.TYPES
assert(TT.Monsters.TYPES.THANH_CHU, 'thiếu THANH_CHU trong TT.Monsters.TYPES');
for (const enemyType of Object.keys(D.enemies)) {
  const T = TT.Monsters.TYPES[enemyType];
  assert(T, 'thiếu loại quái trong TT.Monsters.TYPES: ' + enemyType);
  assert(Array.isArray(T.box) && T.box.length === 2, 'box không hợp lệ cho: ' + enemyType);
}

// 11. Tông Môn, Gia Tộc, thăng chức và tiến trình phải được lưu an toàn
assert.strictEqual(D.sects.length, 5);
assert.strictEqual(D.clans.length, 4);
assert.deepStrictEqual(Array.from(D.sectRanks, rank => rank.contribution), [0, 200, 600, 1500, 3000, 6000]);
const affiliation = new TT.PlayerState();
affiliation.giveStartingKit();
assert.strictEqual(affiliation.currentSectId, 'THIEN_KIEM');
assert.strictEqual(affiliation.currentClanId, null);
const originalAttack = affiliation.stats.atk;
const originalSwords = affiliation.stats.swords;
const originalCrit = affiliation.stats.critRate;
assert.strictEqual(affiliation.chooseClan('DU_GU'), null);
assert.strictEqual(affiliation.stats.swords, originalSwords + 1);
assert.strictEqual(affiliation.stats.critRate, originalCrit + 10);
assert.strictEqual(affiliation.chooseClan('VIEM_HOANG'), `Cần ${TT.util.fmt(D.sectSystem.clanChangeCost)} Linh Thạch để tẩy tủy đổi huyết mạch.`);
affiliation.linhThach += D.sectSystem.clanChangeCost;
assert.strictEqual(affiliation.chooseClan('VIEM_HOANG'), null);
assert(affiliation.stats.atk > originalAttack);
assert.strictEqual(affiliation.stats.clanBurnDamagePctPerSec, 8);
const hpBeforePromotion = affiliation.stats.maxHp;
const mpBeforePromotion = affiliation.stats.maxMp;
affiliation.linhThach += D.sectSystem.sectChangeCost;
assert.strictEqual(affiliation.joinSect('DUOC_VUONG'), null);
affiliation.danDoc = 0;
affiliation.addDanDoc(10);
assert.strictEqual(affiliation.danDoc, 5);
assert.strictEqual(affiliation.stats.sectHpRegenPctPerSec, 0.02);
assert.strictEqual(affiliation.addSectContribution(200), true);
assert.strictEqual(affiliation.sectRankIndex, 0, 'cống hiến không tự thăng chức');
assert.strictEqual(affiliation.promoteSectRank(), true);
assert.strictEqual(affiliation.sectRankIndex, 1);
assert(affiliation.stats.atk > originalAttack);
assert(affiliation.stats.maxHp > hpBeforePromotion);
assert(affiliation.stats.maxMp > mpBeforePromotion);
assert.strictEqual(affiliation.claimSectStipend(D.sectSystem.stipendIntervalMs), 50);
assert.strictEqual(affiliation.claimSectStipend(D.sectSystem.stipendIntervalMs + 1), 0);
for (let i = 0; i < D.sectSystem.questKills; i++) affiliation.addSectQuestKill();
assert.strictEqual(affiliation.claimSectQuestReward(), true);
assert.strictEqual(affiliation.sectContribution, 250);
assert.strictEqual(affiliation.sectQuestKills, 0);
const restoredAffiliation = TT.PlayerState.fromJSON(JSON.parse(JSON.stringify(affiliation)));
assert.strictEqual(restoredAffiliation.currentSectId, 'DUOC_VUONG');
assert.strictEqual(restoredAffiliation.currentClanId, 'VIEM_HOANG');
assert.strictEqual(restoredAffiliation.sectRankIndex, 1);
assert.strictEqual(restoredAffiliation.sectContribution, 250);
assert.strictEqual(restoredAffiliation.lastSectStipendAt, D.sectSystem.stipendIntervalMs);
const legacySave = TT.PlayerState.fromJSON({ realm: 0, stage: 0, tuvi: 0, danDoc: 0, linhThach: 0 });
assert.strictEqual(legacySave.currentSectId, 'THIEN_KIEM');
assert.strictEqual(legacySave.currentClanId, null);
const merchantClan = new TT.PlayerState();
merchantClan.giveStartingKit();
assert.strictEqual(merchantClan.chooseClan('BAC_MINH'), null);
assert.strictEqual(merchantClan.stats.clanLinhThachDropPct, 35);
assert.strictEqual(merchantClan.stats.clanShopDiscount, 0.2);

// 12. Kháng Lôi Kiếp của Cổ Thần được tính trong dự báo lẫn sát thương thực
const lightningBase = TT.Game.tribulationDamage(100, 1, 0, 0);
const lightningResisted = TT.Game.tribulationDamage(100, 1, 0, 0, 0.15);
assert.strictEqual(lightningResisted, lightningBase * 0.85);

// 13. Kiểm tra Bộ Trang Bị & Trang Phục Demo Xịn Nhất (giveUltimateDemoKit)
const demoChar = new TT.PlayerState();
demoChar.giveUltimateDemoKit();
assert.strictEqual(demoChar.realm, 4, 'cảnh giới Hóa Thần');
assert.strictEqual(demoChar.stage, 2, 'tiểu cảnh giới Đỉnh Phong');
assert.strictEqual(demoChar.danDoc, 0, 'đan độc sạch');
assert.strictEqual(demoChar.stats.resonanceCount, 5, 'phải đủ 5/5 Cộng Hưởng Ngũ Hành');
for (const slot of ['Weapon', 'Armor', 'Ring', 'Boots', 'Accessory']) {
  assert(demoChar.equipment[slot], 'phải trang bị ô ' + slot);
  assert.strictEqual(demoChar.equipment[slot].rarity, 'ThanKhi', 'phẩm chất Thần Khí');
  assert.strictEqual(demoChar.equipment[slot].level, 15, 'cấp độ 15');
}
assert(demoChar.stats.atk > 3000, 'công kích cực mạnh: ' + demoChar.stats.atk);
assert(demoChar.stats.maxHp > 50000, 'sinh lực cực lớn: ' + demoChar.stats.maxHp);
assert(demoChar.stats.swords >= 5, 'số phi kiếm tối đa');
assert(demoChar.stats.lifesteal > 0, 'có hút máu');
assert(demoChar.stats.thunder > 0, 'có lôi kích');
assert(demoChar.stats.split > 0, 'có tách kiếm khí');
assert.strictEqual(demoChar.ownedSkins.length, D.skins.length, 'mở khóa toàn bộ y phục');
assert.strictEqual(demoChar.ownedSwordSkins.length, D.swordSkins.length, 'mở khóa toàn bộ kiếm hình');
assert(demoChar.inventory.count('HOI_HUYET_DAN') >= 99, 'đầy đủ đan dược');
assert(demoChar.inventory.count('TAY_LUYEN_THACH') >= 999, 'đầy đủ khoáng thạch');
assert.strictEqual(demoChar.haloId, 'HALO_CRIMSON_SUN', 'trang bị Huyết Nhật Thần Luân');
assert.strictEqual(demoChar.wingsId, 'WINGS_GOLDEN_DAWN', 'trang bị Hoàng Kim Tiên Dực');
assert.strictEqual(demoChar.eyeId, 'EYE_3', 'trang bị Xích Diễm Thần Nhãn');

// 14. Kiểm tra hệ thống Thần Luân, Tiên Dực, Tiên Nhãn & Ngoại Trang Pháp Tướng
assert(D.halos.length >= 13, 'đủ 13 Thần Luân');
assert(D.wings.length >= 2, 'đủ 2 Tiên Dực');
assert(D.eyes.length >= 28, 'đủ 28+ Tiên Nhãn');
assert(D.avatarSkins.length >= 9, 'đủ 9 Ngoại Trang Pháp Tướng');
assert(D.sects.every(s => s.badge && Number.isInteger(s.badge.col) && Number.isInteger(s.badge.row)), 'đủ huy hiệu Tông Môn');
assert(D.clans.every(c => c.badge && Number.isInteger(c.badge.col) && Number.isInteger(c.badge.row)), 'đủ huy hiệu Gia Tộc');

// 15. Kiểm tra Quân Đoàn Hắc Ảnh & Boss Mới trong D.enemies và TT.Monsters.TYPES
const newBosses = ['CUU_VI_THIEN_HO', 'LOI_DINH_CU_SA', 'HAC_AM_CU_HUNG', 'HAN_BANG_CU_MA', 'HU_KHONG_AM_LONG', 'HAC_ANH_TU_THAN', 'HAC_ANH_KIEM_SI', 'BACH_COT_THICH_KHACH', 'HU_KHONG_U_HON', 'TOA_LIEM_MA_QUAN', 'HAC_DA_THONG_SOAI'];
for (const b of newBosses) {
  assert(D.enemies[b], 'thiếu enemy trong D.enemies: ' + b);
  assert(TT.Monsters.TYPES[b], 'thiếu loại quái trong TT.Monsters.TYPES: ' + b);
}

console.log('Tất cả kiểm tra logic đều đạt.');
