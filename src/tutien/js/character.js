window.TT = window.TT || {};

/**
 * TT.Character — nhân vật phong cách anime chibi (đầu to ~45% chiều cao, tóc dài bồng bềnh nhiều lọn,
 * mắt to, áo khoác cổ lông, tay cầm trường kiếm), tô màu cel-shading viền mảnh.
 * Dựng thành sprite sheet lúc khởi động: 5 hoạt cảnh (idle, walk, dash, cast, hurt) x 3 hướng
 * (down, up, side; trái = lật side). NPC dùng cùng khung, khác bảng màu và đặc điểm (FEAT).
 * Lớp linh khí (hào quang, pháp trận, thần luân sau lưng, hạt linh khí, ảnh tàn) vẽ lúc chạy.
 */
(function (TT) {
  'use strict';
  const FW = 128, FH = 168;          // kích thước 1 frame (gấp đôi kích thước hiển thị)
  const AX = 64, AY = 165;           // điểm neo = giữa hai bàn chân
  const RENDER_SCALE = 0.5;
  const FOOT_OFFSET = 12;            // khoảng cách từ tâm va chạm tới bàn chân (px game)
  const ANIMS = { idle: 4, walk: 6, dash: 2, cast: 3, hurt: 1 };
  const FPS = { idle: 4, walk: 10, dash: 14, cast: 12, hurt: 1 };
  const DIRS = ['down', 'up', 'side'];
  const TAU = Math.PI * 2;

  // Bảng màu mặc định = nhân vật mẫu: tóc ngọc bích, áo khoác lam đậm cổ lông trắng, nơ nâu.
  const BASE_PAL = {
    line: '#262030',
    skin: '#fdeee4', skinShade: '#efcdbd', blush: 'rgba(240,120,120,0.4)',
    hair: '#9fc2b2', hairMid: '#d6eee2', hairDark: null, hairShine: 'rgba(255,255,255,0.6)',
    robe: '#41588a', robeShade: '#2b3b62', robeDeep: '#1a2442',
    inner: '#5274b4', innerDark: '#2e4878',
    fur: '#f8f8f4', furShade: '#c8ccd8',
    shirt: '#f4f2ec', shirtShade: '#cdcac4',
    sash: '#1e1a26', tassel: '#5a3428',
    legs: '#f6e8de', legsShade: '#dcc6b8',
    boot: '#2a2a36', bootHi: '#55556a',
    gold: '#e9b44c', goldHi: '#ffe39a', goldDark: '#9a6a1e',
    jade: '#4fae94', jadeDark: '#22705d',
    iris: '#7a4a34',
    blade: '#eef8ff', bladeShade: '#8fb6d6', hilt: '#3a2a40'
  };
  let PAL = BASE_PAL;
  // Đặc điểm: beard 'long'|'goatee'|'mustache', hat 'daoguan'|'straw', buns, squint, sword, npc, hideEye
  let FEAT = {};

  // ------------------------------------------------------------ tiện ích vẽ
  function lin(g, x0, y0, x1, y1, stops) {
    const gr = g.createLinearGradient(x0, y0, x1, y1);
    for (const [o, c] of stops) gr.addColorStop(o, c);
    return gr;
  }
  function shape(g, path, fill, lw) {
    g.beginPath(); path(g);
    g.fillStyle = fill; g.fill();
    if (lw !== 0) { g.lineWidth = lw || 1.8; g.strokeStyle = PAL.line; g.stroke(); }
  }
  function line(g, pts, color, lw) {
    g.strokeStyle = color; g.lineWidth = lw;
    g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
    g.stroke();
  }
  function dot(g, x, y, r, c) { g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
  /** Làm tối màu hex theo hệ số k (0..1). */
  function darken(hex, k) {
    const n = parseInt(hex.slice(1), 16);
    const f = v => Math.max(0, Math.round(v * (1 - k))).toString(16).padStart(2, '0');
    return '#' + f((n >> 16) & 255) + f((n >> 8) & 255) + f(n & 255);
  }
  const hairFill = (g, y0, y1) => lin(g, 0, y0, 0, y1, [[0, PAL.hairMid], [0.35, PAL.hair], [1, PAL.hairDark]]);
  const coatFill = (g, x0, y0, x1, y1) => lin(g, x0, y0, x1, y1, [[0, PAL.robe], [0.6, PAL.robeShade], [1, PAL.robeDeep]]);

  // ------------------------------------------------------------ tư thế
  function pose(anim, f) {
    const a = (f / ANIMS[anim]) * TAU;
    const p = { bob: 0, leg: 0, swing: 0, sway: 0, hair: 0, lean: 0, cast: 0, hurt: false };
    if (anim === 'idle') { p.bob = Math.sin(a) * 1.5; p.sway = Math.sin(a) * 1.5; p.hair = Math.sin(a + 1) * 2.5; }
    else if (anim === 'walk') { p.leg = Math.sin(a); p.bob = -Math.abs(Math.sin(a)) * 3; p.swing = Math.sin(a); p.sway = -Math.sin(a) * 4; p.hair = Math.cos(a) * 3 + 4; }
    else if (anim === 'dash') { p.lean = 1; p.sway = 10 + f * 3; p.hair = 12 + f * 2; p.bob = -2; }
    else if (anim === 'cast') { p.cast = [0.55, 1, 0.85][f]; p.hair = 3; p.sway = 2; }
    else { p.hurt = true; p.lean = -0.6; p.hair = -3; p.sway = -4; }
    return p;
  }

  // ------------------------------------------------------------ kiếm & tay
  let currentPose = null;

  function drawCrystalSwordFallback(g, L) {
    const hw = 3.2, hw2 = 1.6, back = 4, gh = 7;
    shape(g, c => c.rect(-10, -2, 10, 4), '#1a3048', 1.1);
    dot(g, -11, 0, 2.6, '#9ee8ff');
    shape(g, c => {
      c.moveTo(1, -gh); c.lineTo(4, -gh * 0.6); c.lineTo(3, gh * 0.6); c.lineTo(1, gh);
      c.lineTo(-1, gh * 0.6); c.lineTo(0, -gh * 0.6); c.closePath();
    }, lin(g, 0, -gh, 0, gh, [[0, '#ffffff'], [0.5, '#9ee8ff'], [1, '#4a8aa8']]), 1.1);
    shape(g, c => {
      c.moveTo(4, -hw); c.lineTo(L - back, -hw2); c.lineTo(L, 0);
      c.lineTo(L - back, hw2); c.lineTo(4, hw); c.closePath();
    }, lin(g, 0, -hw, 0, hw, [[0, '#ffffff'], [0.4, '#e0f8ff'], [1, '#72c8f0']]), 1.2);
    line(g, [[6, 0], [L - 4, 0]], 'rgba(255,255,255,0.95)', 1.2);
    dot(g, L * 0.4, 0, 1.5, '#ffffff');
    dot(g, L * 0.7, 0, 1.2, '#c8f0ff');
  }

  function crystalSword(g, hx, hy, a, customImg, sw) {
    const L = 44;
    g.save();
    // Nhấp nhô & lắc nhẹ đồng bộ với nhịp thở (idle) và bước đi (walk)
    const bob = currentPose ? (currentPose.bob || 0) * 0.45 : 0;
    const sway = currentPose ? (currentPose.swing || 0) * 0.04 : 0;
    g.translate(hx, hy + bob);
    g.rotate(a + sway);
    const target = sw || customImg;
    const drawn = (TT.Art && TT.Art.renderSwordSprite)
      ? TT.Art.renderSwordSprite(g, target, 0, 0, 0, L, 1)
      : false;
    if (!drawn) {
      drawCrystalSwordFallback(g, L);
    }
    g.restore();
  }

  function solarFlameSword(g, hx, hy, a) {
    const L = 44, hw = 3.2;
    g.save(); g.translate(hx, hy); g.rotate(a);
    shape(g, c => {
      c.moveTo(-2, -1.6); c.lineTo(-29, -1.3); c.lineTo(-34, 0); c.lineTo(-29, 1.3); c.lineTo(-2, 1.6); c.closePath();
    }, lin(g, 0, -2, 0, 2, [[0, PAL.goldHi], [0.25, PAL.hilt], [0.8, '#09090a'], [1, PAL.goldDark]]), 0.8);
    for (let i = 0; i < 3; i++) line(g, [[-7 - i * 4, -1.5], [-9 - i * 4, 1.5]], PAL.gold, 0.8);
    shape(g, c => { c.moveTo(-32, -1); c.lineTo(-37, 0); c.lineTo(-32, 1); c.closePath(); }, PAL.goldHi, 0);
    shape(g, c => {
      c.moveTo(4, -hw * 0.55); c.bezierCurveTo(12, -hw * 1.8, 22, -hw * 1.8, 29, -hw * 1.1);
      c.bezierCurveTo(34, -hw * 0.8, 39, -hw * 0.45, L, 0);
      c.bezierCurveTo(35, hw * 0.85, 30, hw * 1.3, 27, hw * 1.4);
      c.bezierCurveTo(22, hw * 2.7, 18, hw * 3.1, 15, hw * 2.1);
      c.bezierCurveTo(11, hw * 1.25, 7, hw * 1.1, 4, hw * 0.8); c.closePath();
    }, lin(g, 0, -hw * 2, 0, hw * 2, [[0, '#e8d39a'], [0.2, PAL.bladeShade], [0.52, PAL.blade], [0.82, '#09090a'], [1, PAL.goldDark]]), 1.1);
    g.strokeStyle = PAL.goldHi; g.lineWidth = 0.9;
    g.beginPath(); g.moveTo(5, 2); g.bezierCurveTo(12, 4, 17, 10, 21, 9);
    g.bezierCurveTo(27, 8, 27, 3, 34, 2); g.lineTo(42, 0); g.stroke();
    g.strokeStyle = PAL.accent || PAL.gold; g.lineWidth = 1.4;
    g.beginPath(); g.moveTo(5, 0); g.bezierCurveTo(12, -1, 12, -7, 18, -8);
    g.bezierCurveTo(23, -9, 24, 1, 30, 2); g.lineTo(38, 0); g.stroke();

    for (const side of [-1, 1]) {
      shape(g, c => {
        c.moveTo(4, side * 3); c.quadraticCurveTo(-5, side * 5, -12, side * 15);
        c.quadraticCurveTo(-19, side * 17, -16, side * 9);
        c.quadraticCurveTo(-14, side * 5, -9, side * 10);
        c.quadraticCurveTo(-5, side * 2, 4, side * 3); c.closePath();
      }, lin(g, -17, 0, 3, 0, [[0, PAL.goldDark], [0.45, '#211b15'], [1, PAL.gold]]), 1);
      line(g, [[-14, side * 11], [-8, side * 6], [1, side * 4]], PAL.goldHi, 0.8);
    }

    g.strokeStyle = PAL.line; g.lineWidth = 4.2;
    g.beginPath(); g.arc(2, 0, 6.4, 0, TAU); g.stroke();
    g.strokeStyle = PAL.gold; g.lineWidth = 2.1;
    g.beginPath(); g.arc(2, 0, 6.4, 0, TAU); g.stroke();
    const orb = g.createRadialGradient(0, -1.4, 0.3, 2, 0, 4.6);
    orb.addColorStop(0, '#ffffff'); orb.addColorStop(0.48, PAL.goldHi);
    orb.addColorStop(1, PAL.accent || PAL.gold);
    g.fillStyle = orb; g.beginPath(); g.arc(2, 0, 4.3, 0, TAU); g.fill();
    shape(g, c => {
      c.moveTo(-1, -2.2); c.lineTo(0.5, -0.5); c.lineTo(2.4, -2);
      c.lineTo(1, 0); c.lineTo(3, 2); c.lineTo(0.6, 1);
      c.lineTo(-1.3, 2.2); c.lineTo(-0.2, 0); c.closePath();
    }, '#fff8c7', 0);
    for (const side of [-1, 1]) {
      g.strokeStyle = PAL.goldHi; g.lineWidth = 1.2;
      g.beginPath(); g.moveTo(-1, side * 7);
      g.quadraticCurveTo(7, side * 14, 3, side * 20); g.stroke();
    }
    g.restore();
  }

  /** Trường kiếm trong toạ độ tay: gốc tại bàn tay, lưỡi theo góc a. */
  function sword(g, hx, hy, a) {
    const sw = FEAT.swordSkin;
    const isSprite = sw && (sw.sheet || sw.sprite || sw.customImg || sw.shape === 'crystal_sword' || sw.shape === 'sprite');
    if (isSprite || FEAT.customImg || FEAT.blade === 'crystal_sword') {
      crystalSword(g, hx, hy, a, FEAT.customImg, sw);
      return;
    }
    if (FEAT.blade === 'solar_flame') {
      solarFlameSword(g, hx, hy, a);
      return;
    }
    const S = TT.Art.swordShape(FEAT.blade);
    const L = 42 * S.len, hw = 2.4 * S.w, hw2 = hw * S.taper, back = S.blunt ? 2 : 5, gh = 6 * S.guard;
    g.save(); g.translate(hx, hy); g.rotate(a);
    shape(g, c => c.rect(-9, -1.8, 9, 3.6), PAL.hilt, 1.1);
    dot(g, -10, 0, 2.4, PAL.gold);
    shape(g, c => c.rect(1, -gh, 3, gh * 2), lin(g, 0, -gh, 0, gh, [[0, PAL.goldHi], [1, PAL.goldDark]]), 1.1);
    shape(g, c => {
      c.moveTo(4, -hw); c.lineTo(L - back, -hw2);
      if (S.blunt) { c.lineTo(L, -hw2 * 0.45); c.lineTo(L, hw2 * 0.45); } else c.lineTo(L, 0);
      c.lineTo(L - back, hw2); c.lineTo(4, hw); c.closePath();
    }, lin(g, 0, -hw, 0, hw, [[0, PAL.blade], [0.55, PAL.blade], [1, PAL.bladeShade]]), 1.2);
    line(g, [[6, -hw * 0.25], [L - 7, -hw2 * 0.25]], 'rgba(255,255,255,0.9)', 0.8);
    g.restore();
  }

  /** Tay áo khoác + bàn tay (+ kiếm). rot: góc xoay quanh vai; swordA: góc kiếm trong toạ độ tay. */
  function arm(g, sx, sy, rot, holdSword, swordWorld, dark) {
    g.save(); g.translate(sx, sy); g.rotate(rot);
    if (holdSword) sword(g, 0, 22, swordWorld - rot);
    // ống tay áo: vai tròn, khuỷu hơi thu, miệng tay loe nhẹ
    shape(g, c => {
      c.moveTo(-4.5, -3);
      c.bezierCurveTo(-7.5, 3, -6, 9, -6.2, 13);
      c.quadraticCurveTo(-6.8, 17, -6.6, 19);
      c.quadraticCurveTo(0, 20.5, 6.6, 19);
      c.quadraticCurveTo(6.8, 17, 6.2, 13);
      c.bezierCurveTo(6, 9, 7.5, 3, 4.5, -3);
      c.quadraticCurveTo(0, -5, -4.5, -3); c.closePath();
    }, lin(g, -6, 0, 6, 0, dark ? [[0, PAL.robeShade], [1, PAL.robeDeep]] : [[0, PAL.robe], [1, PAL.robeShade]]), 1.5);
    // nếp gấp khuỷu tay
    g.strokeStyle = dark ? PAL.robeDeep : PAL.robeShade; g.lineWidth = 1;
    g.beginPath(); g.moveTo(-3.5, 9); g.quadraticCurveTo(0, 11, 2.5, 8.5); g.stroke();
    if (holdSword) fist(g, dark); else hand(g, dark);
    furCuff(g, dark);
    g.restore();
  }

  /** Cổ tay lông: một dải lông mềm, mép dưới gợn sóng (thay cho 4 chấm tròn). */
  function furCuff(g, dark) {
    shape(g, c => {
      c.moveTo(-6.8, 17.2);
      c.quadraticCurveTo(0, 15.2, 6.8, 17.2);
      c.quadraticCurveTo(7.6, 19.4, 6.2, 21);
      for (let i = 0; i < 4; i++) {
        const x0 = 6.2 - i * 3.1, x1 = x0 - 3.1;
        c.quadraticCurveTo((x0 + x1) / 2, 23.2 - (i % 2) * 0.6, x1, 21);
      }
      c.quadraticCurveTo(-7.6, 19.4, -6.8, 17.2); c.closePath();
    }, lin(g, 0, 15, 0, 23, dark ? [[0, PAL.furShade], [1, darken(PAL.furShade, 0.12)]] : [[0, PAL.fur], [1, PAL.furShade]]), 1.2);
    g.strokeStyle = dark ? darken(PAL.furShade, 0.15) : PAL.furShade; g.lineWidth = 0.8;
    g.beginPath(); g.moveTo(-3, 18.4); g.lineTo(-2.4, 20.2); g.moveTo(1.5, 18.2); g.lineTo(2, 20); g.stroke();
  }

  /** Bàn tay buông: lòng bàn tay thuôn, ngón cái tách nhẹ, vạch ngón. */
  function hand(g, dark) {
    const fill = lin(g, 0, 20, 0, 28, dark ? [[0, PAL.skinShade], [1, darken(PAL.skinShade, 0.08)]] : [[0, PAL.skin], [1, PAL.skinShade]]);
    shape(g, c => {
      c.moveTo(-3.4, 20.5);
      c.bezierCurveTo(-4.4, 23.5, -3.4, 27.6, 0, 27.8);
      c.bezierCurveTo(3.4, 27.6, 4.2, 24, 3.4, 20.5); c.closePath();
    }, fill, 1.1);
    shape(g, c => { c.moveTo(-3.2, 21.6); c.quadraticCurveTo(-5.6, 23, -4.2, 25.2); c.quadraticCurveTo(-3, 24.4, -2.4, 23); c.closePath(); }, fill, 1);
    g.strokeStyle = PAL.skinShade; g.lineWidth = 0.7;
    g.beginPath(); g.moveTo(-0.6, 25.4); g.lineTo(-0.5, 27.2); g.moveTo(1.6, 25.2); g.lineTo(1.8, 26.8); g.stroke();
  }

  /** Nắm tay cầm chuôi kiếm: khối bo tròn, 3 vạch đốt ngón, ngón cái ôm chuôi. */
  function fist(g, dark) {
    const fill = lin(g, 0, 19, 0, 27, dark ? [[0, PAL.skinShade], [1, darken(PAL.skinShade, 0.08)]] : [[0, PAL.skin], [1, PAL.skinShade]]);
    shape(g, c => {
      c.moveTo(-4, 20.2);
      c.bezierCurveTo(-5.2, 22.5, -4.6, 25.6, -1.5, 26);
      c.lineTo(1.8, 26);
      c.bezierCurveTo(4.8, 25.6, 5.2, 22.4, 4, 20.2); c.closePath();
    }, fill, 1.1);
    g.strokeStyle = PAL.skinShade; g.lineWidth = 0.8;
    g.beginPath();
    for (const x of [-1.6, 0.6, 2.6]) { g.moveTo(x, 23.2); g.lineTo(x + 0.2, 25.6); }
    g.stroke();
    shape(g, c => { c.moveTo(-4, 21.4); c.quadraticCurveTo(-1, 20.6, 1.4, 22.4); c.quadraticCurveTo(-1.2, 23.6, -3.8, 23.2); c.closePath(); }, fill, 0.9);
  }

  function armRot(p, base, castRot) {
    if (p.hurt) return base + 0.3;
    if (p.lean > 0.5) return base + 0.15;
    if (p.cast) return base + (castRot - base) * p.cast;
    return base + p.swing * 0.1;
  }

  /** Góc kiếm (thế giới): thế thủ chĩa xuống; khi vung kiếm (cast) xoay dần lên trời. */
  function swordAngle(p, rest, raised) { return p.cast ? rest + (raised - rest) * Math.sqrt(p.cast) : rest; }

  // ------------------------------------------------------------ thân dưới
  /**
   * Chân nhìn thẳng/quay lưng: đùi → gối thu → bắp chân → cổ chân, nối liền vào ủng bo tròn.
   * s = -1 chân trái, 1 chân phải (mũi ủng hơi chĩa ra ngoài).
   */
  function legsFront(g, p, back, spread, stride) {
    for (const s of [-1, 1]) {
      // spread: nửa khoảng cách hai chân (mặc định 6). stride: chân dịch trước/sau khi bước (góc 3/4).
      const lift = Math.max(0, s < 0 ? p.leg : -p.leg) * 4, x = s * (spread || 6) + (stride ? s * p.leg * stride : 0), L = lift;
      shape(g, c => {
        c.moveTo(x - 4.6, -41);
        c.bezierCurveTo(x - 4.8, -34, x - 3.2, -31, x - 3.4, -28 - L * 0.5);   // đùi → gối
        c.bezierCurveTo(x - 4.2, -24 - L * 0.6, x - 3.6, -20 - L, x - 2.9, -16 - L); // bắp → cổ chân
        c.lineTo(x + 2.9, -16 - L);
        c.bezierCurveTo(x + 3.6, -20 - L, x + 4.2, -24 - L * 0.6, x + 3.4, -28 - L * 0.5);
        c.bezierCurveTo(x + 3.2, -31, x + 4.8, -34, x + 4.6, -41);
        c.closePath();
      }, lin(g, x - 4, 0, x + 4, 0, [[0, PAL.legs], [0.6, PAL.legs], [1, PAL.legsShade]]), 1.3);
      // gối
      g.strokeStyle = PAL.legsShade; g.lineWidth = 0.8;
      g.beginPath(); g.moveTo(x - 1.6, -28.6 - L * 0.5); g.quadraticCurveTo(x, -27.4 - L * 0.5, x + 1.6, -28.6 - L * 0.5); g.stroke();
      boot(g, x, L, s, back);
    }
  }

  /** Ủng nhìn thẳng: cổ ủng có nẹp gập, ôm cổ chân, bàn chân bo tròn, đế mỏng. */
  function boot(g, x, L, s, back) {
    const toe = back ? 0 : s * 1.2;
    const fill = lin(g, x - 6, 0, x + 6, 0, [[0, PAL.bootHi], [0.45, PAL.boot], [1, darken(PAL.boot, 0.25)]]);
    shape(g, c => {
      c.moveTo(x - 5.2, -18.5 - L);
      c.quadraticCurveTo(x, -20.2 - L, x + 5.2, -18.5 - L);
      c.bezierCurveTo(x + 5.6, -13 - L, x + 4.4, -9 - L, x + 4.8, -6 - L);   // ôm cổ chân
      c.bezierCurveTo(x + 6.8 + toe, -4 - L, x + 7 + toe, 0.6 - L, x + toe, 1 - L); // mũi ủng
      c.bezierCurveTo(x - 7 + toe, 0.6 - L, x - 6.8 + toe, -4 - L, x - 4.8, -6 - L);
      c.bezierCurveTo(x - 4.4, -9 - L, x - 5.6, -13 - L, x - 5.2, -18.5 - L);
      c.closePath();
    }, fill, 1.3);
    // nẹp gập cổ ủng
    shape(g, c => {
      c.moveTo(x - 5.4, -18.4 - L); c.quadraticCurveTo(x, -20 - L, x + 5.4, -18.4 - L);
      c.quadraticCurveTo(x + 5.6, -16.2 - L, x + 5.2, -15.2 - L);
      c.quadraticCurveTo(x, -16.6 - L, x - 5.2, -15.2 - L);
      c.quadraticCurveTo(x - 5.6, -16.2 - L, x - 5.4, -18.4 - L); c.closePath();
    }, PAL.bootHi, 1.1);
    // đế ủng
    g.strokeStyle = darken(PAL.boot, 0.45); g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(x - 5.4 + toe, -0.6 - L); g.quadraticCurveTo(x + toe, 1.4 - L, x + 5.4 + toe, -0.6 - L); g.stroke();
    if (!back) {
      // quai cài vàng thay cho chấm tròn
      g.strokeStyle = PAL.gold; g.lineWidth = 1.3;
      g.beginPath(); g.moveTo(x - 4.6, -8.6 - L); g.quadraticCurveTo(x, -6.8 - L, x + 4.6, -8.6 - L); g.stroke();
      g.fillStyle = PAL.goldHi; g.beginPath(); g.ellipse(x, -7.6 - L, 1.1, 0.8, 0, 0, TAU); g.fill();
    }
  }

  /** Chân nhìn nghiêng: đùi, gối hơi gập khi bước, bắp chân cong, ủng có gót và mũi thuôn về trước. */
  function legsSide(g, p) {
    for (const [x, lift, dark] of [[-4 - p.leg * 7, Math.max(0, -p.leg) * 4, true], [4 + p.leg * 7, Math.max(0, p.leg) * 4, false]]) {
      const L = lift, kb = L * 0.6; // gối nhô ra trước khi nhấc chân
      shape(g, c => {
        c.moveTo(x - 4.4, -41);
        c.bezierCurveTo(x - 4.6, -34, x - 3.8, -30, x - 3.2, -27 - L * 0.5);
        c.bezierCurveTo(x - 4.6, -23 - L, x - 3.6, -19 - L, x - 3, -16 - L);  // bắp chân phía sau
        c.lineTo(x + 2.6, -16 - L);
        c.bezierCurveTo(x + 3, -20 - L, x + 3 + kb, -24 - L, x + 3.4 + kb, -27.5 - L * 0.5); // ống quyển
        c.bezierCurveTo(x + 4.6, -31, x + 4.4, -36, x + 4.2, -41);
        c.closePath();
      }, dark ? lin(g, x - 4, 0, x + 4, 0, [[0, PAL.legsShade], [1, darken(PAL.legsShade, 0.08)]]) : lin(g, x - 4, 0, x + 4, 0, [[0, PAL.legs], [1, PAL.legsShade]]), 1.3);
      const fill = dark ? lin(g, x - 5, 0, x + 10, 0, [[0, PAL.boot], [1, darken(PAL.boot, 0.3)]]) : lin(g, x - 5, 0, x + 10, 0, [[0, PAL.bootHi], [0.5, PAL.boot], [1, darken(PAL.boot, 0.2)]]);
      shape(g, c => {
        c.moveTo(x - 4.8, -18.5 - L);
        c.quadraticCurveTo(x, -19.6 - L, x + 4.2, -18.5 - L);
        c.bezierCurveTo(x + 4.6, -13 - L, x + 3.6, -8 - L, x + 5, -5.5 - L);       // mu bàn chân
        c.bezierCurveTo(x + 9, -4.6 - L, x + 11.4, -2.4 - L, x + 10.4, 0.4 - L);   // mũi ủng thuôn
        c.quadraticCurveTo(x + 9.8, 1.2 - L, x + 8.6, 1.2 - L);
        c.lineTo(x - 4.4, 1.2 - L);
        c.quadraticCurveTo(x - 6.2, 0.6 - L, x - 5.6, -2.6 - L);                   // gót
        c.bezierCurveTo(x - 5, -7 - L, x - 5.6, -13 - L, x - 4.8, -18.5 - L);
        c.closePath();
      }, fill, 1.3);
      shape(g, c => {
        c.moveTo(x - 5, -18.4 - L); c.quadraticCurveTo(x, -19.8 - L, x + 4.4, -18.4 - L);
        c.quadraticCurveTo(x + 4.6, -16.4 - L, x + 4.3, -15.4 - L);
        c.quadraticCurveTo(x, -16.6 - L, x - 4.9, -15.4 - L);
        c.quadraticCurveTo(x - 5.2, -16.4 - L, x - 5, -18.4 - L); c.closePath();
      }, PAL.bootHi, 1.1);
      g.strokeStyle = darken(PAL.boot, 0.45); g.lineWidth = 1.2;
      g.beginPath(); g.moveTo(x - 4.6, 0.6 - L); g.lineTo(x + 9, 0.6 - L); g.stroke();
      if (!dark) { g.strokeStyle = PAL.gold; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x - 4.2, -9 - L); g.quadraticCurveTo(x, -7.6 - L, x + 4, -8.6 - L); g.stroke(); }
    }
  }

  /** Dải ruy băng lam bay sau eo. */
  function waistRibbons(g, p, sides) {
    for (const s of sides) {
      const w = p.sway * 0.8, h = p.hair * 0.6;
      shape(g, c => { c.moveTo(s * 10, -50); c.quadraticCurveTo(s * 26 - w, -44 + h, s * 34 - w * 1.4, -30 + h); c.lineTo(s * 30 - w * 1.4, -26 + h); c.quadraticCurveTo(s * 22 - w, -40 + h, s * 9, -46); c.closePath(); },
        lin(g, 0, -50, 0, -26, [[0, PAL.inner], [1, PAL.innerDark]]), 1.3);
    }
  }

  function coatBackFront(g, p, fill) {
    const s = p.sway;
    shape(g, c => { c.moveTo(-17, -74); c.quadraticCurveTo(-27, -42, -31 + s, -16); c.quadraticCurveTo(s, -9, 31 + s, -16); c.quadraticCurveTo(27, -42, 17, -74); c.closePath(); }, fill, 1.6);
  }

  function coatPanels(g, p) {
    const s = p.sway;
    for (const d of [-1, 1]) {
      shape(g, c => { c.moveTo(d * 17, -74); c.quadraticCurveTo(d * 25, -42, d * 31 + s, -16); c.lineTo(d * 13 + s * 0.6, -19); c.quadraticCurveTo(d * 11, -46, d * 7, -70); c.closePath(); },
        d < 0 ? coatFill(g, -31, -74, 0, -16) : coatFill(g, 31, -74, 0, -16), 1.6);
      line(g, [[d * 7.5, -70], [d * 11.5, -46], [d * 13.5 + s * 0.6, -20]], PAL.inner, 2.2);
      line(g, [[d * 31 + s, -16], [d * 13 + s * 0.6, -19]], PAL.inner, 2.2);
    }
  }

  function shirtFront(g) {
    shape(g, c => { c.moveTo(-10, -73); c.lineTo(10, -73); c.lineTo(12, -38); c.quadraticCurveTo(0, -34, -12, -38); c.closePath(); },
      lin(g, 0, -73, 0, -36, [[0, PAL.shirt], [1, PAL.shirtShade]]), 1.4);
    line(g, [[-11, -40], [11, -40]], PAL.shirtShade, 1.6);
  }

  /** Cổ lông xù: chuỗi vòng tròn viền mực rồi tô trắng. */
  function furCollar(g, side) {
    const pts = [];
    if (side) for (let i = 0; i < 6; i++) pts.push([-10 + i * 4.4, -76 + Math.sin((i / 5) * Math.PI) * 4]);
    else for (let i = 0; i < 9; i++) pts.push([-20 + i * 5, -76 + Math.sin((i / 8) * Math.PI) * 9]);
    for (const [x, y] of pts) dot(g, x, y, 6.2, PAL.line);
    for (const [x, y] of pts) dot(g, x, y, 5.2, PAL.fur);
    for (const [x, y] of pts) { g.fillStyle = PAL.furShade; g.beginPath(); g.arc(x, y + 1.6, 3.6, 0.15 * Math.PI, 0.85 * Math.PI); g.fill(); }
  }

  function bow(g, x, y) {
    for (const d of [-1, 1]) shape(g, c => { c.moveTo(x, y); c.lineTo(x + d * 7, y - 4); c.lineTo(x + d * 7, y + 4); c.closePath(); }, PAL.tassel, 1.1);
    for (const d of [-1, 1]) shape(g, c => { c.moveTo(x, y + 1); c.lineTo(x + d * 4, y + 12); c.lineTo(x + d * 1, y + 12); c.closePath(); }, PAL.tassel, 1);
    dot(g, x, y, 2.4, darken(PAL.tassel, 0.35));
  }

  // ------------------------------------------------------------ đầu & mặt
  function head(g, x) {
    const gr = g.createRadialGradient(x - 8, -112, 6, x, -104, 32);
    gr.addColorStop(0, PAL.skin); gr.addColorStop(1, PAL.skinShade);
    shape(g, c => c.ellipse(x, -106, 29, 27, 0, 0, TAU), gr, 1.8);
  }

  function eye(g, x, y, rx, hurt, mirror) {
    if (hurt) {
      const m = mirror ? -1 : 1;
      g.strokeStyle = PAL.line; g.lineWidth = 2.2;
      g.beginPath(); g.moveTo(x - 4 * m, y - 4); g.lineTo(x + 3 * m, y); g.lineTo(x - 4 * m, y + 4); g.stroke();
      return;
    }
    if (FEAT.squint) {
      g.strokeStyle = PAL.line; g.lineWidth = 2.2;
      g.beginPath(); g.arc(x, y + 2, rx + 0.5, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
      g.strokeStyle = PAL.hairDark; g.lineWidth = 2.4;
      g.beginPath(); g.moveTo(x - 6, y - 8); g.quadraticCurveTo(x, y - 11, x + 6, y - 8.5); g.stroke();
      return;
    }
    const ry = rx * 1.25;
    g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(x, y + 0.5, rx + 0.8, ry, 0, 0, TAU); g.fill();
    g.fillStyle = lin(g, 0, y - ry, 0, y + ry, [[0, darken(PAL.iris, 0.55)], [0.5, PAL.iris], [1, '#c89a6a']]);
    g.beginPath(); g.ellipse(x + (mirror ? 0.6 : -0.6), y + 1, rx, ry - 0.6, 0, 0, TAU); g.fill();
    g.fillStyle = darken(PAL.iris, 0.7); g.beginPath(); g.ellipse(x, y + 1.4, rx * 0.45, ry * 0.5, 0, 0, TAU); g.fill();
    dot(g, x + rx * 0.35, y - ry * 0.35, 1.7, '#ffffff');
    dot(g, x - rx * 0.35, y + ry * 0.45, 0.9, 'rgba(255,255,255,0.8)');
    g.strokeStyle = PAL.line; g.lineWidth = 2.6;
    g.beginPath(); g.moveTo(x - rx - 1.6, y - ry * 0.55); g.quadraticCurveTo(x, y - ry - 2.2, x + rx + 2, y - ry * 0.7); g.stroke();
    g.lineWidth = 1; g.beginPath(); g.moveTo(x - rx * 0.6, y + ry + 0.6); g.lineTo(x + rx * 0.6, y + ry + 0.6); g.stroke();
    g.strokeStyle = PAL.hairDark; g.lineWidth = 1.4;
    g.beginPath(); g.moveTo(x - 5, y - ry - 5); g.quadraticCurveTo(x, y - ry - 7, x + 5, y - ry - 5.5); g.stroke();
  }

  function faceFront(g, p) {
    eye(g, -11.5, -98, 5.4, p.hurt, true);
    eye(g, 11.5, -98, 5.4, p.hurt, false);
    g.fillStyle = PAL.blush;
    for (const sx of [-18, 18]) { g.beginPath(); g.ellipse(sx, -89, 4.5, 2.2, 0, 0, TAU); g.fill(); }
    g.strokeStyle = PAL.line; g.lineWidth = 1.3;
    g.beginPath();
    if (p.hurt) g.ellipse(0, -85, 2, 2.4, 0, 0, TAU); else g.arc(0, -87, 2.2, Math.PI * 0.2, Math.PI * 0.8);
    g.stroke();
  }

  // ------------------------------------------------------------ tóc
  /** Khối tóc dài phía sau (nhìn trước), nhiều lọn nhọn bay theo gió. */
  function hairBackLong(g, p) {
    const s = Math.min(p.hair, 8);
    shape(g, c => {
      c.moveTo(-28, -120);
      c.quadraticCurveTo(-46 - s * 0.6, -96, -44 - s, -62);
      for (const [x, y] of [[-46 - s * 1.3, -34], [-36 - s, -46], [-34 - s * 1.2, -26], [-26 - s * 0.7, -42], [-20, -48],
        [20, -48], [26 - s * 0.4, -42], [34 - s * 0.6, -26], [36 - s * 0.5, -46], [46 - s * 0.7, -34]]) c.lineTo(x, y);
      c.lineTo(44 - s * 0.4, -62);
      c.quadraticCurveTo(46 - s * 0.2, -96, 28, -120); c.closePath();
    }, lin(g, 0, -125, 0, -30, [[0, PAL.hair], [1, PAL.hairDark]]), 1.6);
    // lọn bay rời
    g.strokeStyle = PAL.line; g.lineWidth = 1.2;
    for (const [x0, y0, x1, y1, x2, y2] of [[-40, -80, -54 - s, -66, -50 - s * 1.4, -50], [40, -84, 52 - s * 0.5, -70, 54 - s * 0.6, -56]]) {
      g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x1, y1, x2, y2); g.stroke();
    }
  }

  function bangsFront(g, p) {
    const hide = FEAT.hideEye;
    shape(g, c => {
      c.moveTo(-31, -102);
      c.bezierCurveTo(-34, -134, -14, -140, 0, -140);
      c.bezierCurveTo(14, -140, 34, -134, 31, -102);
      const pts = hide
        ? [[27, -96], [24, -108], [21, -84], [14, -98], [12, -112], [7, -100], [2, -115], [-4, -100], [-9, -114], [-14, -99], [-19, -112], [-25, -97]]
        : [[27, -96], [24, -108], [19, -97], [13, -112], [8, -99], [2, -115], [-4, -100], [-9, -114], [-14, -99], [-19, -112], [-25, -97]];
      for (const [x, y] of pts) c.lineTo(x, y);
      c.closePath();
    }, hairFill(g, -140, -92), 1.6);
    for (const d of [-1, 1]) {
      const s = p.hair * 0.4;
      shape(g, c => { c.moveTo(d * 25, -112); c.quadraticCurveTo(d * 36, -88, d * 28 + s, -58); c.lineTo(d * 25 + s, -64); c.quadraticCurveTo(d * 28, -86, d * 20, -102); c.closePath(); }, hairFill(g, -112, -58), 1.4);
    }
    g.strokeStyle = PAL.hairShine; g.lineWidth = 3;
    g.beginPath(); g.arc(0, -114, 22, Math.PI * 1.15, Math.PI * 1.4); g.stroke();
    g.beginPath(); g.arc(0, -114, 22, Math.PI * 1.55, Math.PI * 1.72); g.stroke();
  }

  function hairBackView(g, p) {
    const s = p.hair;
    shape(g, c => c.ellipse(0, -108, 30, 29, 0, 0, TAU), hairFill(g, -138, -80), 1.6);
    shape(g, c => {
      c.moveTo(-28, -104); c.quadraticCurveTo(-40 - s * 0.5, -78, -38 - s, -46);
      for (const [x, y] of [[-30 - s, -34], [-24, -44], [-16 - s * 0.6, -28], [-8, -40], [0 - s * 0.5, -26], [8, -40], [16 - s * 0.4, -28], [24, -44], [30 - s * 0.6, -34]]) c.lineTo(x, y);
      c.lineTo(38 - s * 0.5, -46); c.quadraticCurveTo(40, -78, 28, -104); c.closePath();
    }, lin(g, 0, -104, 0, -26, [[0, PAL.hair], [1, PAL.hairDark]]), 1.6);
    g.strokeStyle = darken(PAL.hairDark, 0.2); g.lineWidth = 1;
    for (const x of [-16, -6, 6, 16]) { g.beginPath(); g.moveTo(x, -96); g.quadraticCurveTo(x + 3, -70, x - 1, -44); g.stroke(); }
    g.strokeStyle = PAL.hairShine; g.lineWidth = 3;
    g.beginPath(); g.arc(0, -112, 22, Math.PI * 1.2, Math.PI * 1.5); g.stroke();
  }

  // ------------------------------------------------------------ phần trên đầu
  function ponytail(g, p, x, side) {
    const s = Math.min(p.hair, 9);
    const bx = side ? x - 10 : x - 12, by = side ? -134 : -132;
    shape(g, c => { c.moveTo(bx + 4, by - 2); c.quadraticCurveTo(bx - 24 - s, by - 10, bx - 30 - s * 1.3, by + 20); c.quadraticCurveTo(bx - 32 - s * 1.5, by + 38, bx - 24 - s * 1.6, by + 50); c.quadraticCurveTo(bx - 22 - s, by + 24, bx, by + 6); c.closePath(); },
      lin(g, bx - 30, by - 10, bx, by + 50, [[0, PAL.hairMid], [0.4, PAL.hair], [1, PAL.hairDark]]), 1.5);
    g.strokeStyle = PAL.line; g.lineWidth = 1;
    g.beginPath(); g.moveTo(bx - 14 - s * 0.5, by); g.quadraticCurveTo(bx - 26 - s, by + 14, bx - 26 - s * 1.4, by + 34); g.stroke();
    // ruy băng lam
    for (const d of [-1, 1]) shape(g, c => { c.moveTo(bx, by); c.lineTo(bx + d * 8 - 2, by - 8); c.lineTo(bx + d * 9 - 2, by + 3); c.closePath(); }, lin(g, 0, by - 8, 0, by + 3, [[0, PAL.inner], [1, PAL.innerDark]]), 1.2);
    shape(g, c => { c.moveTo(bx, by + 2); c.quadraticCurveTo(bx - 4 - s * 0.4, by + 14, bx - 2 - s * 0.6, by + 24); c.lineTo(bx + 2 - s * 0.6, by + 22); c.quadraticCurveTo(bx, by + 12, bx + 2, by + 2); c.closePath(); }, PAL.innerDark, 1);
    dot(g, bx, by, 2.6, PAL.innerDark);
  }

  function tiara(g, x) {
    shape(g, c => { c.moveTo(x - 9, -134); c.lineTo(x - 7, -142); c.lineTo(x - 3, -137); c.lineTo(x + 1, -146); c.lineTo(x + 5, -137); c.lineTo(x + 9, -142); c.lineTo(x + 10, -134); c.closePath(); },
      lin(g, x - 9, -146, x + 9, -134, [[0, PAL.goldHi], [0.5, PAL.gold], [1, PAL.goldDark]]), 1.2);
    dot(g, x + 1, -138, 1.8, PAL.jade);
  }

  function ahoge(g, x, s) {
    shape(g, c => { c.moveTo(x - 2, -138); c.quadraticCurveTo(x - 4, -154, x + 8 + s * 0.3, -158); c.quadraticCurveTo(x + 15 + s * 0.3, -157, x + 13 + s * 0.3, -150); c.quadraticCurveTo(x + 9, -154, x + 4, -150); c.quadraticCurveTo(x + 2, -144, x + 3, -138); c.closePath(); }, hairFill(g, -158, -138), 1.3);
  }

  function simpleBun(g, x) {
    shape(g, c => c.ellipse(x, -138, 10, 8, 0, 0, TAU), hairFill(g, -146, -130), 1.4);
    line(g, [[x - 15, -141], [x + 15, -143]], PAL.goldDark, 3);
    line(g, [[x - 15, -141], [x + 15, -143]], PAL.goldHi, 1.2);
    dot(g, x + 16, -143, 2, PAL.jade);
  }

  function daoguan(g, x) {
    shape(g, c => { c.moveTo(x - 12, -134); c.lineTo(x - 10, -153); c.quadraticCurveTo(x, -158, x + 10, -153); c.lineTo(x + 12, -134); c.closePath(); },
      lin(g, x - 12, 0, x + 12, 0, [[0, '#1a1c24'], [0.5, '#3a3e4c'], [1, '#121418']]), 1.5);
    shape(g, c => c.rect(x - 5, -150, 10, 11), lin(g, 0, -150, 0, -139, [[0, PAL.jade], [1, PAL.jadeDark]]), 1.1);
    line(g, [[x - 13, -136], [x + 13, -136]], PAL.gold, 1.6);
    line(g, [[x - 19, -144], [x + 19, -146]], PAL.goldDark, 3);
    line(g, [[x - 19, -144], [x + 19, -146]], PAL.goldHi, 1.2);
  }

  function strawHat(g, x) {
    g.fillStyle = 'rgba(0,0,0,0.18)'; g.beginPath(); g.ellipse(x, -116, 28, 10, 0, 0, TAU); g.fill();
    shape(g, c => { c.moveTo(x - 46, -124); c.lineTo(x, -157); c.lineTo(x + 46, -124); c.quadraticCurveTo(x, -114, x - 46, -124); c.closePath(); },
      lin(g, x - 36, -156, x + 36, -118, [[0, '#ecd08a'], [0.6, '#c09a4a'], [1, '#7a5a24']]), 1.6);
    g.strokeStyle = 'rgba(90,60,20,0.55)'; g.lineWidth = 1;
    for (let k = 1; k < 5; k++) { const t = k / 5; g.beginPath(); g.moveTo(x - 46 * t, -157 + 33 * t); g.lineTo(x + 46 * t, -157 + 33 * t); g.stroke(); }
    line(g, [[x - 22, -120], [x - 12, -84]], '#5a3a1a', 1);
    line(g, [[x + 22, -120], [x + 12, -84]], '#5a3a1a', 1);
  }

  function twinBuns(g, x, side) {
    const pts = side ? [[x - 10, -134], [x + 8, -138]] : [[x - 23, -128], [x + 23, -128]];
    for (const [bx, by] of pts) {
      shape(g, c => c.arc(bx, by, 10, 0, TAU), hairFill(g, by - 10, by + 10), 1.4);
      line(g, [[bx - 8, by + 5], [bx + 8, by + 5]], PAL.inner, 2.4);
      line(g, [[bx + 3, by + 6], [bx + 7, by + 18]], PAL.inner, 1.8);
    }
    const [fx, fy] = side ? [x + 14, -128] : [x + 13, -138];
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * TAU;
      shape(g, c => c.ellipse(fx + Math.cos(a) * 3, fy + Math.sin(a) * 3, 2.4, 3.6, a + Math.PI / 2, 0, TAU), '#ffc4d8', 0.8);
    }
    dot(g, fx, fy, 1.6, PAL.goldHi);
  }

  /** Phần trên đầu: mũ / búi đôi / búi đơn (NPC) / đuôi ngựa + ruy băng + vương miện + tóc dựng (mặc định). */
  function topper(g, p, x, side, back) {
    if (FEAT.hat === 'daoguan') return daoguan(g, x);
    if (FEAT.hat === 'straw') return strawHat(g, x);
    if (FEAT.buns) return twinBuns(g, x, side);
    if (FEAT.npc) return simpleBun(g, x);
    if (isKT()) return topknot(g, x, back);
    if (!back) tiara(g, x + 6);
    ahoge(g, x + 2, p.hair);
  }

  /** Râu (NPC): nhìn trước hoặc nghiêng. */
  function beard(g, p, side) {
    if (!FEAT.beard) return;
    const fill = lin(g, 0, -90, 0, -52, [[0, PAL.hairMid], [1, PAL.hair]]);
    const s = p.sway * 0.4;
    if (!side) {
      if (FEAT.beard === 'long') shape(g, c => { c.moveTo(-14, -88); c.quadraticCurveTo(-17, -70, -4 + s, -52); c.lineTo(s, -48); c.lineTo(4 + s, -52); c.quadraticCurveTo(17, -70, 14, -88); c.quadraticCurveTo(0, -80, -14, -88); c.closePath(); }, fill, 1.4);
      else if (FEAT.beard === 'goatee') shape(g, c => { c.moveTo(-6, -83); c.quadraticCurveTo(-4, -74, s, -66); c.quadraticCurveTo(4, -74, 6, -83); c.closePath(); }, fill, 1.2);
      for (const d of [-1, 1]) shape(g, c => { c.moveTo(0, -89); c.quadraticCurveTo(d * 7, -91, d * 13, -84); c.quadraticCurveTo(d * 7, -87, 0, -87); c.closePath(); }, PAL.hairMid, 1);
    } else {
      if (FEAT.beard === 'long') shape(g, c => { c.moveTo(10, -88); c.quadraticCurveTo(8, -70, 14 + s, -52); c.lineTo(20 + s, -54); c.quadraticCurveTo(24, -72, 26, -86); c.closePath(); }, fill, 1.4);
      else if (FEAT.beard === 'goatee') shape(g, c => { c.moveTo(18, -84); c.quadraticCurveTo(19, -74, 22 + s, -68); c.quadraticCurveTo(25, -76, 25, -84); c.closePath(); }, fill, 1.2);
      shape(g, c => { c.moveTo(20, -89); c.quadraticCurveTo(26, -90, 29, -84); c.quadraticCurveTo(25, -87, 20, -87); c.closePath(); }, PAL.hairMid, 1);
    }
  }

  // ------------------------------------------------------------ kiểu 'kiemtien' (Bạch Phát Kiếm Tiên)
  const isKT = () => FEAT.style === 'kiemtien';

  /** Tóc sau ngắn ngang vai, mép lởm chởm bay theo gió. */
  function hairBackShort(g, p) {
    const s = Math.min(p.hair, 8);
    shape(g, c => {
      c.moveTo(-29, -118);
      c.quadraticCurveTo(-39 - s * 0.4, -100, -37 - s * 0.6, -80);
      for (const [x, y] of [[-34 - s * 0.9, -68], [-28, -78], [-23 - s * 0.5, -66], [-16, -78],
        [16, -78], [23 - s * 0.3, -66], [28, -78], [34 - s * 0.5, -68]]) c.lineTo(x, y);
      c.lineTo(37 - s * 0.3, -80);
      c.quadraticCurveTo(39, -100, 29, -118); c.closePath();
    }, lin(g, 0, -122, 0, -66, [[0, PAL.hair], [1, PAL.hairDark]]), 1.6);
  }

  /** Mái vuốt lệch sang phải, chừa hai mắt; lọn mái rủ giữa trán; hai lọn mai dài ôm mặt. */
  function bangsSwept(g, p) {
    const s = p.hair * 0.4;
    shape(g, c => {
      c.moveTo(-31, -102);
      c.bezierCurveTo(-34, -134, -14, -141, 0, -141);
      c.bezierCurveTo(16, -141, 35, -133, 31, -100);
      for (const [x, y] of [[27, -107], [23, -101], [18, -114], [11, -106], [5, -120], [-2, -110], [-9, -122], [-15, -112], [-22, -119], [-27, -106]]) c.lineTo(x, y);
      c.closePath();
    }, hairFill(g, -141, -100), 1.6);
    // lọn mái rủ chéo giữa trán
    shape(g, c => { c.moveTo(4, -122); c.quadraticCurveTo(-1, -112, -4 + s * 0.3, -97); c.quadraticCurveTo(2, -106, 9, -114); c.closePath(); }, hairFill(g, -122, -97), 1.2);
    for (const d of [-1, 1]) {
      shape(g, c => { c.moveTo(d * 26, -114); c.quadraticCurveTo(d * 35, -90, d * 29 + s, -62); c.lineTo(d * 25 + s, -68); c.quadraticCurveTo(d * 28, -88, d * 21, -104); c.closePath(); }, hairFill(g, -114, -62), 1.4);
    }
    g.strokeStyle = PAL.hairShine; g.lineWidth = 3;
    g.beginPath(); g.arc(0, -116, 22, Math.PI * 1.15, Math.PI * 1.42); g.stroke();
  }

  /** Gáy tóc ngắn khi quay lưng. */
  function hairBackViewShort(g, p) {
    const s = p.hair;
    shape(g, c => c.ellipse(0, -108, 30, 29, 0, 0, TAU), hairFill(g, -138, -80), 1.6);
    shape(g, c => {
      c.moveTo(-29, -104); c.quadraticCurveTo(-37 - s * 0.4, -88, -34 - s * 0.6, -72);
      for (const [x, y] of [[-26, -80], [-18 - s * 0.4, -68], [-10, -80], [0 - s * 0.3, -66], [10, -80], [18 - s * 0.3, -68], [26, -80]]) c.lineTo(x, y);
      c.lineTo(34 - s * 0.4, -72); c.quadraticCurveTo(37, -88, 29, -104); c.closePath();
    }, lin(g, 0, -104, 0, -66, [[0, PAL.hair], [1, PAL.hairDark]]), 1.6);
    g.strokeStyle = PAL.hairShine; g.lineWidth = 3;
    g.beginPath(); g.arc(0, -112, 22, Math.PI * 1.2, Math.PI * 1.5); g.stroke();
  }

  /** Búi tóc trên đỉnh, đội ngân quan khảm ngọc, trâm cài ngang. */
  function topknot(g, x, back) {
    shape(g, c => c.ellipse(x, -143, 9, 8, 0, 0, TAU), hairFill(g, -151, -135), 1.4);
    const silver = lin(g, x - 10, -152, x + 10, -136, [[0, '#ffffff'], [0.5, '#c9d2e2'], [1, '#7c879e']]);
    shape(g, c => {
      c.moveTo(x - 10, -138); c.lineTo(x - 9, -148); c.quadraticCurveTo(x - 4, -146, x - 3, -153);
      c.lineTo(x, -149); c.lineTo(x + 3, -153); c.quadraticCurveTo(x + 4, -146, x + 9, -148); c.lineTo(x + 10, -138);
      c.quadraticCurveTo(x, -135, x - 10, -138); c.closePath();
    }, silver, 1.2);
    if (!back) dot(g, x, -142, 2, PAL.jade);
    line(g, [[x - 17, -142], [x + 17, -145]], PAL.goldDark, 2.4);
    line(g, [[x - 17, -142], [x + 17, -145]], PAL.goldHi, 1);
    dot(g, x + 18, -145, 1.8, PAL.inner);
  }

  /** Cổ áo đứng (giao lĩnh) viền vàng, thay cho cổ lông. side: góc 3/4 lệch nhẹ. */
  function highCollar(g, side) {
    const o = side ? 2 : 0;
    const fill = lin(g, 0, -84, 0, -64, [[0, PAL.inner], [1, PAL.innerDark]]);
    for (const d of [-1, 1]) {
      shape(g, c => {
        c.moveTo(o + d * 4, -86); c.quadraticCurveTo(o + d * 14, -84, o + d * 15, -77);
        c.quadraticCurveTo(o + d * 9, -70, o, -63); c.quadraticCurveTo(o + d * 4, -74, o + d * 4, -86); c.closePath();
      }, fill, 1.3);
      line(g, [[o + d * 14.4, -77.5], [o, -63.5]], PAL.gold, 1.2);
    }
  }

  /** Ngọc bội treo trước ngực (thay nơ nâu). */
  function jadePendant(g, x, y) {
    line(g, [[x, y - 6], [x, y + 2]], PAL.goldDark, 1);
    shape(g, c => c.ellipse(x, y + 5, 3.4, 4, 0, 0, TAU), lin(g, 0, y + 1, 0, y + 9, [[0, PAL.jade], [1, PAL.jadeDark]]), 1);
    line(g, [[x, y + 9], [x - 1, y + 15]], PAL.inner, 1.4);
    line(g, [[x, y + 9], [x + 1.5, y + 15]], PAL.inner, 1.4);
  }

  // bộ chọn theo kiểu nhân vật
  const backHair = (g, p) => (isKT() ? hairBackShort : hairBackLong)(g, p);
  const frontBangs = (g, p) => (isKT() ? bangsSwept : bangsFront)(g, p);
  const backViewHair = (g, p) => (isKT() ? hairBackViewShort : hairBackView)(g, p);
  const collar = (g, side) => (isKT() ? highCollar(g, side) : furCollar(g, side));
  const chestTie = (g, x, y) => (isKT() ? jadePendant(g, x, y) : bow(g, x, y));
  const hasPonytail = () => !FEAT.hat && !FEAT.buns && !FEAT.npc && !isKT();

  // ------------------------------------------------------------ góc nhìn
  function drawFront(g, p) {
    const holds = FEAT.sword;
    if (hasPonytail()) ponytail(g, p, 0, false);
    backHair(g, p);
    waistRibbons(g, p, [-1, 1]);
    coatBackFront(g, p, lin(g, 0, -74, 0, -12, [[0, PAL.robeDeep], [1, darken(PAL.robeDeep, 0.3)]]));
    legsFront(g, p, false);
    shirtFront(g);
    coatPanels(g, p);
    shape(g, c => c.rect(-4, -84, 8, 10), PAL.skinShade, 1.3);
    shape(g, c => c.rect(-5.5, -81, 11, 3), PAL.sash, 0);
    dot(g, 0, -78, 1.5, PAL.gold);
    collar(g, false);
    chestTie(g, 0, -63);
    arm(g, 15, -70, armRot(p, -0.25, -0.6), false, 0, false);
    arm(g, -15, -70, armRot(p, 0.5, -2.6), holds, swordAngle(p, 2.42, -1.4), false);
    head(g, 0);
    faceFront(g, p);
    beard(g, p, false);
    frontBangs(g, p);
    topper(g, p, 0, false, false);
  }

  function drawBack(g, p) {
    const holds = FEAT.sword;
    arm(g, -15, -70, armRot(p, -0.5, -0.5), false, 0, true);
    arm(g, 15, -70, armRot(p, -0.5, 2.6), holds, swordAngle(p, 0.72, 4.54), true);
    legsFront(g, p, true);
    coatBackFront(g, p, coatFill(g, -31, -74, 31, -12));
    waistRibbons(g, p, [-1, 1]);
    collar(g, false);
    backViewHair(g, p);
    if (hasPonytail()) ponytail(g, p, 0, false);
    topper(g, p, 0, false, true);
  }

  /** Góc nghiêng thuần (profile). Giữ lại để dùng khi cần; góc ngang mặc định giờ là drawSide (3/4). */
  function drawProfile(g, p) {
    const s = Math.min(p.hair, 9), w = p.sway, holds = FEAT.sword;
    // tóc dài bay ra sau
    shape(g, c => {
      c.moveTo(-4, -136); c.quadraticCurveTo(-36 - s, -126, -40 - s * 1.2, -92);
      for (const [x, y] of [[-46 - s * 1.6, -46], [-36 - s * 1.2, -58], [-34 - s * 1.4, -38], [-26 - s, -56], [-18, -72]]) c.lineTo(x, y);
      c.quadraticCurveTo(-18, -100, -6, -124); c.closePath();
    }, lin(g, 0, -136, 0, -38, [[0, PAL.hair], [1, PAL.hairDark]]), 1.6);
    if (!FEAT.hat && !FEAT.buns && !FEAT.npc) ponytail(g, p, -2, true);
    arm(g, -3, -70, armRot(p, 0.35, 0.35), false, 0, true);
    waistRibbons(g, p, [-1]);
    legsSide(g, p);
    const fl = p.lean * 3; // vạt trước bị gió hất khi lướt
    // lớp lót trong lộ ra ở vạt sau
    shape(g, c => {
      c.moveTo(-15, -50); c.bezierCurveTo(-20, -36, -24 - w, -24, -29 - w * 1.1, -15);
      c.quadraticCurveTo(-22 - w, -12, -14, -14); c.quadraticCurveTo(-14, -32, -12, -50); c.closePath();
    }, lin(g, 0, -50, 0, -12, [[0, PAL.innerDark], [1, PAL.inner]]), 1.3);
    // thân áo khoác dáng chữ A: lưng cong theo vai, vạt dưới gợn, ngực trước hơi phồng
    shape(g, c => {
      c.moveTo(-10, -76);
      c.bezierCurveTo(-17, -70, -17, -58, -16, -50);                 // vai → lưng
      c.bezierCurveTo(-18, -38, -23 - w, -26, -27 - w, -16);         // vạt sau xoè
      c.quadraticCurveTo(-18 - w * 0.6, -11, -8, -14);                // gợn vạt
      c.quadraticCurveTo(4, -9, 19 + fl, -18);                        // vạt trước
      c.bezierCurveTo(17 + fl * 0.6, -30, 15, -44, 14.5, -52);       // mép trước lên eo
      c.bezierCurveTo(15.5, -60, 15, -68, 11, -76);                   // ngực
      c.quadraticCurveTo(0, -79, -10, -76); c.closePath();
    }, coatFill(g, -27, -76, 19, -14), 1.6);
    // nếp vải
    g.strokeStyle = PAL.robeDeep; g.lineWidth = 1.1;
    g.beginPath();
    g.moveTo(-9, -46); g.quadraticCurveTo(-12 - w * 0.4, -30, -16 - w * 0.6, -15);
    g.moveTo(3, -44); g.quadraticCurveTo(3, -30, 4, -12);
    g.stroke();
    g.strokeStyle = PAL.robe; g.lineWidth = 0.9;
    g.beginPath(); g.moveTo(-13, -70); g.quadraticCurveTo(-14, -62, -13, -54); g.stroke();
    // nẹp áo sơ mi + viền lam ở mép trước và vạt dưới
    shape(g, c => {
      c.moveTo(8, -74); c.quadraticCurveTo(12.5, -66, 13, -52);
      c.bezierCurveTo(14, -40, 15.5 + fl * 0.6, -28, 16.5 + fl, -19);
      c.lineTo(12 + fl * 0.7, -20); c.bezierCurveTo(11, -32, 9.5, -44, 9.5, -52);
      c.quadraticCurveTo(9, -64, 5, -74); c.closePath();
    }, PAL.shirt, 1.1);
    g.strokeStyle = PAL.inner; g.lineWidth = 2.2;
    g.beginPath(); g.moveTo(11, -76); g.bezierCurveTo(15, -68, 15.5, -60, 14.5, -52);
    g.bezierCurveTo(15, -44, 17 + fl * 0.6, -30, 19 + fl, -18); g.stroke();
    g.beginPath(); g.moveTo(-27 - w, -16); g.quadraticCurveTo(-18 - w * 0.6, -11, -8, -14); g.quadraticCurveTo(4, -9, 19 + fl, -18); g.stroke();
    // đai lưng
    shape(g, c => { c.moveTo(-16.4, -53); c.quadraticCurveTo(0, -50.5, 14.8, -54); c.lineTo(14.6, -49.5); c.quadraticCurveTo(0, -46, -16.2, -48.5); c.closePath(); }, PAL.sash, 1);
    dot(g, 11, -51.5, 1.5, PAL.gold);
    // cổ: thon, cong theo gáy
    shape(g, c => { c.moveTo(-1, -86); c.quadraticCurveTo(-2, -80, -2.5, -74); c.lineTo(8, -74); c.quadraticCurveTo(7, -80, 8.5, -85); c.closePath(); }, PAL.skinShade, 1.3);
    furCollar(g, true);
    bow(g, 12, -63);
    // đầu & mặt nghiêng: gáy tròn, trán, sống mũi nhỏ, má bầu, cằm thon
    const gr = g.createRadialGradient(-2, -112, 6, 6, -102, 34);
    gr.addColorStop(0, PAL.skin); gr.addColorStop(1, PAL.skinShade);
    shape(g, c => {
      c.moveTo(-22, -96);
      c.bezierCurveTo(-28, -118, -12, -134, 4, -134);                // gáy → đỉnh đầu
      c.bezierCurveTo(20, -134, 28, -122, 28.5, -108);                // trán
      c.quadraticCurveTo(29, -102, 30.6, -99);                        // sống mũi
      c.quadraticCurveTo(31.4, -97.4, 29.6, -96.6);                   // chóp mũi
      c.quadraticCurveTo(30.6, -92, 29.4, -89);                       // nhân trung → môi
      c.bezierCurveTo(28.8, -84, 25, -81, 20, -80.5);                 // cằm
      c.bezierCurveTo(12, -80, 6, -82, 2, -86);                       // quai hàm
      c.bezierCurveTo(-8, -86, -18, -88, -22, -96); c.closePath();
    }, gr, 1.8);
    // tai (phần lớn bị tóc che)
    shape(g, c => c.ellipse(1, -99, 4.2, 5.4, -0.2, 0, TAU), PAL.skinShade, 1.2);
    eye(g, 18, -98, 4.2, p.hurt, false);
    g.fillStyle = PAL.blush; g.beginPath(); g.ellipse(21, -89, 3.8, 2, 0, 0, TAU); g.fill();
    line(g, [[25.4, -86.6], [28, -87]], PAL.line, 1.2);
    beard(g, p, true);
    shape(g, c => {
      c.moveTo(29, -104); c.bezierCurveTo(31, -132, 12, -140, -4, -139);
      c.bezierCurveTo(-24, -137, -30, -118, -26, -96);
      c.quadraticCurveTo(-25, -82, -18 - s * 0.4, -70);
      for (const [x, y] of [[-12, -86], [-6, -96], [2, -98], [7, -112], [12, -100], [17, -114], [21, -102], [25, -110]]) c.lineTo(x, y);
      c.closePath();
    }, hairFill(g, -140, -70), 1.6);
    shape(g, c => { c.moveTo(1, -106); c.quadraticCurveTo(-3, -86, 2 + s * 0.3, -66); c.quadraticCurveTo(6, -86, 7, -104); c.closePath(); }, hairFill(g, -106, -66), 1.3);
    g.strokeStyle = PAL.hairShine; g.lineWidth = 3;
    g.beginPath(); g.arc(0, -114, 22, Math.PI * 1.2, Math.PI * 1.5); g.stroke();
    topper(g, p, -2, true, false);
    arm(g, 2, -70, armRot(p, -0.4, -2.0), holds, swordAngle(p, 0.64, -1.0), false);
  }

  // ------------------------------------------------------------ góc ngang: thế 3/4 anh hùng
  /** Áo choàng sau lưng xoè rộng, viền vàng, vạt dưới lượn sóng bay theo gió. */
  function capeBack3q(g, p) {
    const w = p.sway, h = p.hair * 0.5;
    const path = c => {
      c.moveTo(-18, -76);
      c.bezierCurveTo(-28, -64, -33, -40, -38 - w * 1.3, -11 + h * 0.3);
      c.quadraticCurveTo(-30 - w, -15, -24 - w * 0.8, -9);
      c.quadraticCurveTo(-14 - w * 0.5, -14, -4, -8);
      c.quadraticCurveTo(8, -13, 18, -8);
      c.quadraticCurveTo(26, -14, 34 - w * 0.4, -10);
      c.bezierCurveTo(31, -38, 28, -62, 20, -76);
      c.quadraticCurveTo(0, -80, -18, -76); c.closePath();
    };
    shape(g, path, lin(g, 0, -76, 0, -8, [[0, PAL.robeDeep], [1, darken(PAL.robeDeep, 0.35)]]), 1.6);
    // lớp lót trong ở mép áo choàng
    shape(g, c => {
      c.moveTo(-34 - w * 1.1, -22); c.quadraticCurveTo(-36 - w * 1.3, -14, -38 - w * 1.3, -11 + h * 0.3);
      c.quadraticCurveTo(-30 - w, -15, -24 - w * 0.8, -9); c.quadraticCurveTo(-28 - w, -16, -34 - w * 1.1, -22); c.closePath();
    }, PAL.inner, 1.1);
    // viền vàng + hoa văn cuộn
    g.save(); g.beginPath(); path(g); g.clip();
    g.strokeStyle = PAL.gold; g.lineWidth = 2.4;
    g.beginPath(); path(g); g.stroke();
    g.strokeStyle = PAL.goldDark; g.lineWidth = 1.2;
    for (const [cx, cy, r] of [[-25 - w, -26, 4.5], [26, -24, 4]]) {
      g.beginPath(); g.arc(cx, cy, r, 0.2, Math.PI * 1.6); g.arc(cx + r * 0.35, cy + r * 0.1, r * 0.45, Math.PI * 1.6, 0.4, true); g.stroke();
    }
    g.restore();
  }

  /** Giáp vai vàng cuộn sừng (hai bên vai). d = -1 vai xa, 1 vai gần. */
  function pauldron(g, x, d) {
    const fill = lin(g, x - 8, -80, x + 8, -66, [[0, PAL.goldHi], [0.5, PAL.gold], [1, PAL.goldDark]]);
    shape(g, c => {
      c.moveTo(x - 9 * d, -70);
      c.bezierCurveTo(x - 8 * d, -80, x + 4 * d, -82, x + 10 * d, -76);
      c.quadraticCurveTo(x + 13 * d, -73, x + 11 * d, -68);
      c.quadraticCurveTo(x + 2 * d, -71, x - 9 * d, -70); c.closePath();
    }, fill, 1.3);
    // sừng cuộn
    shape(g, c => {
      c.moveTo(x + 3 * d, -79); c.quadraticCurveTo(x + 2 * d, -87, x + 7 * d, -89);
      c.quadraticCurveTo(x + 4 * d, -85, x + 6.5 * d, -80); c.closePath();
    }, fill, 1.1);
    g.strokeStyle = PAL.goldDark; g.lineWidth = 0.9;
    g.beginPath(); g.moveTo(x - 5 * d, -72.5); g.quadraticCurveTo(x + 2 * d, -76, x + 9 * d, -72); g.stroke();
  }

  /** Mặt 3/4: mắt xa nhỏ hơn và lệch vào trong, mắt gần to; má, miệng lệch về hướng nhìn. */
  function face3q(g, p) {
    eye(g, -6, -98, 4.4, p.hurt, true);
    eye(g, 13, -98, 5.4, p.hurt, false);
    g.fillStyle = PAL.blush;
    g.beginPath(); g.ellipse(21, -89, 4.2, 2.1, 0, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(-11, -89, 2.6, 1.8, 0, 0, TAU); g.fill();
    g.strokeStyle = PAL.line; g.lineWidth = 1.3;
    g.beginPath();
    if (p.hurt) g.ellipse(6, -85, 2, 2.4, 0, 0, TAU); else g.arc(6, -87, 2.2, Math.PI * 0.2, Math.PI * 0.8);
    g.stroke();
  }

  /**
   * Góc ngang (hướng +x; hướng -x = lật ngang): thế đứng 3/4 kiểu anh hùng chibi.
   * Thân quay gần chính diện, đầu và mặt hướng về phía trước, hai chân dang rộng,
   * áo choàng xoè viền vàng, giáp vai, tay gần chỉ về phía trước, tay xa cầm kiếm.
   */
  function drawSide(g, p) {
    const holds = FEAT.sword, hero = !FEAT.npc;
    if (hasPonytail()) ponytail(g, p, -3, false);
    g.save(); g.translate(-3, 0); backHair(g, p); g.restore();
    waistRibbons(g, p, [-1]);
    if (hero) capeBack3q(g, p);
    else coatBackFront(g, p, lin(g, 0, -74, 0, -12, [[0, PAL.robeDeep], [1, darken(PAL.robeDeep, 0.3)]]));
    // tay xa (sau thân) cầm kiếm
    arm(g, -14, -70, armRot(p, 0.45, -2.6), holds, swordAngle(p, 2.42, -1.4), true);
    legsFront(g, p, false, hero ? 9.5 : 7, 4);
    g.save(); g.translate(2, 0);
    shirtFront(g);
    coatPanels(g, p);
    if (hero) {
      // viền vàng trên vạt trước + đai lưng khoá vàng
      for (const d of [-1, 1]) line(g, [[d * 9, -70], [d * 12.5, -46], [d * 14.5 + p.sway * 0.6, -20]], PAL.gold, 1.4);
      shape(g, c => { c.moveTo(-13, -48); c.quadraticCurveTo(0, -45.5, 13, -48); c.lineTo(13, -43.5); c.quadraticCurveTo(0, -41, -13, -43.5); c.closePath(); }, PAL.sash, 1);
      shape(g, c => c.rect(-3, -48.4, 6, 5.6), lin(g, 0, -48, 0, -43, [[0, PAL.goldHi], [1, PAL.goldDark]]), 1);
    }
    g.restore();
    // cổ
    shape(g, c => { c.moveTo(-1.5, -85); c.quadraticCurveTo(-2.5, -79, -3, -74); c.lineTo(9, -74); c.quadraticCurveTo(8.5, -79, 7.5, -85); c.closePath(); }, PAL.skinShade, 1.3);
    g.save(); g.translate(2, 0); collar(g, false); g.restore();
    if (hero) { pauldron(g, -17, -1); pauldron(g, 21, 1); }
    chestTie(g, 3, -63);
    // tay gần: chỉ về phía trước (khi vận công giơ cao hơn)
    arm(g, 18, -70, armRot(p, -1.1, -1.9), false, 0, false);
    head(g, 3);
    face3q(g, p);
    g.save(); g.translate(3, 0); beard(g, p, false); frontBangs(g, p); g.restore();
    topper(g, p, 3, false, false);
  }

  function drawFrame(g, dir, anim, f) {
    const p = pose(anim, f);
    currentPose = p;
    g.lineJoin = 'round'; g.lineCap = 'round';
    g.save();
    if (dir === 'side') g.rotate(p.lean * 0.15);
    g.translate(0, p.bob);
    if (dir === 'side') drawSide(g, p); else if (dir === 'up') drawBack(g, p); else drawFront(g, p);
    g.restore();
    currentPose = null;
  }

  // ------------------------------------------------------------ sprite sheet
  const sheets = {};
  const rows = {};
  const tintCache = {};

  function invalidateSheets() {
    for (const k in sheets) delete sheets[k];
    for (const k in tintCache) delete tintCache[k];
  }

  /** Tạo hình theo id: skin người chơi (D.skins) hoặc NPC (D.npcLooks). */
  /** Skin kiếm (D.swordSkins) theo id, hoặc undefined. */
  function swordSkin(id) {
    const D = TT.DATA || {};
    return id ? (D.swordSkins || []).find(k => k.id === id) : undefined;
  }

  function lookFor(id, swordId) {
    const D = TT.DATA || {};
    const npc = D.npcLooks && D.npcLooks[id];
    const s = !npc && (D.skins || []).find(k => k.id === id);
    const sw = !npc && swordSkin(swordId);
    const pal = Object.assign({}, BASE_PAL, npc ? npc.pal : (s ? s.pal : {}), sw ? sw.pal : {});
    if (!pal.hairDark || (npc && !npc.pal.hairDark) || (s && !s.pal.hairDark)) pal.hairDark = darken(pal.hair, 0.38);
    const customImg = sw && (sw.customImg || (sw.sprite && typeof sw.sprite === 'object' ? sw.sprite : null));
    // skin người chơi có thể kèm feat riêng (vd. style: 'kiemtien' = kiểu tóc/cổ áo khác hẳn)
    const feat = npc ? Object.assign({ npc: true, sword: false }, npc.feat)
      : Object.assign({ sword: true, hideEye: true, blade: sw ? sw.shape : 'jian', customImg, swordSkin: sw }, s && s.feat);
    return { pal, feat, npc: !!npc };
  }

  /** Khoá cache sheet: NPC bỏ qua skin kiếm. */
  function sheetKey(skinId, swordId) {
    skinId = skinId || 'THANH_VAN';
    const D = TT.DATA || {};
    return D.npcLooks && D.npcLooks[skinId] ? skinId : skinId + '|' + (swordId || '');
  }

  /**
   * Dựng (và cache) sprite sheet cho 1 skin/NPC (cột = frame, hàng = hoạt cảnh x hướng).
   * NPC chỉ cần idle + walk (6 hàng đầu, cùng thứ tự hàng với sheet đầy đủ).
   * swordId: skin kiếm (D.swordSkins) cho kiếm cầm tay; bỏ trống = kiếm mặc định.
   */
  function buildSheet(skinId, swordId) {
    skinId = skinId || 'THANH_VAN';
    const key = sheetKey(skinId, swordId);
    if (sheets[key]) return sheets[key];
    const look = lookFor(skinId, swordId);
    const keys = [];
    for (const a in ANIMS) {
      if (look.npc && a !== 'idle' && a !== 'walk') continue;
      for (const d of DIRS) keys.push([a, d]);
    }
    const maxF = Math.max(...Object.values(ANIMS));
    const sheet = TT.Art.canvas(FW * maxF, FH * keys.length);
    const g = sheet.getContext('2d');
    PAL = look.pal;
    FEAT = look.feat;
    keys.forEach(([a, d], r) => {
      rows[a + '_' + d] = r;
      for (let f = 0; f < ANIMS[a]; f++) {
        g.save();
        g.beginPath(); g.rect(f * FW, r * FH, FW, FH); g.clip();
        g.translate(f * FW + AX, r * FH + AY);
        drawFrame(g, d, a, f);
        g.restore();
      }
    });
    PAL = BASE_PAL;
    FEAT = {};
    return (sheets[key] = sheet);
  }

  function tinted(sheet, skinId, color) {
    const key = skinId + '|' + color;
    if (tintCache[key]) return tintCache[key];
    const c = TT.Art.canvas(sheet.width, sheet.height);
    const g = c.getContext('2d');
    g.drawImage(sheet, 0, 0);
    g.globalCompositeOperation = 'source-atop';
    g.fillStyle = color; g.fillRect(0, 0, c.width, c.height);
    return (tintCache[key] = c);
  }

  function facing(angle) {
    const cx = Math.cos(angle);
    if (Math.abs(cx) >= 0.6) return ['side', cx >= 0 ? 1 : -1];
    return [Math.sin(angle) > 0 ? 'down' : 'up', 1];
  }

  /** Chọn frame theo trạng thái. st.cast: tỉ lệ 1→0 còn lại của động tác phóng kiếm. */
  function pickFrame(aim, t, st) {
    let anim = 'idle';
    if (st.hurt) anim = 'hurt';
    else if (st.dash) anim = 'dash';
    else if (st.cast > 0) anim = 'cast';
    else if (st.moving) anim = 'walk';
    const n = ANIMS[anim];
    const f = anim === 'cast' ? Math.min(n - 1, Math.floor((1 - st.cast) * n)) : Math.floor(t * FPS[anim]) % n;
    const [dir, flip] = facing(st.dash && st.dashAngle !== undefined ? st.dashAngle : aim);
    return { anim, f, dir, flip };
  }

  function blit(ctx, img, fr, x, y) {
    const r = rows[fr.anim + '_' + fr.dir];
    ctx.save();
    ctx.translate(x, y + FOOT_OFFSET);
    ctx.scale(fr.flip * RENDER_SCALE, RENDER_SCALE);
    ctx.drawImage(img, fr.f * FW, r * FH, FW, FH, -AX, -AY, FW, FH);
    ctx.restore();
  }

  // ------------------------------------------------------------ lớp linh khí
  function spiritBack(ctx, x, y, t, st, color, power) {
    const A = TT.Art;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    A.glow(ctx, x, y - 26, 30 * power, color, 0.16 + Math.sin(t * 2.2) * 0.05);
    ctx.strokeStyle = A.rgba(color, 0.4); ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 5]); ctx.lineDashOffset = -t * 12;
    ctx.beginPath(); ctx.ellipse(x, y + FOOT_OFFSET, 18 * power, 6 * power, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  // ------------------------------------------------------------ thần luân (Dao wheel) sau lưng
  const WHEEL_RUNES = '乾坤震巽坎離艮兌';
  /** RNG nhỏ có seed, dùng cho tia sét để khung hình ổn định trong cùng 1 nhịp. */
  function sparkRng(seed) {
    let s = (seed * 9301 + 49297) % 233280;
    return () => (s = (s * 9301 + 49297) % 233280) / 233280;
  }
  /**
   * Thần luân nhiều tầng: vành ngoài có vạch chia, vòng phù văn bát quái quay ngược,
   * vòng cung năng lượng quay nhanh, trục nan hoa ở giữa. Cảnh giới càng cao càng thêm tầng
   * (lv>=1 hào quang tia, lv>=2 quỹ đạo linh châu, lv>=3 vành ngoài cùng). Khi vận công có tia sét.
   * Màu theo hệ (color), nên Hỏa tu ra luân vàng đỏ, Băng tu ra luân băng lam.
   */
  function daoWheel(ctx, x, y, t, st, color, lv, alphaMul) {
    const A = TT.Art;
    const cast = Math.max(0, Math.min(1, st.cast || 0));
    const R = 22 + Math.min(lv, 4) * 1.5;
    const spin = t * (1 + cast * 3);
    const a = alphaMul * (st.dash ? 0.45 : 1) * (0.85 + Math.sin(t * 2.2) * 0.15);
    const col = (al) => A.rgba(color, Math.min(1, al * a));
    const white = (al) => `rgba(255,255,255,${Math.min(1, al * a)})`;
    const circle = (r, w, style) => { ctx.strokeStyle = style; ctx.lineWidth = w; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke(); };

    ctx.save();
    ctx.translate(x, y - 40);
    ctx.scale(1, 0.96); // hơi nghiêng cho góc nhìn top-down
    ctx.globalCompositeOperation = 'lighter';
    A.glow(ctx, 0, 0, R * 1.55, color, (0.16 + cast * 0.2) * a);

    // tầng ngoài cùng (lv>=3): vành chấm quay ngược
    if (lv >= 3) {
      ctx.save(); ctx.rotate(-spin * 0.15);
      ctx.setLineDash([1.5, 3.5]); circle(R + 7, 1, col(0.55)); ctx.setLineDash([]);
      ctx.restore();
    }
    // hào quang tia (lv>=1)
    if (lv >= 1) {
      ctx.save(); ctx.rotate(spin * 0.1);
      const n = 16;
      for (let i = 0; i < n; i++) {
        const ang = (i / n) * TAU;
        const len = 3 + (i % 2) * 2.5 + Math.sin(t * 4 + i) * 1.2 + cast * 3;
        ctx.save(); ctx.rotate(ang);
        ctx.fillStyle = col(0.45);
        ctx.beginPath(); ctx.moveTo(-1.2, -R - 1); ctx.lineTo(0, -R - 1 - len); ctx.lineTo(1.2, -R - 1); ctx.closePath(); ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    }
    // vành chính: 2 đường tròn + vạch chia
    ctx.save(); ctx.rotate(spin * 0.25);
    circle(R, 3.2, col(0.3));
    circle(R, 1.1, white(0.85));
    circle(R - 4, 0.8, col(0.6));
    ctx.strokeStyle = col(0.75); ctx.lineWidth = 0.8;
    for (let i = 0; i < 24; i++) {
      const ang = (i / 24) * TAU, r0 = i % 3 ? R - 1.8 : R - 4;
      ctx.beginPath(); ctx.moveTo(Math.cos(ang) * r0, Math.sin(ang) * r0); ctx.lineTo(Math.cos(ang) * R, Math.sin(ang) * R); ctx.stroke();
    }
    ctx.restore();
    // vòng phù văn bát quái quay ngược
    ctx.save(); ctx.rotate(-spin * 0.4);
    ctx.font = 'bold 5px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (let i = 0; i < 8; i++) {
      ctx.save(); ctx.rotate((i / 8) * TAU); ctx.translate(0, -(R - 8));
      ctx.fillStyle = col(0.5); ctx.fillText(WHEEL_RUNES[i], 0.4, 0.4);
      ctx.fillStyle = white(0.9); ctx.fillText(WHEEL_RUNES[i], 0, 0);
      ctx.restore();
    }
    circle(R - 12, 0.7, col(0.5));
    ctx.restore();
    // vòng cung năng lượng quay nhanh
    ctx.save(); ctx.rotate(spin * 0.9);
    ctx.lineCap = 'round';
    for (let k = 0; k < 6; k++) {
      const s0 = (k / 6) * TAU;
      ctx.strokeStyle = col(0.7); ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(0, 0, R - 14.5, s0, s0 + (TAU / 6) * 0.6); ctx.stroke();
    }
    ctx.restore();
    // trục nan hoa
    ctx.save(); ctx.rotate(-spin * 0.2);
    ctx.strokeStyle = col(0.4); ctx.lineWidth = 0.7;
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * TAU;
      ctx.beginPath(); ctx.moveTo(Math.cos(ang) * 3, Math.sin(ang) * 3); ctx.lineTo(Math.cos(ang) * (R - 12), Math.sin(ang) * (R - 12)); ctx.stroke();
    }
    circle(3.5, 1, white(0.7));
    ctx.restore();
    // quỹ đạo linh châu (lv>=2)
    if (lv >= 2) {
      ctx.save(); ctx.rotate(0.5);
      ctx.strokeStyle = col(0.3); ctx.lineWidth = 0.7;
      ctx.beginPath(); ctx.ellipse(0, 0, R + 4, (R + 4) * 0.32, 0, 0, TAU); ctx.stroke();
      for (let i = 0; i < 3; i++) {
        const ang = t * 1.6 + (i / 3) * TAU;
        const ox = Math.cos(ang) * (R + 4), oy = Math.sin(ang) * (R + 4) * 0.32;
        A.glow(ctx, ox, oy, 4, color, 0.7 * a);
        ctx.fillStyle = white(0.95); ctx.beginPath(); ctx.arc(ox, oy, 1.1, 0, TAU); ctx.fill();
      }
      ctx.restore();
    }
    // tia sét khi vận công
    if (cast > 0) {
      const rnd = sparkRng(Math.floor(t * 24));
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (let b = 0; b < 3 + Math.min(lv, 3); b++) {
        const ang = rnd() * TAU;
        const pts = [[Math.cos(ang) * R, Math.sin(ang) * R]];
        let r = R;
        for (let k = 0; k < 4; k++) {
          r += 3 + rnd() * 4;
          const aj = ang + (rnd() - 0.5) * 0.5;
          pts.push([Math.cos(aj) * r, Math.sin(aj) * r]);
        }
        const bolt = () => { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (const p of pts) ctx.lineTo(p[0], p[1]); };
        bolt(); ctx.strokeStyle = A.rgba(color, 0.55 * cast); ctx.lineWidth = 2.6; ctx.stroke();
        bolt(); ctx.strokeStyle = `rgba(255,255,255,${0.95 * cast})`; ctx.lineWidth = 0.8; ctx.stroke();
      }
    }
    ctx.restore();
  }

  function spiritFront(ctx, x, y, t, color, power) {
    const A = TT.Art;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const n = Math.round(6 + 4 * power);
    for (let i = 0; i < n; i++) {
      const ph = (t * 0.55 + i / n) % 1;
      const px = x + Math.sin(i * 2.39 + t * 1.3) * (12 + (i % 4) * 3);
      const py = y + 10 - ph * 66;
      ctx.fillStyle = A.rgba(i % 3 ? color : '#ffffff', Math.sin(ph * Math.PI) * 0.85);
      ctx.beginPath(); ctx.arc(px, py, 0.9 + (i % 3) * 0.5, 0, Math.PI * 2); ctx.fill();
    }
    for (let i = 0; i < 3; i++) {
      const ph = (t * 0.8 + i / 3) % 1;
      const bx = x + (i - 1) * 10;
      ctx.strokeStyle = A.rgba(color, 0.35 * (1 - ph));
      ctx.lineWidth = 2 * (1 - ph) + 0.5;
      ctx.beginPath(); ctx.moveTo(bx, y + 6);
      ctx.quadraticCurveTo(bx + Math.sin(t * 3 + i) * 6, y + 10 + ph * 6, bx + (i - 1) * 6 * ph + Math.sin(t * 2 + i) * 4, y + 12 + ph * 10);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ------------------------------------------------------------ Tiên Nhãn / Ma Nhãn
  /** Tra định nghĩa mắt: nhận object, id 'EYE_n' hoặc số thứ tự. */
  function eyeDef(eyeId) {
    if (eyeId && typeof eyeId === 'object') return eyeId;
    const list = (TT.DATA && TT.DATA.eyes) || [];
    if (typeof eyeId === 'number') return list[eyeId] || null;
    return list.find(e => e.id === eyeId) || null;
  }

  /**
   * Vẽ tròng mắt phát sáng theo kiểu (style) trong elip tâm (cx, cy), bán kính rx, ry.
   * Dùng chung cho mắt trên mặt nhân vật (rất nhỏ) và khung phóng to (lớn). Phải gọi sau khi đã clip vào lòng mắt.
   */
  function irisPattern(ctx, cx, cy, rx, ry, E, t) {
    const A = TT.Art, col = E.color || '#9fe8ff', u = Math.min(rx, ry);
    const deep = darken(col, 0.72);
    const gr = ctx.createRadialGradient(cx, cy - ry * 0.25, u * 0.1, cx, cy, Math.max(rx, ry) * 1.05);
    gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.35, col); gr.addColorStop(1, deep);
    ctx.fillStyle = gr; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = deep; ctx.strokeStyle = deep; ctx.lineWidth = Math.max(0.5, u * 0.14);
    switch (E.style) {
      case 'slit': { // đồng tử dọc như rồng/rắn, co giãn nhẹ
        const sw = u * (0.16 + 0.06 * Math.sin(t * 2));
        ctx.beginPath(); ctx.moveTo(cx, cy - ry * 0.9);
        ctx.quadraticCurveTo(cx + sw * 2, cy, cx, cy + ry * 0.9);
        ctx.quadraticCurveTo(cx - sw * 2, cy, cx, cy - ry * 0.9); ctx.fill();
        break;
      }
      case 'ring': { // vòng đồng tâm (luân hồi), vòng ngoài quay
        for (let k = 1; k <= 3; k++) { ctx.beginPath(); ctx.ellipse(cx, cy, rx * k * 0.27, ry * k * 0.27, 0, 0, TAU); ctx.stroke(); }
        for (let k = 0; k < 3; k++) {
          const a = t * 1.2 + k * TAU / 3;
          ctx.beginPath(); ctx.arc(cx + Math.cos(a) * rx * 0.68, cy + Math.sin(a) * ry * 0.68, u * 0.11, 0, TAU); ctx.fill();
        }
        ctx.beginPath(); ctx.arc(cx, cy, u * 0.16, 0, TAU); ctx.fill();
        break;
      }
      case 'star': { // tinh quang 4 cánh
        const r1 = u * 0.75, r0 = u * 0.16, rot = t * 0.6;
        ctx.beginPath();
        for (let k = 0; k < 8; k++) {
          const a = rot + k * Math.PI / 4, r = k % 2 ? r0 : r1;
          ctx.lineTo(cx + Math.cos(a) * r * rx / u, cy + Math.sin(a) * r * ry / u);
        }
        ctx.closePath(); ctx.fill();
        break;
      }
      case 'flame': { // ngọn lửa trong đồng tử
        const fl = Math.sin(t * 9) * 0.08;
        ctx.beginPath(); ctx.moveTo(cx, cy - ry * (0.75 + fl));
        ctx.bezierCurveTo(cx + rx * 0.55, cy - ry * 0.1, cx + rx * 0.4, cy + ry * 0.55, cx, cy + ry * 0.55);
        ctx.bezierCurveTo(cx - rx * 0.4, cy + ry * 0.55, cx - rx * 0.55, cy - ry * 0.1, cx, cy - ry * (0.75 + fl)); ctx.fill();
        ctx.fillStyle = A.rgba('#ffe08a', 0.9); ctx.beginPath(); ctx.ellipse(cx, cy + ry * 0.2, rx * 0.16, ry * 0.25, 0, 0, TAU); ctx.fill();
        break;
      }
      case 'bolt': { // tia chớp
        ctx.lineWidth = Math.max(0.6, u * 0.2); ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(cx + rx * 0.2, cy - ry * 0.8); ctx.lineTo(cx - rx * 0.25, cy + ry * 0.05);
        ctx.lineTo(cx + rx * 0.2, cy + ry * 0.05); ctx.lineTo(cx - rx * 0.2, cy + ry * 0.8); ctx.stroke();
        break;
      }
      case 'void': { // hố đen với vành sáng
        ctx.fillStyle = '#05030a'; ctx.beginPath(); ctx.ellipse(cx, cy, rx * 0.62, ry * 0.62, 0, 0, TAU); ctx.fill();
        ctx.strokeStyle = A.rgba(col, 0.9); ctx.lineWidth = Math.max(0.5, u * 0.12);
        ctx.beginPath(); ctx.ellipse(cx, cy, rx * 0.62, ry * 0.62, 0, t * 2, t * 2 + Math.PI * 1.4); ctx.stroke();
        break;
      }
      case 'yinyang': { // Thái Cực xoay
        const r = u * 0.62, a = t * 1.5;
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(a);
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
        ctx.fillStyle = '#141420'; ctx.beginPath(); ctx.arc(0, 0, r, -Math.PI / 2, Math.PI / 2); ctx.arc(0, r / 2, r / 2, Math.PI / 2, -Math.PI / 2, true);
        ctx.arc(0, -r / 2, r / 2, Math.PI / 2, -Math.PI / 2); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(0, r / 2, r * 0.14, 0, TAU); ctx.fill();
        ctx.fillStyle = '#141420'; ctx.beginPath(); ctx.arc(0, -r / 2, r * 0.14, 0, TAU); ctx.fill();
        ctx.restore();
        break;
      }
      case 'lotus': { // cánh hoa xoay
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * 0.8); ctx.scale(rx / u, ry / u);
        for (let k = 0; k < 6; k++) {
          ctx.rotate(TAU / 6);
          ctx.beginPath(); ctx.ellipse(0, -u * 0.38, u * 0.14, u * 0.32, 0, 0, TAU); ctx.fill();
        }
        ctx.restore();
        break;
      }
      default: // 'plain': đồng tử tròn
        ctx.beginPath(); ctx.ellipse(cx, cy, rx * 0.38, ry * 0.42, 0, 0, TAU); ctx.fill();
    }
    // điểm sáng phản chiếu
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.beginPath(); ctx.arc(cx + rx * 0.35, cy - ry * 0.4, u * 0.2, 0, TAU); ctx.fill();
  }

  /** 1 con mắt: lòng trắng + tròng phát sáng + viền mi. mirror: mắt bên trái (đuôi mi ngược). */
  function oneEye(ctx, cx, cy, rx, ry, E, t, mirror, lid) {
    const A = TT.Art;
    ctx.save();
    ctx.beginPath(); ctx.ellipse(cx, cy, rx * 1.12, ry, 0, 0, TAU); ctx.clip();
    ctx.fillStyle = '#f6f4ff'; ctx.fillRect(cx - rx * 2, cy - ry * 2, rx * 4, ry * 4);
    irisPattern(ctx, cx + (mirror ? 0.12 : -0.12) * rx, cy + ry * 0.08, rx * 0.95, ry * 0.92, E, t);
    ctx.restore();
    if (lid) {
      const m = mirror ? -1 : 1;
      ctx.strokeStyle = PAL.line || '#262030'; ctx.lineCap = 'round';
      ctx.lineWidth = Math.max(0.8, ry * 0.32);
      ctx.beginPath(); ctx.moveTo(cx - m * rx * 1.25, cy - ry * 0.45);
      ctx.quadraticCurveTo(cx, cy - ry * 1.35, cx + m * rx * 1.45, cy - ry * 0.65); ctx.stroke();
    }
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    A.glow(ctx, cx, cy, Math.max(rx, ry) * 2.4, E.color || '#9fe8ff', 0.28 + Math.sin(t * 3) * 0.08);
    ctx.restore();
  }

  /** Thiên nhãn dọc trên trán. */
  function thirdEye(ctx, cx, cy, s, E, t) {
    const A = TT.Art;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    A.glow(ctx, cx, cy, s * 3, E.color, 0.35 + Math.sin(t * 2.5) * 0.1);
    ctx.restore();
    ctx.save();
    ctx.beginPath(); ctx.moveTo(cx, cy - s * 1.6); ctx.quadraticCurveTo(cx + s * 0.9, cy, cx, cy + s * 1.6);
    ctx.quadraticCurveTo(cx - s * 0.9, cy, cx, cy - s * 1.6); ctx.closePath();
    ctx.fillStyle = darken(E.color, 0.6); ctx.fill();
    ctx.clip();
    irisPattern(ctx, cx, cy, s * 0.55, s * 1.2, E, t);
    ctx.restore();
  }

  /** Mắt trên mặt nhân vật trong game (toạ độ màn hình, đã trừ FOOT_OFFSET). */
  function drawFaceEyes(ctx, x, y, fr, E, t) {
    const p = pose(fr.anim, fr.f);
    if (p.hurt || fr.anim === 'dash') return; // trúng đòn: mắt nhắm; lướt: đầu nghiêng, bỏ qua
    const s = RENDER_SCALE, fy = y + FOOT_OFFSET + (-98 + p.bob) * s;
    if (fr.dir === 'down') {
      // mắt gốc trong sheet: rx 5.4, ry 6.75 ở độ phân giải gấp đôi
      oneEye(ctx, x - 11.5 * s, fy, 2.6, 3.2, E, t, true, false);
      oneEye(ctx, x + 11.5 * s, fy, 2.6, 3.2, E, t, false, false);
      if (E.third) thirdEye(ctx, x, y + FOOT_OFFSET + (-118 + p.bob) * s, 2, E, t);
    } else if (fr.dir === 'side') {
      // góc 3/4 (drawSide): mắt xa ở x = -6 (rx 4.4), mắt gần ở x = 13 (rx 5.4)
      oneEye(ctx, x + fr.flip * -6 * s, fy, 2.1, 2.7, E, t, fr.flip > 0, false);
      oneEye(ctx, x + fr.flip * 13 * s, fy, 2.6, 3.2, E, t, fr.flip < 0, false);
      if (E.third) thirdEye(ctx, x + fr.flip * 4 * s, y + FOOT_OFFSET + (-118 + p.bob) * s, 1.9, E, t);
    }
  }

  /** Ảnh phóng to cặp mắt (dùng ở thẻ trưng bày / cửa hàng). size = bề ngang khung. */
  function drawEyeIcon(ctx, x, y, size, eyeId, t) {
    const E = eyeDef(eyeId);
    if (!E) return false;
    const rx = size * 0.15, ry = size * 0.17, dx = size * 0.24;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    TT.Art.glow(ctx, x, y, size * 0.55, E.color, 0.18);
    ctx.restore();
    oneEye(ctx, x - dx, y + size * 0.06, rx, ry, E, t, true, true);
    oneEye(ctx, x + dx, y + size * 0.06, rx, ry, E, t, false, true);
    if (E.third) thirdEye(ctx, x, y - size * 0.24, size * 0.07, E, t);
    return true;
  }

  /**
   * Vẽ nhân vật + lớp linh khí. Trả về frame đã vẽ (để làm ảnh tàn khi lướt).
   * st: {moving, dash, dashAngle, cast(0..1), hurt, color, realm, mvx, mvy, skin, sword, spirit, ghosts:[{x,y,fr,life,max}]}
   */
  function draw(ctx, x, y, aim, t, st) {
    st = st || {};
    // aim nhận góc (radian) hoặc điểm nhìn {x, y}. Trước đây truyền điểm làm Math.cos(object) = NaN
    // nên nhân vật luôn quay lưng (hướng 'up').
    if (aim && typeof aim === 'object') aim = Math.atan2(aim.y - y, aim.x - x);
    if (typeof aim !== 'number' || !isFinite(aim)) aim = Math.PI / 2;
    const skinId = sheetKey(st.skin, st.sword); // dùng làm khoá cache ảnh tô màu
    const sheet = buildSheet(st.skin, st.sword);
    const color = st.color || '#9fe8ff';
    const power = 1 + (st.realm || 0) * 0.25;
    const fr = pickFrame(aim, t, st);
    if (st.ghosts) {
      for (const gh of st.ghosts) {
        if (!gh.fr) continue;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = (gh.life / gh.max) * 0.45;
        blit(ctx, tinted(sheet, skinId, color), gh.fr, gh.x, gh.y);
        ctx.restore();
      }
    }
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath(); ctx.ellipse(x, y + FOOT_OFFSET, 17, 5.5, 0, 0, Math.PI * 2); ctx.fill();
    if (st.sectColor && TT.Art && TT.Art.drawSectAura) TT.Art.drawSectAura(ctx, x, y + FOOT_OFFSET, t, st.sectColor, 22);
    const spirit = st.spirit !== false;
    const lv = st.realm || 0;
    const wheelFront = fr.dir === 'up';

    // -------------------------------------------------------------------------
    // HỆ THỐNG 5 LỚP RENDER NHÂN VẬT (Z-ORDER TỪ SAU RA TRƯỚC)
    // -------------------------------------------------------------------------
    // Lớp 1 (Sau cùng - Thần Luân / Halo): xoay tròn chậm (angle += 0.015) có hiệu ứng phát sáng
    // Cánh chiếm chỗ thần luân sau lưng: đã trang bị cánh thì ẩn cả thần luân (daoWheel) lẫn halo.
    const wingsId = st.wingsId || st.wings;
    const hasWings = !!(wingsId && TT.DATA && (TT.DATA.wings || []).some(w => w.id === wingsId));
    const haloId = hasWings ? null : (st.haloId || st.halo);
    let haloDrawn = hasWings; // coi như đã có vật sau lưng để chặn thần luân
    if (haloId && TT.Art && TT.Art.drawHalo) {
      haloDrawn = TT.Art.drawHalo(ctx, x, y - 46, 38, t, haloId, color); // tâm ngang đầu, cao hơn thần luân mặc định một chút
    }
    if (spirit) spiritBack(ctx, x, y, t, st, color, power);
    if (!haloDrawn && spirit && !wheelFront) {
      daoWheel(ctx, x, y, t, st, color, lv, 1);
    }

    // Lớp 2 (Cánh / Tiên Dực): cùng tâm với thần luân (y - 40). Quay lưng thì cánh phủ lên thân (vẽ ở lớp 5).
    const wingOpts = { dir: fr.dir, flip: fr.flip, moving: !!st.moving, dash: !!st.dash };
    const WING_W = 96, WING_Y = y - 40;
    if (hasWings && fr.dir !== 'up' && TT.Art && TT.Art.drawWings) {
      TT.Art.drawWings(ctx, x, WING_Y, WING_W, t, wingsId, wingOpts);
    }

    // Lớp 3 (Thân Thể / Ngoại Trang Hóa Thần): Chuyển đổi giữa Chibi và Pháp Tướng Hóa Thần
    const avatarSkin = st.avatarSkin || st.phapTuong;
    let avatarDrawn = false;
    if (avatarSkin && TT.Art && TT.Art.drawAvatar) {
      avatarDrawn = TT.Art.drawAvatar(ctx, x, y, 92, 114, avatarSkin, t, fr.dir === 'side' && fr.flip < 0);
    }
    if (!avatarDrawn) {
      blit(ctx, sheet, fr, x, y);
      if (st.hurt) {
        ctx.save(); ctx.globalAlpha = 0.45; blit(ctx, tinted(sheet, skinId, '#ffffff'), fr, x, y); ctx.restore();
      }
    } else if (st.hurt) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.45;
      TT.Art.drawAvatar(ctx, x, y, 92, 114, avatarSkin, t, fr.dir === 'side' && fr.flip < 0);
      ctx.restore();
    }

    // Lớp 4 (Tiên/Ma Nhãn): Gắn cặp mắt Tiên/Ma hoặc con mắt thứ 3 phát sáng trên trán
    // Vẽ thủ tục đúng vị trí mắt chibi theo hướng nhìn; quay lưng thì không thấy mắt.
    const eyeE = eyeDef(st.eyeId || st.eyes);
    if (eyeE && !avatarDrawn && fr.dir !== 'up') drawFaceEyes(ctx, x, y, fr, eyeE, t);

    // Lớp 5 (Trước cùng - Vũ Khí, Cánh/Thần Luân nếu quay lưng, Linh khí trước & Danh Hiệu)
    if (hasWings && fr.dir === 'up' && TT.Art && TT.Art.drawWings) {
      TT.Art.drawWings(ctx, x, WING_Y, WING_W, t, wingsId, wingOpts);
    }
    if (!haloDrawn && spirit && wheelFront) {
      daoWheel(ctx, x, y, t, st, color, lv, 0.6);
    }
    if (spirit) spiritFront(ctx, x, y, t, color, power);
    if (st.title) {
      ctx.save();
      ctx.font = 'bold 10px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(5,8,14,0.9)';
      ctx.strokeText(st.title, x, y - 64);
      ctx.fillStyle = st.titleColor || st.sectColor || '#ffd23f';
      ctx.fillText(st.title, x, y - 64);
      ctx.restore();
    }
    return fr;
  }

  /** Vẽ riêng thần luân đạo pháp mặc định với tâm tại (x, y) — dùng cho khung cận cảnh. cast 0..1 bật tia sét. */
  function drawDaoWheel(ctx, x, y, t, color, realm, cast) {
    daoWheel(ctx, x, y + 40, t, { cast: cast || 0 }, color || '#9fe8ff', realm || 0, 1);
  }

  TT.Character = { draw, buildSheet, invalidateSheets, drawEyeIcon, drawDaoWheel, rows, ANIMS, DIRS, FW, FH, PAL: BASE_PAL };
  TT.Art.drawPlayer = draw;
})(window.TT);
