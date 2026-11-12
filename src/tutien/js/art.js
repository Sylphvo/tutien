window.TT = window.TT || {};

/**
 * TT.Art — đồ họa vẽ thủ tục (procedural) phong cách tối, huyền ảo:
 * nền đá rêu, sương mù, ánh sáng điểm, phi kiếm phát sáng, tia sét.
 * Không cần file ảnh ngoài.
 */
(function (TT) {
  'use strict';
  const U = TT.util;

  function canvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    return c;
  }

  function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgba(hex, a) { const [r, g, b] = hexToRgb(hex); return `rgba(${r},${g},${b},${a})`; }

  // Dáng lưỡi kiếm cho skin kiếm (D.swordSkins[].shape).
  const SWORD_SHAPES = {
    jian:  { len: 1,    w: 1,    taper: 0.67, guard: 1,    blunt: false }, // trường kiếm thẳng
    thin:  { len: 1.08, w: 0.72, taper: 0.7,  guard: 0.8,  blunt: false }, // kiếm mảnh
    broad: { len: 1,    w: 1.4,  taper: 0.85, guard: 1.15, blunt: false }, // bản rộng
    heavy: { len: 0.95, w: 1.8,  taper: 0.95, guard: 1.3,  blunt: true },  // trọng kiếm mũi bằng
    solar_flame: { len: 1.08, w: 1.3, taper: 0.62, guard: 1.5, blunt: false }
  };

  function drawSolarFlameSword(ctx, x, y, angle, len, alpha, pal) {
    const blade = len * 1.22, width = len * 0.16;
    const gold = pal.gold || '#d99a25', goldHi = pal.goldHi || '#fff2a6';
    const goldDark = pal.goldDark || '#624018', accent = pal.accent || '#ffb52e';
    const steel = pal.blade || '#201b18', shade = pal.bladeShade || '#62513b';
    const hilt = pal.hilt || '#211b18', gem = pal.gem || '#fff3a0';

    ctx.save();
    ctx.translate(x, y); ctx.rotate(angle);
    ctx.globalAlpha = alpha === undefined ? 1 : alpha;

    // Long asymmetric dark blade with a molten-gold edge and a swept flame fuller.
    const bladeGrad = ctx.createLinearGradient(0, -width, 0, width);
    bladeGrad.addColorStop(0, '#f6df9e');
    bladeGrad.addColorStop(0.13, shade);
    bladeGrad.addColorStop(0.42, '#171411');
    bladeGrad.addColorStop(0.75, steel);
    bladeGrad.addColorStop(1, '#09090a');
    ctx.fillStyle = bladeGrad;
    ctx.strokeStyle = '#17130f'; ctx.lineWidth = Math.max(1.2, len * 0.018);
    ctx.beginPath();
    ctx.moveTo(len * 0.09, -width * 0.18);
    ctx.bezierCurveTo(len * 0.25, -width * 0.32, len * 0.41, -width * 0.29, len * 0.53, -width * 0.19);
    ctx.bezierCurveTo(len * 0.76, -width * 0.13, len * 0.98, -width * 0.09, blade, 0);
    ctx.bezierCurveTo(len * 1.01, width * 0.09, len * 0.88, width * 0.16, len * 0.77, width * 0.21);
    ctx.bezierCurveTo(len * 0.69, width * 0.35, len * 0.57, width * 0.49, len * 0.5, width * 0.33);
    ctx.bezierCurveTo(len * 0.39, width * 0.16, len * 0.27, width * 0.14, len * 0.13, width * 0.08);
    ctx.closePath(); ctx.fill(); ctx.stroke();

    ctx.strokeStyle = goldHi; ctx.lineWidth = Math.max(1.2, len * 0.024);
    ctx.beginPath();
    ctx.moveTo(len * 0.12, width * 0.07);
    ctx.bezierCurveTo(len * 0.28, width * 0.15, len * 0.39, width * 0.39, len * 0.5, width * 0.42);
    ctx.bezierCurveTo(len * 0.63, width * 0.35, len * 0.68, width * 0.18, len * 0.79, width * 0.13);
    ctx.bezierCurveTo(len * 0.94, width * 0.08, len * 1.08, width * 0.04, blade * 0.98, 0);
    ctx.stroke();
    ctx.strokeStyle = accent; ctx.lineWidth = Math.max(1.5, len * 0.043);
    ctx.beginPath();
    ctx.moveTo(len * 0.1, width * 0.03);
    ctx.bezierCurveTo(len * 0.23, width * 0.12, len * 0.31, width * 0.33, len * 0.42, width * 0.3);
    ctx.bezierCurveTo(len * 0.55, width * 0.26, len * 0.57, width * 0.08, len * 0.7, width * 0.06);
    ctx.bezierCurveTo(len * 0.8, width * 0.045, len * 0.91, width * 0.04, len * 0.98, 0);
    ctx.stroke();

    // Broad, hooked dark wings and gold flame sweeps form the reference crossguard.
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const side of [-1, 1]) {
      ctx.fillStyle = side < 0 ? gold : goldHi;
      ctx.beginPath();
      ctx.moveTo(len * 0.08, side * len * 0.12);
      ctx.bezierCurveTo(-len * 0.12, side * len * 0.23, -len * 0.3, side * len * 0.48, -len * 0.52, side * len * 0.49);
      ctx.bezierCurveTo(-len * 0.37, side * len * 0.32, -len * 0.33, side * len * 0.18, -len * 0.1, side * len * 0.12);
      ctx.closePath(); ctx.fill();
    }
    for (const side of [-1, 1]) {
      ctx.fillStyle = '#171411'; ctx.strokeStyle = goldDark; ctx.lineWidth = Math.max(1, len * 0.018);
      ctx.beginPath(); ctx.moveTo(len * 0.12, side * len * 0.1);
      ctx.bezierCurveTo(-len * 0.05, side * len * 0.16, -len * 0.17, side * len * 0.35, -len * 0.38, side * len * 0.4);
      ctx.lineTo(-len * 0.31, side * len * 0.24);
      ctx.bezierCurveTo(-len * 0.22, side * len * 0.06, -len * 0.06, side * len * 0.02, len * 0.12, side * len * 0.1);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = gold; ctx.lineWidth = Math.max(1.2, len * 0.026);
      ctx.beginPath(); ctx.moveTo(-len * 0.31, side * len * 0.24);
      ctx.quadraticCurveTo(-len * 0.18, side * len * 0.12, len * 0.08, side * len * 0.11); ctx.stroke();
    }

    // Dark ring guard, inset sunstone, wrapped grip and pointed pommel.
    ctx.strokeStyle = '#17130f'; ctx.lineWidth = len * 0.115;
    ctx.beginPath(); ctx.arc(0, 0, len * 0.17, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = gold; ctx.lineWidth = len * 0.068;
    ctx.beginPath(); ctx.arc(0, 0, len * 0.17, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = goldHi; ctx.lineWidth = Math.max(1.1, len * 0.014);
    ctx.beginPath(); ctx.arc(0, 0, len * 0.205, -Math.PI * 0.76, Math.PI * 0.76); ctx.stroke();
    ctx.fillStyle = '#21180e';
    ctx.beginPath(); ctx.arc(0, 0, len * 0.12, 0, Math.PI * 2); ctx.fill();
    const orb = ctx.createRadialGradient(-len * 0.035, -len * 0.04, len * 0.015, 0, 0, len * 0.105);
    orb.addColorStop(0, '#ffffff'); orb.addColorStop(0.28, goldHi); orb.addColorStop(0.68, gem); orb.addColorStop(1, goldDark);
    ctx.fillStyle = orb;
    ctx.beginPath(); ctx.arc(0, 0, len * 0.095, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff8c7'; ctx.beginPath();
    ctx.moveTo(-len * 0.055, -len * 0.018); ctx.lineTo(-len * 0.018, -len * 0.055);
    ctx.lineTo(len * 0.055, len * 0.018); ctx.lineTo(len * 0.018, len * 0.055);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = hilt;
    ctx.beginPath();
    ctx.moveTo(-len * 0.12, -len * 0.045); ctx.lineTo(-len * 0.77, -len * 0.034);
    ctx.lineTo(-len * 0.91, 0); ctx.lineTo(-len * 0.77, len * 0.034);
    ctx.lineTo(-len * 0.12, len * 0.045); ctx.closePath();
    ctx.fill(); ctx.strokeStyle = '#17130f'; ctx.lineWidth = len * 0.025; ctx.stroke();
    ctx.strokeStyle = gold; ctx.lineWidth = len * 0.035;
    for (let i = 0; i < 4; i++) {
      const hx = -len * (0.25 + i * 0.09);
      ctx.beginPath(); ctx.moveTo(hx, -len * 0.04); ctx.lineTo(hx - len * 0.045, len * 0.04); ctx.stroke();
    }
    ctx.fillStyle = gold;
    ctx.beginPath(); ctx.moveTo(-len * 0.88, -len * 0.015); ctx.lineTo(-len, 0);
    ctx.lineTo(-len * 0.88, len * 0.015); ctx.closePath(); ctx.fill();

    // Independent ember ornaments and long flame wisps around the hilt.
    for (const side of [-1, 1]) {
      ctx.fillStyle = '#211b15'; ctx.strokeStyle = goldDark; ctx.lineWidth = Math.max(1, len * 0.014);
      ctx.beginPath();
      ctx.moveTo(len * 0.12, side * len * 0.32);
      ctx.quadraticCurveTo(len * 0.19, side * len * 0.2, len * 0.24, side * len * 0.29);
      ctx.lineTo(len * 0.3, side * len * 0.41);
      ctx.quadraticCurveTo(len * 0.22, side * len * 0.37, len * 0.12, side * len * 0.32);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = side < 0 ? goldHi : accent; ctx.lineWidth = Math.max(1.4, len * 0.032);
      ctx.beginPath(); ctx.moveTo(-len * 0.08, side * len * 0.2);
      ctx.bezierCurveTo(-len * 0.32, side * len * 0.45, -len * 0.08, side * len * 0.64, -len * 0.2, side * len * 0.79);
      ctx.stroke();
    }
    ctx.strokeStyle = goldHi; ctx.lineWidth = Math.max(1.2, len * 0.026);
    ctx.beginPath(); ctx.moveTo(len * 0.12, -len * 0.2);
    ctx.quadraticCurveTo(len * 0.37, -len * 0.43, len * 0.3, -len * 0.63); ctx.stroke();
    ctx.strokeStyle = accent; ctx.lineWidth = Math.max(1, len * 0.018);
    ctx.beginPath(); ctx.moveTo(-len * 0.08, len * 0.23);
    ctx.quadraticCurveTo(-len * 0.28, len * 0.38, -len * 0.15, len * 0.55); ctx.stroke();
    ctx.restore();
  }

  const Art = {
    canvas, rgba,

    /** Quầng sáng cộng (gọi trong chế độ 'lighter'). */
    glow(ctx, x, y, r, color, a) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, rgba(color, a));
      g.addColorStop(1, rgba(color, 0));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    },

    /**
     * Sinh texture nền. theme: 'bicanh' | 'dongphu' | 'loidai'
     */
    makeGround(sizePx, theme, seed) {
      const c = canvas(sizePx, sizePx);
      const g = c.getContext('2d');
      const rnd = U.seeded(seed);
      const pal = {
        bicanh: { base: '#363d4a', a: '#414b58', b: '#2c323e', moss: '#35524e', crack: '#1a1e26' },
        dongphu: { base: '#2e3240', a: '#3a4052', b: '#252834', moss: '#2e3e50', crack: '#171a22' },
        loidai: { base: '#2a2940', a: '#373452', b: '#201f32', moss: '#3a3260', crack: '#141322' }
      }[theme];
      g.fillStyle = pal.base; g.fillRect(0, 0, sizePx, sizePx);
      // mảng màu loang
      for (let i = 0; i < sizePx * sizePx / 900; i++) {
        const x = rnd() * sizePx, y = rnd() * sizePx, r = 20 + rnd() * 90;
        const grd = g.createRadialGradient(x, y, 0, x, y, r);
        const col = rnd() < 0.5 ? pal.a : (rnd() < 0.6 ? pal.b : pal.moss);
        grd.addColorStop(0, rgba(col, 0.55)); grd.addColorStop(1, rgba(col, 0));
        g.fillStyle = grd; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
      }
      // đá lát (phiến đá)
      const tile = theme === 'bicanh' ? 0 : 48;
      if (tile) {
        g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 2;
        for (let y = 0; y < sizePx; y += tile) {
          const off = (y / tile) % 2 ? tile / 2 : 0;
          for (let x = -tile; x < sizePx; x += tile) {
            g.strokeRect(x + off + rnd() * 2, y + rnd() * 2, tile - 2, tile - 2);
            if (rnd() < 0.15) { g.fillStyle = 'rgba(255,255,255,0.025)'; g.fillRect(x + off, y, tile - 2, tile - 2); }
          }
        }
      }
      // vết nứt
      g.strokeStyle = pal.crack; g.lineWidth = 1.2;
      for (let i = 0; i < sizePx / 40; i++) {
        let x = rnd() * sizePx, y = rnd() * sizePx;
        g.beginPath(); g.moveTo(x, y);
        for (let k = 0; k < 5; k++) { x += (rnd() - 0.5) * 40; y += (rnd() - 0.5) * 40; g.lineTo(x, y); }
        g.stroke();
      }
      // cỏ / sỏi lấm tấm
      for (let i = 0; i < sizePx * sizePx / 220; i++) {
        const x = rnd() * sizePx, y = rnd() * sizePx;
        if (theme === 'bicanh' && rnd() < 0.6) {
          g.strokeStyle = rnd() < 0.5 ? 'rgba(60,110,80,0.35)' : 'rgba(40,80,70,0.35)';
          g.beginPath(); g.moveTo(x, y); g.lineTo(x + (rnd() - 0.5) * 3, y - 3 - rnd() * 4); g.stroke();
        } else {
          g.fillStyle = `rgba(${150 + rnd() * 60},${150 + rnd() * 60},${170 + rnd() * 60},${0.03 + rnd() * 0.05})`;
          g.fillRect(x, y, 1 + rnd() * 2, 1 + rnd() * 2);
        }
      }
      return c;
    },

    /** Vòng trận pháp có phù văn (dùng ở Lôi Đài và Động Phủ). */
    drawFormation(ctx, x, y, r, t, color, alpha) {
      ctx.save();
      ctx.translate(x, y);
      ctx.strokeStyle = rgba(color, alpha);
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(0, 0, r * 0.93, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2); ctx.stroke();
      // bát quái / ngũ giác
      ctx.rotate(t * 0.05);
      ctx.beginPath();
      for (let i = 0; i <= 5; i++) {
        const a = (i * 2 * Math.PI * 2) / 5 - Math.PI / 2;
        const px = Math.cos(a) * r * 0.9, py = Math.sin(a) * r * 0.9;
        i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.stroke();
      // phù văn
      ctx.font = `${Math.max(10, r * 0.06)}px serif`;
      ctx.fillStyle = rgba(color, alpha * 1.2);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const runes = '乾坤震巽坎離艮兌金木水火土雷';
      const n = 28;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        ctx.save();
        ctx.rotate(a); ctx.translate(0, -r * 0.965);
        ctx.fillText(runes[i % runes.length], 0, 0);
        ctx.restore();
      }
      ctx.restore();
    },

    /**
     * Thông số dáng lưỡi kiếm (tỉ lệ so với kiếm chuẩn), dùng chung cho kiếm cầm tay và phi kiếm.
     * len: độ dài, w: bề rộng, taper: độ thon về mũi, guard: cỡ hộ thủ, blunt: mũi bằng.
     */
    swordShape(id) {
      return SWORD_SHAPES[id] || SWORD_SHAPES.jian;
    },

    /** Phi kiếm phát sáng. skin (tuỳ chọn): phần tử D.swordSkins để đổi dáng và màu. */
    drawSword(ctx, x, y, angle, len, color, alpha, skin) {
      if (skin && skin.shape === 'solar_flame') {
        drawSolarFlameSword(ctx, x, y, angle, len, alpha, skin.pal || {});
        return;
      }
      const S = Art.swordShape(skin && skin.shape);
      const pal = (skin && skin.pal) || {};
      const blade = pal.blade || '#eaf6ff';
      const bladeShade = pal.bladeShade || '#6fc4e8';
      const guard = pal.gold || color || '#ffd23f';
      const hilt = pal.hilt || '#3a2a1a';
      const accent = pal.accent || guard;
      const gem = pal.gem || '#ffffff';
      const baseLen = len * (0.7 + S.len * 0.42);
      const halfW = len * 0.06 * S.w;
      const lowW = len * 0.04 * S.w;
      const rib = len * 0.12;
      const gripLen = len * 0.22;

      ctx.save();
      ctx.translate(x, y); ctx.rotate(angle);
      ctx.globalAlpha = alpha === undefined ? 1 : alpha;

      // bóng / phản quang
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.beginPath();
      ctx.moveTo(baseLen * 0.1, 0);
      ctx.lineTo(baseLen * 0.75, -halfW * 1.1);
      ctx.lineTo(baseLen * 0.75, halfW * 1.1);
      ctx.closePath();
      ctx.fill();

      // thân lưỡi: hình dáng vừa thô vừa thanh thoát
      const bladeGrad = ctx.createLinearGradient(0, -halfW, 0, halfW);
      bladeGrad.addColorStop(0, blade);
      bladeGrad.addColorStop(0.35, '#ffffff');
      bladeGrad.addColorStop(0.7, bladeShade);
      bladeGrad.addColorStop(1, blade);
      ctx.fillStyle = bladeGrad;
      ctx.beginPath();
      ctx.moveTo(baseLen * 0.92, 0);
      ctx.lineTo(baseLen * 0.68, -halfW);
      ctx.lineTo(baseLen * 0.08, -lowW);
      ctx.lineTo(-baseLen * 0.18, -lowW * 0.9);
      ctx.lineTo(-baseLen * 0.18, lowW * 0.9);
      ctx.lineTo(baseLen * 0.08, lowW);
      ctx.lineTo(baseLen * 0.68, halfW);
      ctx.closePath();
      ctx.fill();

      // rãnh lưỡi / tỉa viền sáng
      ctx.strokeStyle = rgba(accent, 0.8);
      ctx.lineWidth = Math.max(1, len * 0.012);
      ctx.beginPath();
      ctx.moveTo(baseLen * 0.88, 0);
      ctx.lineTo(baseLen * 0.2, 0);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.beginPath();
      ctx.moveTo(baseLen * 0.7, -lowW * 0.45);
      ctx.lineTo(baseLen * 0.15, -lowW * 0.25);
      ctx.moveTo(baseLen * 0.7, lowW * 0.45);
      ctx.lineTo(baseLen * 0.15, lowW * 0.25);
      ctx.stroke();

      // họa tiết dọc / sợi năng lượng
      ctx.strokeStyle = rgba(gem, 0.55);
      ctx.lineWidth = Math.max(1, len * 0.009);
      for (let i = 1; i <= 3; i++) {
        const x = baseLen * (0.35 + i * 0.14);
        const w = halfW * (0.34 - i * 0.04);
        ctx.beginPath();
        ctx.moveTo(x, -w); ctx.lineTo(x + rib * 0.35, 0); ctx.lineTo(x, w);
        ctx.stroke();
      }

      // chỗ gắn vào chuôi
      ctx.fillStyle = guard;
      ctx.fillRect(-len * 0.08, -len * 0.24 * S.guard, len * 0.16, len * 0.48 * S.guard);
      ctx.fillStyle = rgba(guard, 0.8);
      ctx.fillRect(-len * 0.12, -len * 0.18 * S.guard, len * 0.24, len * 0.36 * S.guard);
      // trang sức bên hông
      ctx.fillStyle = gem;
      for (const dx of [-len * 0.02, len * 0.02]) {
        ctx.beginPath();
        ctx.moveTo(dx, -len * 0.14); ctx.lineTo(dx + len * 0.03, 0); ctx.lineTo(dx, len * 0.14); ctx.lineTo(dx - len * 0.03, 0); ctx.closePath();
        ctx.fill();
      }

      // chuôi + cán
      ctx.fillStyle = hilt;
      ctx.fillRect(-len * 0.22, -len * 0.045, len * 0.36, len * 0.09);
      ctx.fillStyle = rgba(guard, 0.65);
      ctx.fillRect(-len * 0.26, -len * 0.075, len * 0.06, len * 0.15);
      ctx.fillStyle = gem;
      ctx.beginPath(); ctx.arc(-len * 0.23, 0, len * 0.04, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(len * 0.12, 0, len * 0.035, 0, Math.PI * 2); ctx.fill();

      // mấu đuôi và gót
      ctx.fillStyle = guard;
      ctx.fillRect(len * 0.18, -len * 0.06, len * 0.12, len * 0.12);
      ctx.fillStyle = pal.goldDark || pal.gold || '#8c6a2d';
      ctx.fillRect(len * 0.26, -len * 0.04, len * 0.08, len * 0.08);

      ctx.restore();
    },

    /** Yêu thú. */
    drawEnemy(ctx, e, t, ppm) {
      const def = e.def;
      const r = def.radiusM * ppm;
      ctx.save();
      ctx.translate(e.x, e.y);
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.beginPath(); ctx.ellipse(0, r * 0.75, r * 1.0, r * 0.35, 0, 0, Math.PI * 2); ctx.fill();
      const flash = e.hitFlash > 0;
      const body = flash ? '#ffffff' : def.color;
      const face = e.vx >= 0 ? 1 : -1;
      const key = e.type;
      if (key === 'HAC_LANG' || key === 'YEU_VUONG') {
        const run = Math.sin(t * 16 + e.seed) * r * 0.15;
        ctx.fillStyle = body;
        // thân
        ctx.beginPath(); ctx.ellipse(0, 0, r * 1.05, r * 0.6, 0, 0, Math.PI * 2); ctx.fill();
        // chân
        ctx.fillRect(-r * 0.7, r * 0.3 + run, r * 0.2, r * 0.4);
        ctx.fillRect(r * 0.5, r * 0.3 - run, r * 0.2, r * 0.4);
        // đầu
        ctx.beginPath(); ctx.ellipse(face * r * 0.95, -r * 0.3, r * 0.48, r * 0.38, 0, 0, Math.PI * 2); ctx.fill();
        // tai
        ctx.beginPath();
        ctx.moveTo(face * r * 0.75, -r * 0.6); ctx.lineTo(face * r * 0.85, -r * 1.0); ctx.lineTo(face * r * 1.0, -r * 0.6); ctx.fill();
        // đuôi
        ctx.strokeStyle = body; ctx.lineWidth = r * 0.22;
        ctx.beginPath(); ctx.moveTo(-face * r * 0.9, -r * 0.1);
        ctx.quadraticCurveTo(-face * r * 1.4, -r * 0.6 + run, -face * r * 1.6, -r * 0.2); ctx.stroke();
        // gai lưng (boss)
        if (def.boss) {
          ctx.fillStyle = '#2a0b10';
          for (let i = -2; i <= 2; i++) {
            ctx.beginPath(); ctx.moveTo(i * r * 0.3 - r * 0.1, -r * 0.5); ctx.lineTo(i * r * 0.3, -r * 0.95); ctx.lineTo(i * r * 0.3 + r * 0.1, -r * 0.5); ctx.fill();
          }
        }
        this.eyes(ctx, face * r * 1.1, -r * 0.35, r * 0.09, def.eye, face);
      } else if (key === 'DOC_TRUNG') {
        ctx.fillStyle = body;
        for (let i = 0; i < 4; i++) {
          const wob = Math.sin(t * 12 + i + e.seed) * r * 0.15;
          ctx.beginPath(); ctx.arc(-face * i * r * 0.55, wob, r * (0.65 - i * 0.1), 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = flash ? '#fff' : '#8fff4d';
        ctx.globalAlpha = 0.5;
        ctx.beginPath(); ctx.arc(0, -r * 0.2, r * 0.25, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
        this.eyes(ctx, face * r * 0.35, -r * 0.15, r * 0.12, def.eye, face);
      } else if (key === 'QUY_HOA') {
        const fl = Math.sin(t * 9 + e.seed);
        ctx.fillStyle = flash ? '#fff' : rgba('#ff7a2a', 0.85);
        ctx.beginPath();
        ctx.moveTo(-r * 0.7, r * 0.2);
        ctx.quadraticCurveTo(-r * 0.6, -r * 1.2, 0, -r * 1.6 - fl * r * 0.2);
        ctx.quadraticCurveTo(r * 0.6, -r * 1.2, r * 0.7, r * 0.2);
        ctx.quadraticCurveTo(0, r * 0.8, -r * 0.7, r * 0.2);
        ctx.fill();
        ctx.fillStyle = flash ? '#fff' : '#3a0f2a';
        ctx.beginPath(); ctx.arc(0, -r * 0.2, r * 0.55, 0, Math.PI * 2); ctx.fill();
        this.eyes(ctx, 0, -r * 0.3, r * 0.12, def.eye, 1);
      } else {
        // Thạch Ma
        ctx.fillStyle = body;
        ctx.beginPath();
        for (let i = 0; i < 7; i++) {
          const a = (i / 7) * Math.PI * 2;
          const rr = r * (0.85 + ((i * 37 + e.seed * 13) % 7) / 30);
          i ? ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr * 0.9) : ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr * 0.9);
        }
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = flash ? '#fff' : rgba('#5ff0ff', 0.6); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-r * 0.5, -r * 0.2); ctx.lineTo(-r * 0.1, r * 0.1); ctx.lineTo(r * 0.3, -r * 0.3); ctx.stroke();
        // nắm đấm
        const sw = Math.sin(t * 5 + e.seed) * r * 0.2;
        ctx.fillStyle = body;
        ctx.beginPath(); ctx.arc(-r * 1.0, r * 0.2 + sw, r * 0.35, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(r * 1.0, r * 0.2 - sw, r * 0.35, 0, Math.PI * 2); ctx.fill();
        this.eyes(ctx, face * r * 0.2, -r * 0.45, r * 0.11, def.eye, face);
      }
      ctx.restore();
      // thanh máu
      if (e.hp < e.maxHp && !def.boss) {
        const w = Math.max(24, r * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(e.x - w / 2, e.y - r * 1.6, w, 4);
        ctx.fillStyle = '#e74c3c'; ctx.fillRect(e.x - w / 2, e.y - r * 1.6, w * (e.hp / e.maxHp), 4);
      }
    },

    eyes(ctx, x, y, r, color, face) {
      ctx.fillStyle = color;
      ctx.shadowColor = color; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(x - face * r * 1.6, y, r, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + face * r * 0.6, y, r, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    },

    /** Vật trang trí. */
    drawProp(ctx, p, t) {
      ctx.save();
      ctx.translate(p.x, p.y);
      const s = p.size;
      if (p.kind === 'tree') {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath(); ctx.ellipse(0, 0, s * 0.6, s * 0.22, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#1b130e'; ctx.fillRect(-s * 0.07, -s * 0.5, s * 0.14, s * 0.5);
        const sw = Math.sin(t * 0.8 + p.seed) * s * 0.03;
        const cols = ['#1f3c36', '#27493f', '#30584b'];
        for (let i = 0; i < 3; i++) {
          ctx.fillStyle = cols[i];
          ctx.beginPath();
          ctx.moveTo(-s * (0.6 - i * 0.12), -s * (0.35 + i * 0.35));
          ctx.lineTo(sw * (i + 1), -s * (1.0 + i * 0.35));
          ctx.lineTo(s * (0.6 - i * 0.12), -s * (0.35 + i * 0.35));
          ctx.closePath(); ctx.fill();
        }
      } else if (p.kind === 'rock') {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath(); ctx.ellipse(0, s * 0.15, s * 0.6, s * 0.25, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#3a3f4a';
        ctx.beginPath();
        ctx.moveTo(-s * 0.5, s * 0.1); ctx.lineTo(-s * 0.4, -s * 0.3); ctx.lineTo(-s * 0.05, -s * 0.5);
        ctx.lineTo(s * 0.4, -s * 0.3); ctx.lineTo(s * 0.5, s * 0.1); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#4b515e';
        ctx.beginPath(); ctx.moveTo(-s * 0.4, -s * 0.3); ctx.lineTo(-s * 0.05, -s * 0.5); ctx.lineTo(s * 0.1, -s * 0.1); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#1d3a2c';
        ctx.fillRect(-s * 0.3, -s * 0.38, s * 0.25, s * 0.06);
      } else if (p.kind === 'pillar') {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath(); ctx.ellipse(0, 0, s * 0.35, s * 0.14, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#2a2a33'; ctx.fillRect(-s * 0.2, -s * 1.4, s * 0.4, s * 1.4);
        ctx.fillStyle = '#383844'; ctx.fillRect(-s * 0.28, -s * 1.5, s * 0.56, s * 0.14);
        ctx.fillStyle = '#383844'; ctx.fillRect(-s * 0.26, -s * 0.12, s * 0.52, s * 0.12);
        ctx.fillStyle = rgba(p.color || '#58e0ff', 0.55 + Math.sin(t * 2 + p.seed) * 0.25);
        ctx.font = `${s * 0.25}px serif`; ctx.textAlign = 'center';
        ctx.fillText('符', 0, -s * 0.7);
      } else if (p.kind === 'lantern') {
        ctx.fillStyle = '#1a1a1f'; ctx.fillRect(-2, -s, 4, s);
        ctx.fillStyle = '#7a1e1e'; ctx.fillRect(-s * 0.18, -s * 1.15, s * 0.36, s * 0.3);
        ctx.fillStyle = rgba('#ffb347', 0.9); ctx.fillRect(-s * 0.12, -s * 1.1, s * 0.24, s * 0.2);
      } else if (p.kind === 'crystal') {
        const pulse = 0.6 + Math.sin(t * 2.5 + p.seed) * 0.3;
        ctx.fillStyle = rgba(p.color, 0.25);
        ctx.beginPath(); ctx.ellipse(0, 0, s * 0.5, s * 0.18, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = rgba(p.color, pulse);
        for (let i = -1; i <= 1; i++) {
          ctx.beginPath(); ctx.moveTo(i * s * 0.18 - s * 0.08, 0); ctx.lineTo(i * s * 0.18, -s * (0.6 + (i === 0 ? 0.35 : 0)));
          ctx.lineTo(i * s * 0.18 + s * 0.08, 0); ctx.fill();
        }
      } else if (p.kind === 'portal') {
        ctx.rotate(t * 0.6);
        for (let i = 0; i < 3; i++) {
          ctx.strokeStyle = rgba(p.color, 0.7 - i * 0.2); ctx.lineWidth = 4 - i;
          ctx.beginPath(); ctx.ellipse(0, 0, s * (0.9 - i * 0.2), s * (0.9 - i * 0.2) * 0.55, i, 0, Math.PI * 1.6); ctx.stroke();
        }
      } else if (p.kind === 'altar') {
        ctx.fillStyle = '#1e1c2c'; ctx.fillRect(-s * 0.6, -s * 0.2, s * 1.2, s * 0.4);
        ctx.fillStyle = '#2b2840'; ctx.fillRect(-s * 0.45, -s * 0.45, s * 0.9, s * 0.3);
        ctx.fillStyle = rgba('#b48cff', 0.6 + Math.sin(t * 3) * 0.3);
        ctx.font = `${s * 0.35}px serif`; ctx.textAlign = 'center';
        ctx.fillText('雷', 0, -s * 0.2);
      } else if (p.kind === 'cauldron') {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath(); ctx.ellipse(0, s * 0.3, s * 0.6, s * 0.2, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#3b2c1a';
        ctx.beginPath(); ctx.arc(0, 0, s * 0.45, 0, Math.PI); ctx.fill();
        ctx.fillRect(-s * 0.5, -s * 0.08, s * 1.0, s * 0.1);
        ctx.fillStyle = rgba('#ff8a3c', 0.6 + Math.sin(t * 5) * 0.2);
        ctx.beginPath(); ctx.ellipse(0, -s * 0.03, s * 0.4, s * 0.08, 0, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    },

    /** Tia sét gấp khúc + nhánh. Vẽ trong chế độ 'lighter'. */
    drawLightning(ctx, x1, y1, x2, y2, width, color, seed) {
      const rnd = U.seeded(seed);
      const pts = [[x1, y1]];
      const n = 14;
      for (let i = 1; i < n; i++) {
        const k = i / n;
        pts.push([U.lerp(x1, x2, k) + (rnd() - 0.5) * 60, U.lerp(y1, y2, k) + (rnd() - 0.5) * 12]);
      }
      pts.push([x2, y2]);
      const stroke = (w, c) => {
        ctx.strokeStyle = c; ctx.lineWidth = w;
        ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
        for (const p of pts) ctx.lineTo(p[0], p[1]);
        ctx.stroke();
      };
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      stroke(width * 4, rgba(color, 0.15));
      stroke(width * 2, rgba(color, 0.45));
      stroke(width * 0.8, 'rgba(255,255,255,0.95)');
      // nhánh
      for (let b = 0; b < 4; b++) {
        const i = 3 + Math.floor(rnd() * (n - 5));
        let [bx, by] = pts[i];
        ctx.strokeStyle = rgba(color, 0.6); ctx.lineWidth = width * 0.6;
        ctx.beginPath(); ctx.moveTo(bx, by);
        for (let k = 0; k < 4; k++) { bx += (rnd() - 0.5) * 50; by += 15 + rnd() * 25; ctx.lineTo(bx, by); }
        ctx.stroke();
      }
    }
  };

  // ---------- Icon vật phẩm cho UI (cache dataURL) ----------
  const iconCache = {};
  Art.icon = function (kind, color, sub) {
    const key = kind + color + (sub || '');
    if (iconCache[key]) return iconCache[key];
    const c = canvas(48, 48);
    const g = c.getContext('2d');
    g.translate(24, 24);
    const glow = g.createRadialGradient(0, 0, 0, 0, 0, 24);
    glow.addColorStop(0, rgba(color, 0.35)); glow.addColorStop(1, rgba(color, 0));
    g.fillStyle = glow; g.fillRect(-24, -24, 48, 48);
    g.lineWidth = 2;
    if (kind === 'Weapon') {
      Art.drawSword(g, 0, 0, -Math.PI / 4, 44, color, 1);
    } else if (kind === 'Armor') {
      g.fillStyle = '#2a3348'; g.strokeStyle = color;
      g.beginPath(); g.moveTo(-14, -12); g.lineTo(-6, -16); g.lineTo(0, -10); g.lineTo(6, -16); g.lineTo(14, -12);
      g.lineTo(18, 0); g.lineTo(12, 2); g.lineTo(12, 16); g.lineTo(-12, 16); g.lineTo(-12, 2); g.lineTo(-18, 0); g.closePath();
      g.fill(); g.stroke();
      g.beginPath(); g.arc(0, 2, 5, 0, Math.PI * 2); g.stroke();
    } else if (kind === 'Ring') {
      g.strokeStyle = '#d4b06a'; g.lineWidth = 4;
      g.beginPath(); g.arc(0, 4, 11, 0, Math.PI * 2); g.stroke();
      g.fillStyle = color; g.beginPath(); g.moveTo(0, -14); g.lineTo(6, -7); g.lineTo(0, -1); g.lineTo(-6, -7); g.closePath(); g.fill();
    } else if (kind === 'Boots') {
      g.fillStyle = '#3a2f2a'; g.strokeStyle = color;
      g.beginPath(); g.moveTo(-8, -16); g.lineTo(4, -16); g.lineTo(4, 6); g.lineTo(16, 10); g.lineTo(16, 16); g.lineTo(-8, 16); g.closePath();
      g.fill(); g.stroke();
      g.beginPath(); g.moveTo(-8, -6); g.lineTo(4, -6); g.stroke();
    } else if (kind === 'Accessory') {
      g.strokeStyle = '#c8b28a'; g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(0, -20); g.lineTo(0, -12); g.stroke();
      g.fillStyle = color; g.strokeStyle = 'rgba(255,255,255,0.6)';
      g.beginPath(); g.arc(0, 0, 12, 0, Math.PI * 2); g.fill(); g.stroke();
      g.fillStyle = 'rgba(0,0,0,0.4)'; g.beginPath(); g.arc(0, 0, 4, 0, Math.PI * 2); g.fill();
      g.strokeStyle = '#c8b28a'; g.beginPath(); g.moveTo(-3, 12); g.lineTo(-5, 22); g.moveTo(3, 12); g.lineTo(5, 22); g.stroke();
    } else if (kind === 'pill') {
      g.fillStyle = color; g.beginPath(); g.arc(0, 0, 10, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.5)'; g.beginPath(); g.arc(-3, -4, 3.5, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(0,0,0,0.3)'; g.beginPath(); g.arc(0, 0, 10, 0, Math.PI * 2); g.stroke();
    } else if (kind === 'talisman') {
      g.fillStyle = '#e8cf6a'; g.fillRect(-9, -18, 18, 36);
      g.fillStyle = '#b0261e'; g.font = '16px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('雷', 0, -4);
      g.fillRect(-6, 10, 12, 2);
    } else if (kind === 'shell') {
      g.fillStyle = color; g.beginPath(); g.ellipse(0, 0, 16, 12, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = '#1b2a33';
      for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(i * 8, -11); g.lineTo(i * 8, 11); g.stroke(); }
      g.beginPath(); g.moveTo(-15, 0); g.lineTo(15, 0); g.stroke();
    } else if (kind === 'herb') {
      g.strokeStyle = '#2f7d4a'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(0, 18); g.lineTo(0, -6); g.stroke();
      g.fillStyle = color;
      for (const a of [-0.8, 0.8, -0.3, 0.3]) { g.beginPath(); g.ellipse(Math.sin(a) * 9, -4 + Math.abs(a) * 10, 4, 9, a, 0, Math.PI * 2); g.fill(); }
    } else if (kind === 'ore') {
      g.fillStyle = color; g.strokeStyle = 'rgba(255,255,255,0.5)';
      g.beginPath(); g.moveTo(-14, 8); g.lineTo(-8, -10); g.lineTo(6, -14); g.lineTo(15, -2); g.lineTo(10, 12); g.lineTo(-6, 14); g.closePath(); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(-8, -10); g.lineTo(0, 0); g.lineTo(15, -2); g.moveTo(0, 0); g.lineTo(-6, 14); g.stroke();
    } else if (kind === 'orb') {
      const gg = g.createRadialGradient(-4, -4, 1, 0, 0, 13);
      gg.addColorStop(0, '#fff'); gg.addColorStop(0.3, color); gg.addColorStop(1, '#200');
      g.fillStyle = gg; g.beginPath(); g.arc(0, 0, 13, 0, Math.PI * 2); g.fill();
    }
    if (sub === 'unid') {
      g.fillStyle = 'rgba(10,10,20,0.6)'; g.fillRect(-24, -24, 48, 48);
      g.fillStyle = '#fff'; g.font = 'bold 22px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('?', 0, 0);
    }
    return (iconCache[key] = c.toDataURL());
  };

  TT.Art = Art;
})(window.TT);
