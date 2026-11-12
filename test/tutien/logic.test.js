// Kiểm tra logic thuần (không cần trình duyệt): node tests/tutien/logic.test.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const root = path.join(__dirname, '../../src/tutien/js');
const ctx = { window: {}, localStorage: { getItem: () => null, setItem() {}, removeItem() {} }, Math, Date, console };
ctx.window = ctx;
vm.createContext(ctx);
for (const f of ['util.js', 'data.js', 'items.js', 'state.js']) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx);
const TT = ctx.TT, D = TT.DATA, I = TT.Items;

// 0. Skin Kiếm Nhật Diệm is available to the gallery and rendering pipeline
const solarFlameSword = D.swordSkins.find(sword => sword.id === 'NHAT_DIEM');
assert(solarFlameSword, 'thiếu skin Nhật Diệm');
assert.strictEqual(solarFlameSword.shape, 'solar_flame');
assert.strictEqual(solarFlameSword.pal.blade, '#201b18');
assert.strictEqual(solarFlameSword.pal.gem, '#fff3a0');

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

console.log('Tất cả kiểm tra logic đều đạt.');
