window.TT = window.TT || {};

/**
 * TT.Env — môi trường vẽ theo nét tranh tay (viền mực mảnh, tô chuyển sắc, chạm vàng, ngọc bích):
 *  - Công trình Tông Môn: Chính Điện, Tàng Kinh Các, Sơn Môn, Kiếm Các, Đan Phòng, Lôi Đài.
 *  - Đạo cụ trang trí: thạch đăng, thạch sư, lư hương, tùng, đào, trúc, lan can, cờ phướn, ao sen...
 *  - Đạo cụ 3 vùng Bí Cảnh: Linh Mộc Lâm, Hỏa Diệm Cốc, Huyền Băng Động.
 *  - Vật phẩm thu thập: linh thảo, khoáng mạch, bảo rương, linh tuyền.
 * Mỗi đạo cụ được vẽ sẵn 1 lần vào canvas cache; phần động (lửa, khói, cờ, gợn nước) vẽ lúc chạy.
 * Toạ độ trong hàm vẽ: gốc (0,0) = điểm giữa chân đạo cụ trên mặt đất, trục y âm hướng lên.
 */
(function (TT) {
  'use strict';
  const U = TT.util;
  const LINE = '#16201f';
  const GOLD = '#e9b44c', GOLD_HI = '#ffe39a', GOLD_DK = '#9a6a1e';
  const STONE = { hi: '#c3cbc4', mid: '#8f9a93', dark: '#55615b' };
  const JADE_STONE = { hi: '#a6c9b9', mid: '#6f9a8a', dark: '#3a5f52' };
  const ROOF = {
    teal: { hi: '#64aa9e', mid: '#2f6f68', dark: '#143633' },
    gold: { hi: '#ffe08a', mid: '#d29a2e', dark: '#6e4410' },
    slate: { hi: '#7889a0', mid: '#3d4c60', dark: '#1b2330' }
  };
  const PLAQUE_FONT = '"KaiTi","STKaiti","SimSun","Songti SC",serif';

  // ------------------------------------------------------------------ bút vẽ
  function lin(g, x0, y0, x1, y1, stops) {
    const gr = g.createLinearGradient(x0, y0, x1, y1);
    for (const [o, c] of stops) gr.addColorStop(o, c);
    return gr;
  }
  /** Tô hình + viền mực. path(g) tạo đường dẫn. */
  function ink(g, path, fill, lw) {
    g.beginPath(); path(g);
    g.fillStyle = fill; g.fill();
    if (lw !== 0) { g.lineWidth = lw || 2; g.strokeStyle = LINE; g.stroke(); }
  }
  function stroke(g, pts, color, lw) {
    g.strokeStyle = color; g.lineWidth = lw;
    g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
    g.stroke();
  }
  function dot(g, x, y, r, color) { g.fillStyle = color; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
  function stoneFill(g, y0, y1, st) { st = st || STONE; return lin(g, 0, y0, 0, y1, [[0, st.hi], [0.35, st.mid], [1, st.dark]]); }
  function rgba(hex, a) { return TT.Art.rgba(hex, a); }

  // ------------------------------------------------------------------ kiến trúc
  /** Đường viền mái cong vểnh đầu đao. */
  function roofPath(g, cx, baseY, w, h) {
    const L = cx - w / 2, R = cx + w / 2, top = baseY - h, e = Math.min(26, w * 0.08);
    g.moveTo(L - e * 0.3, baseY - e);
    g.quadraticCurveTo(L + w * 0.1, baseY - 2, L + w * 0.2, baseY - h * 0.4);
    g.quadraticCurveTo(L + w * 0.27, top + h * 0.12, L + w * 0.3, top);
    g.lineTo(R - w * 0.3, top);
    g.quadraticCurveTo(R - w * 0.27, top + h * 0.12, R - w * 0.2, baseY - h * 0.4);
    g.quadraticCurveTo(R - w * 0.1, baseY - 2, R + e * 0.3, baseY - e);
    g.quadraticCurveTo(cx, baseY + 10, L - e * 0.3, baseY - e);
    g.closePath();
  }

  /** Mái ngói lưu ly: hàng ngói, bờ nóc, si vẫn hai đầu, ngọc minh châu giữa nóc. */
  function roof(g, cx, baseY, w, h, pal) {
    pal = pal || ROOF.teal;
    const top = baseY - h, e = Math.min(26, w * 0.08);
    g.beginPath(); roofPath(g, cx, baseY, w, h);
    g.fillStyle = lin(g, 0, top, 0, baseY, [[0, pal.hi], [0.5, pal.mid], [1, pal.dark]]); g.fill();
    g.save(); g.beginPath(); roofPath(g, cx, baseY, w, h); g.clip();
    for (let x = cx - w / 2 - 20; x < cx + w / 2 + 20; x += 9) {
      stroke(g, [[x, top], [x + (x - cx) * 0.1, baseY + 12]], rgba(pal.dark, 0.6), 2.2);
      stroke(g, [[x + 3, top], [x + 3 + (x - cx) * 0.1, baseY + 12]], rgba(pal.hi, 0.25), 1);
    }
    g.fillStyle = 'rgba(0,0,0,0.28)'; g.fillRect(cx - w / 2 - 40, baseY - 9, w + 80, 24);
    g.restore();
    g.beginPath(); roofPath(g, cx, baseY, w, h); g.strokeStyle = LINE; g.lineWidth = 2; g.stroke();
    g.beginPath(); g.moveTo(cx - w / 2 - e * 0.3, baseY - e); g.quadraticCurveTo(cx, baseY + 10, cx + w / 2 + e * 0.3, baseY - e);
    g.strokeStyle = GOLD; g.lineWidth = 1.6; g.stroke();
    // bờ nóc
    ink(g, c => c.rect(cx - w * 0.3 - 4, top - 7, w * 0.6 + 8, 9), pal.dark, 1.6);
    stroke(g, [[cx - w * 0.3 - 2, top - 6], [cx + w * 0.3 + 2, top - 6]], rgba(pal.hi, 0.6), 1);
    for (const s of [-1, 1]) {
      const x = cx + s * (w * 0.3 + 2);
      ink(g, c => { c.moveTo(x, top - 2); c.quadraticCurveTo(x + s * 6, top - 24, x - s * 7, top - 19); c.quadraticCurveTo(x - s * 2, top - 13, x - s * 2, top - 6); c.closePath(); }, pal.dark, 1.4);
      dot(g, x - s * 3, top - 17, 1.6, GOLD);
      dot(g, cx + s * (w / 2 + e * 0.3), baseY - e, 2.2, GOLD);
    }
    if (w > 140) {
      ink(g, c => c.arc(cx, top - 13, 5, 0, Math.PI * 2), lin(g, cx - 5, top - 18, cx + 5, top - 8, [[0, GOLD_HI], [1, GOLD_DK]]), 1.2);
      for (const s of [-1, 1]) stroke(g, [[cx + s * 5, top - 12], [cx + s * 12, top - 18], [cx + s * 9, top - 9]], GOLD, 1.4);
    }
  }

  function pillar(g, x, baseY, h, w) {
    w = w || 12;
    ink(g, c => c.rect(x - w / 2, baseY - h, w, h), lin(g, x - w / 2, 0, x + w / 2, 0, [[0, '#6e1414'], [0.35, '#dc4a3e'], [0.7, '#a8231f'], [1, '#5a1010']]), 1.5);
    ink(g, c => c.rect(x - w / 2 - 3, baseY - 6, w + 6, 6), stoneFill(g, baseY - 6, baseY), 1.2);
    ink(g, c => c.rect(x - w / 2 - 1, baseY - h, w + 2, 5), lin(g, 0, baseY - h, 0, baseY - h + 5, [[0, GOLD_HI], [1, GOLD_DK]]), 1);
  }

  /** Hoạ tiết màu trên xà (thải hoạ). */
  function caihua(g, x, y, w, h) {
    for (let xx = x + 6; xx < x + w - 14; xx += 26) {
      ink(g, c => c.rect(xx, y + 3, 14, h - 6), '#2f8f84', 0);
      g.strokeStyle = GOLD; g.lineWidth = 1; g.strokeRect(xx, y + 3, 14, h - 6);
      dot(g, xx + 7, y + h / 2, 1.6, '#f3eedf');
    }
  }

  function platform(g, w, h, st) {
    st = st || JADE_STONE;
    ink(g, c => c.rect(-w / 2, -h, w, h), stoneFill(g, -h, 0, st));
    g.strokeStyle = 'rgba(20,30,28,0.45)'; g.lineWidth = 1;
    for (let x = -w / 2 + 28; x < w / 2; x += 28) { g.beginPath(); g.moveTo(x, -h + 4); g.lineTo(x, 0); g.stroke(); }
    ink(g, c => c.rect(-w / 2 - 4, -h - 4, w + 8, 5), st.hi, 1.5);
    const sw = Math.min(80, w * 0.3);
    ink(g, c => c.rect(-sw / 2, -h, sw, h + 4), stoneFill(g, -h, 4, STONE), 1.5);
    for (let k = 1; k < 4; k++) stroke(g, [[-sw / 2, -h + k * (h + 4) / 4], [sw / 2, -h + k * (h + 4) / 4]], 'rgba(20,30,28,0.5)', 1);
  }

  function plaque(g, x, y, w, h, text) {
    ink(g, c => c.rect(x - w / 2, y - h / 2, w, h), lin(g, 0, y - h / 2, 0, y + h / 2, [[0, '#2a3f60'], [1, '#14203a']]), 1.6);
    g.strokeStyle = GOLD; g.lineWidth = 2; g.strokeRect(x - w / 2 + 3, y - h / 2 + 3, w - 6, h - 6);
    g.fillStyle = GOLD_HI; g.font = `bold ${Math.round(h * 0.6)}px ${PLAQUE_FONT}`;
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, x, y + 1);
  }

  /** Thân điện: tường gỗ, song cửa ô trám, cửa đinh vàng, cột đỏ, xà thải hoạ. Trả về y đỉnh xà. */
  function hallBody(g, bw, wh, pf, bays) {
    const top = -pf - wh, bayW = bw / bays, mid = Math.floor(bays / 2);
    ink(g, c => c.rect(-bw / 2, top, bw, wh), lin(g, 0, top, 0, -pf, [[0, '#5a3326'], [1, '#2e1913']]));
    for (let i = 0; i < bays; i++) {
      const x0 = -bw / 2 + i * bayW;
      if (i === mid) {
        const dx = x0 + 8, dw = bayW - 16;
        ink(g, c => c.rect(dx, top + 14, dw, wh - 14), '#24130f', 1.5);
        for (let yy = top + 24; yy < -pf - 6; yy += 11) for (const f of [0.18, 0.36, 0.64, 0.82]) dot(g, dx + dw * f, yy, 1.5, GOLD);
        stroke(g, [[dx + dw / 2, top + 14], [dx + dw / 2, -pf]], LINE, 1.5);
        for (const f of [0.42, 0.58]) { g.strokeStyle = GOLD; g.lineWidth = 1.2; g.beginPath(); g.arc(dx + dw * f, top + wh * 0.6, 3, 0, Math.PI * 2); g.stroke(); }
      } else {
        const wx = x0 + 8, wy = top + 14, ww = bayW - 16, wwh = wh - 38;
        ink(g, c => c.rect(wx, wy, ww, wwh), '#c99f62', 1.5);
        g.save(); g.beginPath(); g.rect(wx, wy, ww, wwh); g.clip();
        g.strokeStyle = '#6b3e22'; g.lineWidth = 1.4;
        for (let d = -wwh; d < ww; d += 8) {
          g.beginPath(); g.moveTo(wx + d, wy); g.lineTo(wx + d + wwh, wy + wwh); g.stroke();
          g.beginPath(); g.moveTo(wx + d + wwh, wy); g.lineTo(wx + d, wy + wwh); g.stroke();
        }
        g.restore();
        ink(g, c => c.rect(wx, wy + wwh + 4, ww, wh - wwh - 18), '#4a2a20', 1.2);
      }
    }
    for (let i = 0; i <= bays; i++) pillar(g, -bw / 2 + i * bayW, -pf, wh);
    ink(g, c => c.rect(-bw / 2 - 8, top - 14, bw + 16, 14), '#7a1d1d', 1.5);
    caihua(g, -bw / 2 - 8, top - 14, bw + 16, 14);
    return top - 14;
  }

  function drawHall(g, o) {
    platform(g, o.bw + 50, 18);
    const ty = hallBody(g, o.bw, o.wh, 18, o.bays);
    let plaqueY = ty + 18;
    if (o.double) {
      roof(g, 0, ty + 2, o.bw + 90, 46, o.roof);
      const uw = o.bw * 0.66;
      ink(g, c => c.rect(-uw / 2, ty - 44, uw, 34), lin(g, 0, ty - 44, 0, ty - 10, [[0, '#5a3326'], [1, '#2e1913']]));
      for (let i = 0; i <= 4; i++) pillar(g, -uw / 2 + (i * uw) / 4, ty - 10, 34, 9);
      ink(g, c => c.rect(-uw / 2 - 6, ty - 54, uw + 12, 11), '#7a1d1d', 1.5);
      caihua(g, -uw / 2 - 6, ty - 54, uw + 12, 11);
      roof(g, 0, ty - 50, uw + 90, 64, o.roof);
      plaqueY = ty - 26;
    } else {
      roof(g, 0, ty + 2, o.bw + 80, o.roofH || 70, o.roof);
    }
    if (o.chimney) {
      const x = o.bw * 0.26;
      ink(g, c => c.rect(x, ty - 56, 16, 40), lin(g, x, 0, x + 16, 0, [[0, '#6a4a3a'], [1, '#3a2620']]), 1.5);
      ink(g, c => c.rect(x - 3, ty - 60, 22, 6), '#2a1c18', 1.2);
    }
    plaque(g, 0, plaqueY, o.plaqueW || 84, 26, o.plaque);
  }

  function drawPagoda(g) {
    platform(g, 170, 14);
    let y = -14;
    for (let i = 0; i < 3; i++) {
      const bw = 112 - i * 24, wh = 52 - i * 6;
      ink(g, c => c.rect(-bw / 2, y - wh, bw, wh), lin(g, 0, y - wh, 0, y, [[0, '#5a3326'], [1, '#2e1913']]));
      for (const f of [-0.28, 0, 0.28]) {
        const wx = f * bw;
        ink(g, c => { c.moveTo(wx - 9, y - 8); c.lineTo(wx - 9, y - wh + 18); c.quadraticCurveTo(wx, y - wh + 6, wx + 9, y - wh + 18); c.lineTo(wx + 9, y - 8); c.closePath(); }, '#c99f62', 1.3);
        stroke(g, [[wx, y - wh + 10], [wx, y - 8]], '#6b3e22', 1.2);
        stroke(g, [[wx - 9, y - wh * 0.5], [wx + 9, y - wh * 0.5]], '#6b3e22', 1.2);
      }
      pillar(g, -bw / 2, y, wh, 10); pillar(g, bw / 2, y, wh, 10);
      ink(g, c => c.rect(-bw / 2 - 6, y - wh - 10, bw + 12, 10), '#7a1d1d', 1.4);
      caihua(g, -bw / 2 - 6, y - wh - 10, bw + 12, 10);
      const rh = 34 - i * 2;
      roof(g, 0, y - wh - 6, bw + 58, rh, ROOF.teal);
      if (i === 0) plaque(g, 0, y - wh * 0.35, 58, 18, '藏經閣');
      y = y - wh - 6 - rh * 0.62;
    }
    ink(g, c => c.rect(-2.5, y - 44, 5, 46), lin(g, -3, 0, 3, 0, [[0, GOLD_DK], [0.5, GOLD_HI], [1, GOLD_DK]]), 1.2);
    for (let k = 0; k < 5; k++) ink(g, c => c.ellipse(0, y - 8 - k * 7, 8 - k, 2.4, 0, 0, Math.PI * 2), GOLD, 1);
    ink(g, c => c.arc(0, y - 48, 4.5, 0, Math.PI * 2), lin(g, -4, y - 52, 4, y - 44, [[0, GOLD_HI], [1, GOLD_DK]]), 1.2);
  }

  function stoneBase(g, x) {
    ink(g, c => c.rect(x - 13, -16, 26, 16), stoneFill(g, -16, 0), 1.5);
    ink(g, c => c.rect(x - 15, -19, 30, 4), STONE.hi, 1.2);
  }

  function drawGate(g) {
    for (const s of [-1, 1]) {
      stoneBase(g, s * 150);
      pillar(g, s * 150, -16, 86, 12);
      const x0 = Math.min(s * 95, s * 150);
      ink(g, c => c.rect(x0, -100, 55, 10), '#7a1d1d', 1.4);
      caihua(g, x0, -100, 55, 10);
      roof(g, s * 122, -102, 92, 26, ROOF.teal);
    }
    for (const s of [-1, 1]) { stoneBase(g, s * 95); pillar(g, s * 95, -16, 136, 14); }
    ink(g, c => c.rect(-108, -152, 216, 13), '#7a1d1d', 1.5);
    caihua(g, -108, -152, 216, 13);
    ink(g, c => c.rect(-108, -124, 216, 8), '#7a1d1d', 1.4);
    plaque(g, 0, -126, 96, 32, '天劍宗');
    roof(g, 0, -156, 254, 46, ROOF.teal);
  }

  function drawSwordPavilion(g) {
    platform(g, 180, 14, STONE);
    ink(g, c => c.rect(-60, -104, 120, 90), lin(g, 0, -104, 0, -14, [[0, '#3a2219'], [1, '#170d0a']]), 1.2);
    ink(g, c => c.rect(-46, -40, 92, 26), stoneFill(g, -40, -14), 1.5);
    for (let i = 0; i < 5; i++) {
      const x = -32 + i * 16, hgt = 30 + (i % 2) * 12;
      ink(g, c => { c.moveTo(x - 2, -40); c.lineTo(x - 2, -40 - hgt); c.lineTo(x + 2, -40 - hgt); c.lineTo(x + 2, -40); c.closePath(); }, lin(g, x - 2, 0, x + 2, 0, [[0, '#9fb2c2'], [0.5, '#f4fbff'], [1, '#8a9cad']]), 1);
      ink(g, c => c.rect(x - 6, -43 - hgt, 12, 3.5), GOLD, 1);
      ink(g, c => c.rect(x - 1.8, -53 - hgt, 3.6, 10), '#5a1e1e', 1);
      dot(g, x, -55 - hgt, 2.2, GOLD);
    }
    for (const s of [-1, 1]) pillar(g, s * 66, -14, 92, 12);
    ink(g, c => c.rect(-76, -118, 152, 12), '#7a1d1d', 1.4);
    caihua(g, -76, -118, 152, 12);
    roof(g, 0, -118, 214, 54, ROOF.teal);
    plaque(g, 0, -102, 52, 18, '劍閣');
  }

  function drawThunderAltar(g) {
    for (let k = 0; k < 3; k++) {
      const rx = 104 - k * 24, ry = rx * 0.36, y = -10 - k * 14;
      ink(g, c => { c.ellipse(0, y + 12, rx, ry, 0, 0, Math.PI); c.lineTo(-rx, y); c.ellipse(0, y, rx, ry, 0, Math.PI, 0, true); c.closePath(); }, lin(g, 0, y, 0, y + ry + 12, [[0, '#4a4660'], [1, '#22202e']]), 1.5);
      ink(g, c => c.ellipse(0, y, rx, ry, 0, 0, Math.PI * 2), lin(g, -rx, y - ry, rx, y + ry, [[0, '#8f8aa8'], [1, '#55506c']]), 1.5);
    }
    const ty = -38;
    g.strokeStyle = 'rgba(190,150,255,0.55)'; g.lineWidth = 1.5;
    g.beginPath(); g.ellipse(0, ty, 40, 14, 0, 0, Math.PI * 2); g.stroke();
    g.fillStyle = 'rgba(200,170,255,0.7)'; g.font = `bold 20px ${PLAQUE_FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.save(); g.translate(0, ty); g.scale(1, 0.55); g.fillText('雷', 0, 0); g.restore();
    for (const [x, y] of [[-46, -44], [46, -44], [-30, -30], [30, -30]]) {
      ink(g, c => c.rect(x - 2.5, y - 46, 5, 46), lin(g, x - 3, 0, x + 3, 0, [[0, '#6a4a2a'], [0.5, '#c79a5a'], [1, '#5a3a1a']]), 1.2);
      stroke(g, [[x, y - 46], [x + 4, y - 54], [x - 2, y - 58], [x + 3, y - 66]], GOLD, 1.6);
    }
  }

  // ------------------------------------------------------------------ đạo cụ nhỏ
  function drawStoneLantern(g) {
    ink(g, c => c.rect(-14, -9, 28, 9), stoneFill(g, -9, 0), 1.5);
    ink(g, c => c.rect(-5, -40, 10, 31), stoneFill(g, -40, -9), 1.4);
    ink(g, c => c.rect(-13, -45, 26, 6), STONE.hi, 1.4);
    ink(g, c => c.rect(-10, -63, 20, 18), stoneFill(g, -63, -45), 1.4);
    ink(g, c => c.rect(-6, -59, 12, 10), '#3a2410', 1.2);
    ink(g, c => { c.moveTo(-19, -63); c.quadraticCurveTo(0, -70, 19, -63); c.lineTo(10, -75); c.lineTo(-10, -75); c.closePath(); }, stoneFill(g, -75, -63, { hi: '#9aa59e', mid: '#6f7a74', dark: '#47504b' }), 1.5);
    ink(g, c => c.arc(0, -79, 4, 0, Math.PI * 2), STONE.mid, 1.2);
    g.fillStyle = 'rgba(70,120,80,0.5)'; g.beginPath(); g.ellipse(-8, -70, 6, 2.5, 0.2, 0, Math.PI * 2); g.fill();
  }

  function drawStoneLion(g) {
    ink(g, c => c.rect(-24, -14, 48, 14), stoneFill(g, -14, 0), 1.5);
    ink(g, c => c.rect(-26, -17, 52, 4), STONE.hi, 1.2);
    const fill = stoneFill(g, -70, -16, { hi: '#b9c2bb', mid: '#8a958e', dark: '#59645e' });
    ink(g, c => c.ellipse(4, -32, 17, 16, 0, 0, Math.PI * 2), fill, 1.5);
    ink(g, c => c.rect(-12, -34, 8, 18), fill, 1.3);
    ink(g, c => c.rect(3, -34, 8, 18), fill, 1.3);
    ink(g, c => c.arc(-15, -22, 6, 0, Math.PI * 2), lin(g, -20, -28, -10, -16, [[0, '#c9d2cb'], [1, '#6f7a74']]), 1.3);
    for (let i = 0; i < 11; i++) {
      const a = (i / 11) * Math.PI * 2;
      ink(g, c => c.arc(-2 + Math.cos(a) * 13, -54 + Math.sin(a) * 12, 5.2, 0, Math.PI * 2), '#6f7a74', 1.1);
    }
    ink(g, c => c.arc(-2, -54, 11.5, 0, Math.PI * 2), fill, 1.4);
    dot(g, -6.5, -56, 1.8, LINE); dot(g, 2.5, -56, 1.8, LINE);
    ink(g, c => c.ellipse(-2, -50, 4, 2.6, 0, 0, Math.PI * 2), '#9aa59e', 1);
    stroke(g, [[-6, -46], [-2, -44], [2, -46]], LINE, 1.2);
    g.fillStyle = 'rgba(70,120,80,0.55)';
    g.beginPath(); g.ellipse(10, -40, 6, 3, 0.4, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(-14, -15, 7, 2.5, 0, 0, Math.PI * 2); g.fill();
  }

  function bronze(g, y0, y1) { return lin(g, 0, y0, 0, y1, [[0, '#d9a85a'], [0.4, '#a2702e'], [1, '#4a3014']]); }

  function drawIncense(g) {
    for (const x of [-15, 0, 15]) ink(g, c => c.rect(x - 3, -14, 6, 14), '#5a3a16', 1.2);
    ink(g, c => { c.moveTo(-24, -34); c.quadraticCurveTo(-26, -10, 0, -11); c.quadraticCurveTo(26, -10, 24, -34); c.closePath(); }, bronze(g, -34, -10), 1.5);
    stroke(g, [[-22, -26], [22, -26]], GOLD, 1.3);
    for (let x = -18; x <= 18; x += 6) dot(g, x, -21, 1.2, GOLD_DK);
    ink(g, c => c.ellipse(0, -34, 25, 6, 0, 0, Math.PI * 2), lin(g, -25, -40, 25, -28, [[0, '#e8c27a'], [1, '#7a5420']]), 1.4);
    for (const s of [-1, 1]) ink(g, c => { c.rect(s * 25 - (s > 0 ? 0 : 6), -42, 6, 10); }, '#8a5e24', 1.2);
    for (const x of [-5, 0, 5]) stroke(g, [[x, -34], [x + 1, -50]], '#7a3a1a', 1.5);
  }

  /** Cụm tán lá kiểu vẽ tay: nhiều lớp tròn đậm → nhạt, sáng phía trên-trái. */
  function foliage(g, cx, cy, r, cols, rnd) {
    g.fillStyle = rgba(LINE, 0.55);
    g.beginPath(); g.ellipse(cx, cy + 2, r * 1.05, r * 0.78, 0, 0, Math.PI * 2); g.fill();
    const layers = [[cols[0], 10, 0.6, 0, 0], [cols[1], 9, 0.5, -0.18, -0.2], [cols[2], 6, 0.32, -0.32, -0.38]];
    for (const [col, n, spread, ox, oy] of layers) {
      g.fillStyle = col;
      for (let i = 0; i < n; i++) {
        const a = rnd() * Math.PI * 2, d = rnd() * r * spread;
        g.beginPath();
        g.arc(cx + ox * r + Math.cos(a) * d, cy + oy * r + Math.sin(a) * d * 0.7, r * (0.3 + rnd() * 0.22), 0, Math.PI * 2);
        g.fill();
      }
    }
  }

  function trunk(g, h, w, lean, bark) {
    ink(g, c => {
      c.moveTo(-w, 0); c.quadraticCurveTo(-w * 0.6 + lean * 0.3, -h * 0.5, lean - w * 0.35, -h);
      c.lineTo(lean + w * 0.35, -h); c.quadraticCurveTo(w * 0.6 + lean * 0.3, -h * 0.5, w, 0); c.closePath();
    }, lin(g, -w, 0, w, 0, bark || [[0, '#2a1a12'], [0.4, '#6a4630'], [1, '#2a1a12']]), 1.6);
    g.strokeStyle = 'rgba(20,12,8,0.5)'; g.lineWidth = 1;
    for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(-w * 0.5 + k * w * 0.3, -6); g.quadraticCurveTo(lean * 0.2, -h * 0.5, lean - w * 0.2 + k * w * 0.13, -h + 4); g.stroke(); }
  }

  function drawPine(g, v) {
    const rnd = U.seeded(17 + v * 31);
    trunk(g, 150, 13, 10 - v * 6);
    stroke(g, [[2, -110], [-30, -122]], '#4a3022', 4);
    stroke(g, [[4, -90], [36, -100]], '#4a3022', 4);
    const cols = ['#1f3d33', '#2f5a45', '#5a9468'];
    for (const [x, y, r] of [[-48, -122, 32], [44, -100, 30], [-8, -165, 36], [34, -150, 30], [-36, -158, 26], [6, -196, 26]]) foliage(g, x, y, r, cols, rnd);
  }

  function drawPeach(g, v) {
    const rnd = U.seeded(97 + v * 13);
    trunk(g, 120, 11, -8 + v * 5, [[0, '#2a1a18'], [0.4, '#5e3a34'], [1, '#2a1a18']]);
    stroke(g, [[-2, -96], [-34, -112]], '#4a2a26', 3.5);
    stroke(g, [[0, -84], [32, -96]], '#4a2a26', 3.5);
    const cols = ['#a84a6c', '#e98fb0', '#ffe0ea'];
    for (const [x, y, r] of [[-40, -116, 28], [38, -100, 26], [0, -146, 34], [30, -136, 24], [-28, -146, 24]]) foliage(g, x, y, r, cols, rnd);
    g.fillStyle = 'rgba(60,110,70,0.85)';
    for (let i = 0; i < 14; i++) { g.beginPath(); g.ellipse(-40 + rnd() * 80, -160 + rnd() * 70, 3.5, 1.6, rnd() * 3, 0, Math.PI * 2); g.fill(); }
  }

  function drawBamboo(g, v) {
    const rnd = U.seeded(53 + v * 7);
    for (let i = 0; i < 6; i++) {
      const x = -24 + i * 9 + rnd() * 4, h = 120 + rnd() * 50, lean = (rnd() - 0.5) * 16;
      ink(g, c => { c.moveTo(x - 3, 0); c.lineTo(x - 2 + lean, -h); c.lineTo(x + 2 + lean, -h); c.lineTo(x + 3, 0); c.closePath(); }, lin(g, x - 3, 0, x + 3, 0, [[0, '#2f5a2a'], [0.5, '#7ab35a'], [1, '#2f5a2a']]), 1.2);
      for (let y = -18; y > -h; y -= 22) stroke(g, [[x - 3 + lean * (-y / h), y], [x + 3 + lean * (-y / h), y]], '#1f3a1c', 1.6);
      g.fillStyle = rnd() < 0.5 ? '#3f7a3a' : '#5a9a4a';
      for (let k = 0; k < 6; k++) {
        const ly = -h + rnd() * 50, lx = x + lean * (-ly / h);
        g.save(); g.translate(lx, ly); g.rotate((rnd() - 0.5) * 2.4);
        g.beginPath(); g.ellipse(9, 0, 10, 2.4, 0, 0, Math.PI * 2); g.fill(); g.restore();
      }
    }
  }

  function rockShape(g, w, h, st, rnd) {
    ink(g, c => {
      c.moveTo(-w / 2, 0); c.lineTo(-w * 0.45, -h * 0.55); c.lineTo(-w * 0.15, -h);
      c.lineTo(w * 0.25, -h * 0.9); c.lineTo(w * 0.5, -h * 0.4); c.lineTo(w * 0.45, 0); c.closePath();
    }, stoneFill(g, -h, 0, st));
    stroke(g, [[-w * 0.15, -h], [-w * 0.05, -h * 0.4], [w * 0.2, -h * 0.2]], 'rgba(20,30,28,0.45)', 1.2);
    stroke(g, [[-w * 0.4, -h * 0.55], [-w * 0.1, -h * 0.5]], rgba(st.hi, 0.7), 1.5);
  }

  function drawRockMoss(g, v) {
    const rnd = U.seeded(v * 11 + 3);
    rockShape(g, 70, 46, JADE_STONE, rnd);
    g.fillStyle = 'rgba(80,140,80,0.8)';
    for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(-20 + rnd() * 34, -40 + rnd() * 14, 7, 3, rnd(), 0, Math.PI * 2); g.fill(); }
  }

  function drawFence(g) {
    const red = lin(g, 0, -40, 0, 0, [[0, '#d8443a'], [1, '#7a1616']]);
    ink(g, c => c.rect(-64, -12, 128, 5), red, 1.3);
    ink(g, c => c.rect(-64, -34, 128, 6), red, 1.3);
    for (let x = -56; x <= 56; x += 8) ink(g, c => c.rect(x - 1.5, -28, 3, 16), '#a8231f', 0.8);
    for (const x of [-64, 0, 64]) {
      ink(g, c => c.rect(x - 4, -40, 8, 40), red, 1.3);
      ink(g, c => c.arc(x, -42, 4, 0, Math.PI * 2), GOLD, 1.1);
    }
  }

  function drawBannerPole(g) {
    ink(g, c => c.rect(-8, -8, 16, 8), stoneFill(g, -8, 0), 1.3);
    ink(g, c => c.rect(-2, -170, 4, 162), lin(g, -2, 0, 2, 0, [[0, '#3a2418'], [0.5, '#8a5a3a'], [1, '#3a2418']]), 1.2);
    ink(g, c => c.arc(0, -173, 4, 0, Math.PI * 2), GOLD, 1.1);
    ink(g, c => c.rect(-2, -164, 26, 4), '#5a3a26', 1);
  }

  function drawLotusPond(g) {
    ink(g, c => c.ellipse(0, 0, 124, 58, 0, 0, Math.PI * 2), stoneFill(g, -58, 58, JADE_STONE), 2);
    const water = g.createRadialGradient(-20, -10, 10, 0, 0, 120);
    water.addColorStop(0, '#3f8f8a'); water.addColorStop(0.7, '#1f5a5a'); water.addColorStop(1, '#0f3236');
    ink(g, c => c.ellipse(0, 0, 112, 48, 0, 0, Math.PI * 2), water, 1.5);
    const rnd = U.seeded(5);
    for (let i = 0; i < 12; i++) {
      const x = -90 + rnd() * 180, y = -32 + rnd() * 60;
      if ((x * x) / (100 * 100) + (y * y) / (40 * 40) > 1) continue;
      const r = 7 + rnd() * 6;
      ink(g, c => { c.moveTo(x, y); c.arc(x, y, r, 0.3, Math.PI * 2 - 0.1); c.closePath(); }, lin(g, x - r, y - r, x + r, y + r, [[0, '#6fbf6a'], [1, '#2f6a3a']]), 1);
      if (rnd() < 0.45) {
        for (let k = 0; k < 5; k++) {
          const a = -Math.PI / 2 + (k - 2) * 0.5;
          ink(g, c => c.ellipse(x + Math.cos(a) * 4, y - 4 + Math.sin(a) * 4, 2.6, 5.5, a + Math.PI / 2, 0, Math.PI * 2), lin(g, 0, y - 10, 0, y, [[0, '#ffe0ea'], [1, '#e06a92']]), 0.8);
        }
        dot(g, x, y - 4, 1.8, GOLD_HI);
      }
    }
  }

  function drawFlowerBush(g, v) {
    const rnd = U.seeded(v * 19 + 2);
    foliage(g, 0, -12, 18, ['#1f4a33', '#2f6a45', '#4f8f5a'], rnd);
    const cols = ['#ffd6e4', '#fff3b0', '#c9b8ff', '#ff9a8a'];
    for (let i = 0; i < 12; i++) dot(g, -14 + rnd() * 28, -22 + rnd() * 18, 1.8, cols[(v + i) % 4]);
  }

  /** Sạp hàng Vạn Bảo: quầy gỗ, mái vải lam viền vàng, chum, bình đan, cuộn trục, đèn lồng. */
  function drawStall(g) {
    const wood = lin(g, 0, -60, 0, 0, [[0, '#8a5a3a'], [1, '#3a2418']]);
    for (const x of [-56, 56]) ink(g, c => c.rect(x - 3, -104, 6, 104), wood, 1.3);
    ink(g, c => c.rect(-62, -40, 124, 40), wood, 1.6);
    for (let x = -50; x < 60; x += 20) stroke(g, [[x, -36], [x, -4]], 'rgba(20,10,6,0.5)', 1);
    ink(g, c => c.rect(-66, -44, 132, 6), '#b0784a', 1.4);
    // hàng hoá trên quầy
    const jar = (x, h, col) => {
      ink(g, c => { c.moveTo(x - 7, -44); c.quadraticCurveTo(x - 10, -44 - h * 0.6, x - 4, -44 - h); c.lineTo(x + 4, -44 - h); c.quadraticCurveTo(x + 10, -44 - h * 0.6, x + 7, -44); c.closePath(); }, lin(g, x - 8, 0, x + 8, 0, [[0, col], [1, '#1a1a1a']]), 1.2);
      ink(g, c => c.rect(x - 4, -48 - h, 8, 4), '#c8343c', 1);
    };
    jar(-44, 18, '#5a8a7a'); jar(-28, 14, '#a8743a'); jar(30, 20, '#4a5a8a');
    for (const [x, col] of [[-12, '#E74C3C'], [-4, '#3FA9F5'], [4, '#F1C40F'], [12, '#7FE3D0']]) {
      ink(g, c => c.rect(x - 3, -56, 6, 12), lin(g, x - 3, 0, x + 3, 0, [[0, col], [1, '#222']]), 1);
      dot(g, x, -58, 2.2, '#e8dcc0');
    }
    ink(g, c => c.rect(44, -60, 14, 16), '#e8dcc0', 1.2);
    stroke(g, [[44, -56], [58, -56]], '#c8343c', 2);
    // mái vải
    ink(g, c => { c.moveTo(-74, -96); c.lineTo(74, -96); c.lineTo(66, -116); c.lineTo(-66, -116); c.closePath(); }, lin(g, 0, -116, 0, -96, [[0, '#4a9a8a'], [1, '#22584e']]), 1.6);
    g.fillStyle = '#e9b44c';
    for (let x = -72; x < 72; x += 12) { g.beginPath(); g.moveTo(x, -96); g.lineTo(x + 6, -88); g.lineTo(x + 12, -96); g.closePath(); g.fill(); }
    stroke(g, [[-74, -96], [74, -96]], LINE, 1.4);
    // đèn lồng + biển
    stroke(g, [[-48, -96], [-48, -86]], LINE, 1);
    ink(g, c => c.ellipse(-48, -78, 7, 9, 0, 0, Math.PI * 2), lin(g, -7, -86, 7, -70, [[0, '#ff6a4a'], [1, '#8a1414']]), 1.2);
    plaque(g, 0, -128, 64, 18, '萬寶閣');
  }

  // ------------------------------------------------------------------ Linh Mộc Lâm
  function drawAncientTree(g, v) {
    const rnd = U.seeded(41 + v * 23);
    for (const s of [-1, 1]) for (const k of [0.6, 1]) {
      ink(g, c => { c.moveTo(s * 8, -24); c.quadraticCurveTo(s * 30 * k, -6, s * 52 * k, 4); c.lineTo(s * 40 * k, 6); c.quadraticCurveTo(s * 20 * k, -2, s * 4, -10); c.closePath(); }, '#3a2618', 1.3);
    }
    trunk(g, 200, 26, 6, [[0, '#24170f'], [0.45, '#5e4028'], [1, '#1c120c']]);
    stroke(g, [[0, -150], [-58, -176]], '#3a2618', 7);
    stroke(g, [[4, -130], [62, -150]], '#3a2618', 7);
    const cols = ['#143022', '#22503a', '#3f8a5a'];
    for (const [x, y, r] of [[-78, -184, 50], [76, -162, 46], [0, -232, 60], [-40, -238, 44], [46, -228, 46], [0, -180, 44]]) foliage(g, x, y, r, cols, rnd);
    g.strokeStyle = 'rgba(70,130,80,0.85)'; g.lineWidth = 1.6;
    for (let i = 0; i < 9; i++) {
      const x = -90 + rnd() * 180, y0 = -170 + rnd() * 30;
      g.beginPath(); g.moveTo(x, y0); g.quadraticCurveTo(x + 6, y0 + 30, x - 2, y0 + 50 + rnd() * 30); g.stroke();
    }
    for (let i = 0; i < 10; i++) dot(g, -80 + rnd() * 160, -250 + rnd() * 110, 1.6, 'rgba(160,255,220,0.8)');
  }

  function drawGlowMushroom(g, v) {
    const rnd = U.seeded(v * 5 + 9);
    for (let i = 0; i < 3; i++) {
      const x = -14 + i * 13 + rnd() * 4, h = 12 + rnd() * 14, r = 7 + rnd() * 6;
      ink(g, c => c.rect(x - 2, -h, 4, h), '#e8f0e6', 1);
      ink(g, c => { c.ellipse(x, -h, r, r * 0.6, 0, Math.PI, 0); c.closePath(); }, lin(g, 0, -h - r, 0, -h, [[0, '#8ffff0'], [1, '#2a9a8f']]), 1.2);
      for (let k = 0; k < 3; k++) dot(g, x - r * 0.5 + rnd() * r, -h - r * 0.3 - rnd() * r * 0.2, 1.2, '#e8fffb');
    }
  }

  function drawFern(g, v) {
    const rnd = U.seeded(v * 3 + 1);
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI / 2 + (i - 3) * 0.38, len = 26 + rnd() * 10;
      const ex = Math.cos(a) * len, ey = Math.sin(a) * len * 0.8;
      g.strokeStyle = '#2f6a3a'; g.lineWidth = 1.6;
      g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(ex * 0.5, ey * 0.7 - 6, ex, ey); g.stroke();
      g.fillStyle = i % 2 ? '#4f9a4a' : '#3a8040';
      for (let k = 2; k < 7; k++) {
        const t = k / 7, px = ex * t, py = ey * t - Math.sin(t * Math.PI) * 6;
        g.beginPath(); g.ellipse(px, py, 4.5 * (1 - t * 0.6), 1.6, a + 1.2, 0, Math.PI * 2); g.fill();
        g.beginPath(); g.ellipse(px, py, 4.5 * (1 - t * 0.6), 1.6, a - 1.2, 0, Math.PI * 2); g.fill();
      }
    }
  }

  function drawRuinPillar(g, v) {
    const rnd = U.seeded(v * 7 + 4);
    ink(g, c => c.rect(-18, -12, 36, 12), stoneFill(g, -12, 0, JADE_STONE), 1.5);
    const h = 70 + rnd() * 26;
    ink(g, c => { c.moveTo(-12, -12); c.lineTo(-12, -h + 6); c.lineTo(-6, -h - 4); c.lineTo(0, -h + 4); c.lineTo(5, -h - 8); c.lineTo(12, -h + 2); c.lineTo(12, -12); c.closePath(); }, lin(g, -12, 0, 12, 0, [[0, '#4a6a5e'], [0.4, '#a6c9b9'], [1, '#3a5a4e']]), 1.5);
    for (const x of [-6, 0, 6]) stroke(g, [[x, -14], [x, -h + 10]], 'rgba(20,40,32,0.4)', 1);
    g.fillStyle = 'rgba(120,230,200,0.5)'; g.font = `12px ${PLAQUE_FONT}`; g.textAlign = 'center';
    g.fillText('靈', 0, -h * 0.5);
    g.fillStyle = 'rgba(70,140,80,0.8)';
    for (let i = 0; i < 5; i++) { g.beginPath(); g.ellipse(-8 + rnd() * 16, -h + 8 + rnd() * 20, 6, 2.5, rnd(), 0, Math.PI * 2); g.fill(); }
    stroke(g, [[10, -h + 6], [14, -h * 0.6], [8, -30], [12, -14]], '#3f7a3a', 1.8);
  }

  function drawRuinStele(g) {
    ink(g, c => c.rect(-26, -10, 52, 10), stoneFill(g, -10, 0, JADE_STONE), 1.5);
    ink(g, c => { c.moveTo(-20, -10); c.lineTo(-20, -74); c.quadraticCurveTo(0, -92, 20, -74); c.lineTo(20, -10); c.closePath(); }, stoneFill(g, -88, -10, { hi: '#b9cfc4', mid: '#7a978a', dark: '#46625a' }), 1.6);
    g.strokeStyle = 'rgba(20,40,32,0.55)'; g.lineWidth = 1.4;
    for (const x of [-10, 0, 10]) for (let y = -68; y < -18; y += 8) { g.beginPath(); g.moveTo(x - 3, y); g.lineTo(x + 3, y); g.stroke(); }
    stroke(g, [[6, -86], [2, -60], [9, -42], [4, -20]], LINE, 1.5);
    g.fillStyle = 'rgba(70,140,80,0.8)'; g.beginPath(); g.ellipse(-12, -74, 9, 4, 0.3, 0, Math.PI * 2); g.fill();
  }

  function drawFortressWall(g) {
    const stone = { hi: '#b7b09a', mid: '#777463', dark: '#3e403b' };
    ink(g, c => c.rect(-128, -18, 256, 36), stoneFill(g, -18, 18, stone), 2);
    for (let x = -112, row = 0; x < 128; x += 32, row++) {
      stroke(g, [[x, -17], [x, 17]], 'rgba(24,28,27,0.55)', 1.5);
      if (row % 2 === 0) stroke(g, [[x - 16, 0], [x + 16, 0]], 'rgba(24,28,27,0.45)', 1);
    }
    for (let x = -112; x <= 112; x += 32) {
      ink(g, c => c.rect(x - 11, -34, 22, 18), stoneFill(g, -34, -16, stone), 1.5);
      ink(g, c => c.rect(x - 13, -36, 26, 4), stone.hi, 1);
    }
    stroke(g, [[-126, 19], [126, 19]], 'rgba(20,24,22,0.8)', 2);
    stroke(g, [[-124, -19], [124, -19]], 'rgba(255,230,170,0.25)', 1);
  }

  function drawFortressWallVertical(g) {
    const stone = { hi: '#b7b09a', mid: '#777463', dark: '#3e403b' };
    ink(g, c => c.rect(-18, -128, 36, 256), stoneFill(g, -128, 128, stone), 2);
    for (let y = -112, row = 0; y < 128; y += 32, row++) {
      stroke(g, [[-17, y], [17, y]], 'rgba(24,28,27,0.55)', 1.5);
      if (row % 2 === 0) stroke(g, [[0, y - 16], [0, y + 16]], 'rgba(24,28,27,0.45)', 1);
    }
    for (let y = -112; y <= 112; y += 32) {
      ink(g, c => c.rect(-34, y - 11, 18, 22), stoneFill(g, y - 11, y + 11, stone), 1.5);
      ink(g, c => c.rect(-36, y - 13, 4, 26), stone.hi, 1);
    }
    stroke(g, [[19, -126], [19, 126]], 'rgba(20,24,22,0.8)', 2);
    stroke(g, [[-19, -124], [-19, 124]], 'rgba(255,230,170,0.25)', 1);
  }

  function drawFortressTower(g) {
    const stone = { hi: '#c4b998', mid: '#827a64', dark: '#46463d' };
    ink(g, c => c.ellipse(0, -3, 47, 22, 0, 0, Math.PI * 2), 'rgba(0,0,0,0.35)', 0);
    ink(g, c => c.rect(-36, -72, 72, 64), stoneFill(g, -72, -8, stone), 2);
    for (let x = -24; x <= 24; x += 16) {
      ink(g, c => c.rect(x - 5, -92, 10, 22), stoneFill(g, -92, -70, stone), 1.5);
      ink(g, c => c.rect(x - 7, -94, 14, 4), stone.hi, 1);
    }
    ink(g, c => c.rect(-41, -14, 82, 9), stone.hi, 1.5);
    for (const x of [-20, 0, 20]) {
      ink(g, c => c.rect(x - 4, -52, 8, 18), '#252820', 1);
      stroke(g, [[x, -52], [x, -34]], GOLD_DK, 1);
    }
    ink(g, c => c.rect(-30, -7, 60, 7), stoneFill(g, -7, 0, stone), 1.5);
  }

  function drawFortressGate(g) {
    const stone = { hi: '#c9bd9b', mid: '#82765c', dark: '#403d34' };
    for (const side of [-1, 1]) {
      const x = side * 96;
      ink(g, c => c.rect(x - 38, -118, 76, 118), stoneFill(g, -118, 0, stone), 2);
      for (let y = -100; y < -18; y += 28) stroke(g, [[x - 36, y], [x + 36, y]], 'rgba(25,27,23,0.55)', 1.5);
      for (let xx = x - 24; xx <= x + 24; xx += 24) {
        ink(g, c => c.rect(xx - 7, -140, 14, 24), stoneFill(g, -140, -116, stone), 1.4);
        ink(g, c => c.rect(xx - 9, -142, 18, 4), stone.hi, 1);
      }
    }
    ink(g, c => {
      c.moveTo(-62, 0); c.lineTo(-62, -112); c.quadraticCurveTo(-62, -188, 0, -188);
      c.quadraticCurveTo(62, -188, 62, -112); c.lineTo(62, 0); c.closePath();
    }, stoneFill(g, -188, 0, stone), 2);
    ink(g, c => {
      c.moveTo(-39, 0); c.lineTo(-39, -108); c.quadraticCurveTo(-39, -150, 0, -150);
      c.quadraticCurveTo(39, -150, 39, -108); c.lineTo(39, 0); c.closePath();
    }, lin(g, 0, -150, 0, 0, [[0, '#10151a'], [1, '#29251e']]), 2);
    stroke(g, [[-64, -112], [-62, -170], [0, -192], [62, -170], [64, -112]], GOLD_DK, 2);
    roof(g, 0, -190, 282, 42, ROOF.slate);
    plaque(g, 0, -144, 78, 24, '鎮魔關');
    for (const side of [-1, 1]) {
      const x = side * 96;
      ink(g, c => c.rect(x - 5, -52, 10, 20), '#251b16', 1);
      ink(g, c => c.ellipse(x, -49, 3.5, 6, 0, 0, Math.PI * 2), GOLD, 0.8);
    }
  }

  function drawFortressKeep(g) {
    platform(g, 300, 18, { hi: '#bbb29a', mid: '#786f5b', dark: '#403d34' });
    drawHall(g, { bw: 240, wh: 78, bays: 3, roof: ROOF.slate, double: true, plaque: '鎮魔城', plaqueW: 112 });
  }

  function drawFortressRubble(g, v) {
    const rnd = U.seeded(v * 17 + 22);
    const stone = { hi: '#aaa48e', mid: '#706d60', dark: '#3f413b' };
    ink(g, c => c.ellipse(0, -2, 54, 18, 0, 0, Math.PI * 2), 'rgba(0,0,0,0.35)', 0);
    for (let i = 0; i < 7; i++) {
      const x = -44 + rnd() * 88, y = -8 - rnd() * 20, w = 12 + rnd() * 18, h = 8 + rnd() * 14;
      ink(g, c => { c.moveTo(x - w, y); c.lineTo(x - w * 0.7, y - h); c.lineTo(x + w * 0.6, y - h * 0.8); c.lineTo(x + w, y - 2); c.closePath(); }, stoneFill(g, y - h, y, stone), 1.3);
    }
    stroke(g, [[-24, -23], [-10, -32], [8, -20]], 'rgba(30,34,30,0.8)', 1.5);
  }

  // ------------------------------------------------------------------ Hỏa Diệm Cốc
  function drawObsidian(g, v) {
    const rnd = U.seeded(v * 13 + 6);
    for (let i = 0; i < 5; i++) {
      const x = -28 + i * 14 + rnd() * 6, h = 36 + rnd() * 50, w = 9 + rnd() * 7, lean = (rnd() - 0.5) * 18;
      ink(g, c => { c.moveTo(x - w, 0); c.lineTo(x + lean, -h); c.lineTo(x + w, 0); c.closePath(); }, lin(g, x - w, -h, x + w, 0, [[0, '#4a3a5a'], [0.5, '#1c1622'], [1, '#0c0a10']]), 1.4);
      stroke(g, [[x + lean, -h], [x + w, 0]], 'rgba(255,120,40,0.8)', 1.6);
    }
  }

  function crystalCluster(g, cols, rnd, n, maxH) {
    for (let i = 0; i < n; i++) {
      const a = (i - (n - 1) / 2) * 0.32, h = maxH * (0.55 + rnd() * 0.45) * (i === Math.floor(n / 2) ? 1.2 : 1), w = 6 + rnd() * 4;
      g.save(); g.rotate(a);
      ink(g, c => { c.moveTo(-w, 0); c.lineTo(-w, -h * 0.75); c.lineTo(0, -h); c.lineTo(w, -h * 0.75); c.lineTo(w, 0); c.closePath(); }, lin(g, -w, 0, w, 0, [[0, cols[0]], [0.45, cols[1]], [1, cols[2]]]), 1.3);
      stroke(g, [[0, -h], [0, -2]], 'rgba(255,255,255,0.55)', 1);
      g.restore();
    }
  }

  function drawFireCrystal(g, v) { crystalCluster(g, ['#8a1a10', '#ffb04a', '#c0301a'], U.seeded(v + 30), 3, 56); }

  function drawDeadTree(g, v) {
    const rnd = U.seeded(v * 9 + 8);
    trunk(g, 100, 10, -6 + v * 4, [[0, '#0c0a0a'], [0.45, '#3a2a24'], [1, '#0c0a0a']]);
    for (const [x0, y0, x1, y1] of [[0, -80, -36, -112], [-2, -60, 30, -94], [-6, -98, 10, -130], [-20, -100, -46, -100]]) stroke(g, [[x0, y0], [x1, y1]], '#1c1412', 3);
    for (let i = 0; i < 8; i++) dot(g, -40 + rnd() * 76, -130 + rnd() * 60, 1.6, 'rgba(255,140,50,0.9)');
  }

  function drawLavaPool(g) {
    ink(g, c => c.ellipse(0, 0, 98, 46, 0, 0, Math.PI * 2), lin(g, 0, -46, 0, 46, [[0, '#3a2a26'], [1, '#140c0a']]), 2);
    const lava = g.createRadialGradient(0, 0, 4, 0, 0, 86);
    lava.addColorStop(0, '#fff2a0'); lava.addColorStop(0.35, '#ffb03a'); lava.addColorStop(0.75, '#e04a14'); lava.addColorStop(1, '#5a1408');
    ink(g, c => c.ellipse(0, 0, 86, 37, 0, 0, Math.PI * 2), lava, 1.5);
    const rnd = U.seeded(77);
    g.fillStyle = 'rgba(40,20,14,0.75)';
    for (let i = 0; i < 9; i++) { g.beginPath(); g.ellipse(-70 + rnd() * 140, -26 + rnd() * 52, 6 + rnd() * 9, 3 + rnd() * 3, rnd(), 0, Math.PI * 2); g.fill(); }
  }

  function drawEmberVent(g) {
    const rnd = U.seeded(12);
    ink(g, c => c.ellipse(0, 0, 32, 12, 0, 0, Math.PI * 2), '#1a1210', 1.4);
    g.strokeStyle = '#ff7a2a'; g.lineWidth = 2;
    for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-24 + rnd() * 10, -4 + rnd() * 8); g.lineTo(-4 + rnd() * 8, -2 + rnd() * 4); g.lineTo(16 + rnd() * 10, -5 + rnd() * 10); g.stroke(); }
  }

  // ------------------------------------------------------------------ Huyền Băng Động
  function drawIceCrystal(g, v) { crystalCluster(g, ['#6fa8d0', '#f2fbff', '#8fc6e8'], U.seeded(v + 60), 4, 70); }

  function drawFrozenPillar(g, v) {
    ink(g, c => c.rect(-12, -100, 24, 100), lin(g, -12, 0, 12, 0, [[0, '#4a5560'], [0.5, '#9aa8b4'], [1, '#3a444e']]), 1.5);
    ink(g, c => { c.moveTo(-22, 0); c.lineTo(-24, -70); c.lineTo(-14, -112); c.lineTo(6, -118); c.lineTo(22, -90); c.lineTo(22, 0); c.closePath(); }, 'rgba(170,220,250,0.42)', 1.5);
    stroke(g, [[-18, -60], [-10, -104]], 'rgba(255,255,255,0.75)', 2);
    for (let x = -14; x < 18; x += 7) stroke(g, [[x, -112 + Math.abs(x)], [x + 1, -98 + Math.abs(x)]], 'rgba(230,248,255,0.9)', 1.5);
  }

  function drawSnowDrift(g, v) {
    ink(g, c => { c.moveTo(-58, 4); c.quadraticCurveTo(-40, -22, -10, -18); c.quadraticCurveTo(20, -30, 58, 4); c.closePath(); }, lin(g, 0, -30, 0, 4, [[0, '#ffffff'], [1, '#a8c4d8']]), 1.4);
    dot(g, -18, -14, 2, 'rgba(255,255,255,0.9)');
  }

  function drawFrozenSword(g) {
    ink(g, c => { c.moveTo(-50, 0); c.lineTo(-56, -90); c.lineTo(-30, -150); c.lineTo(20, -158); c.lineTo(54, -100); c.lineTo(50, 0); c.closePath(); }, 'rgba(150,210,245,0.38)', 2);
    ink(g, c => { c.moveTo(-7, -14); c.lineTo(-7, -150); c.lineTo(0, -162); c.lineTo(7, -150); c.lineTo(7, -14); c.closePath(); }, lin(g, -7, 0, 7, 0, [[0, '#8a9cad'], [0.5, '#f4fbff'], [1, '#7a8c9d']]), 1.4);
    stroke(g, [[0, -150], [0, -20]], 'rgba(120,170,220,0.7)', 1.2);
    ink(g, c => { c.moveTo(-26, -150); c.quadraticCurveTo(0, -140, 26, -150); c.lineTo(20, -158); c.quadraticCurveTo(0, -150, -20, -158); c.closePath(); }, lin(g, -26, 0, 26, 0, [[0, GOLD_DK], [0.5, GOLD_HI], [1, GOLD_DK]]), 1.4);
    ink(g, c => c.rect(-4, -192, 8, 36), '#4a1a1a', 1.3);
    for (let y = -188; y < -160; y += 6) stroke(g, [[-4, y], [4, y + 3]], GOLD, 1);
    ink(g, c => c.arc(0, -196, 6, 0, Math.PI * 2), lin(g, -6, -202, 6, -190, [[0, GOLD_HI], [1, GOLD_DK]]), 1.3);
    stroke(g, [[-40, -40], [-30, -130]], 'rgba(255,255,255,0.7)', 2.5);
    ink(g, c => c.ellipse(0, 0, 64, 12, 0, 0, Math.PI * 2), 'rgba(220,240,255,0.6)', 1.2);
  }

  // ------------------------------------------------------------------ vật phẩm thu thập
  const HERB_PAL = {
    linhthao: { leaf: ['#2f7a3a', '#7fe08a'], flower: '#ffffff', glow: '#7affd0' },
    bangtam: { leaf: ['#4a7a9a', '#bfe6ff'], flower: '#e8f6ff', glow: '#bfe6ff' },
    hoachi: { leaf: ['#6a1a10', '#ff8a4a'], flower: '#ffd27a', glow: '#ff9a3c' }
  };
  function drawHerb(g, v) {
    const P = HERB_PAL[v] || HERB_PAL.linhthao;
    if (v === 'hoachi') {
      for (const [x, y, r] of [[-8, -10, 10], [8, -16, 12], [0, -26, 9]]) {
        ink(g, c => { c.ellipse(x, y, r, r * 0.55, 0, Math.PI, 0); c.closePath(); }, lin(g, 0, y - r, 0, y, [[0, P.leaf[1]], [1, P.leaf[0]]]), 1.2);
        g.strokeStyle = 'rgba(255,220,150,0.7)'; g.lineWidth = 1;
        g.beginPath(); g.ellipse(x, y, r * 0.6, r * 0.32, 0, Math.PI, 0); g.stroke();
      }
      stroke(g, [[0, 0], [0, -10]], '#3a1a10', 2);
      return;
    }
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI / 2 + (i - 2.5) * 0.45;
      ink(g, c => c.ellipse(Math.cos(a) * 9, -6 + Math.sin(a) * 9, 3.5, 10, a + Math.PI / 2, 0, Math.PI * 2), lin(g, 0, -20, 0, 0, [[0, P.leaf[1]], [1, P.leaf[0]]]), 1);
    }
    stroke(g, [[0, -4], [0, -24]], P.leaf[0], 1.6);
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      ink(g, c => c.ellipse(Math.cos(a) * 3.5, -26 + Math.sin(a) * 3.5, 2.6, 4.2, a + Math.PI / 2, 0, Math.PI * 2), P.flower, 0.8);
    }
    dot(g, 0, -26, 1.8, GOLD_HI);
  }

  const ORE_PAL = { moc: '#7fe08a', hoa: '#ff7a2a', bang: '#9fe0ff' };
  function drawOre(g, v) {
    rockShape(g, 64, 44, { hi: '#7a8288', mid: '#4f565c', dark: '#2a2e33' }, U.seeded(3));
    const col = ORE_PAL[v] || ORE_PAL.moc;
    g.save(); g.translate(4, -18);
    crystalCluster(g, [rgba(col, 0.9), '#ffffff', col], U.seeded(8), 3, 22);
    g.restore();
    stroke(g, [[-22, -16], [-6, -24], [10, -14]], rgba(col, 0.9), 2);
  }

  function drawChest(g, v) {
    const open = v === 'open';
    ink(g, c => c.rect(-26, -30, 52, 30), lin(g, 0, -30, 0, 0, [[0, '#8a2e22'], [1, '#3a120e']]), 1.6);
    for (const x of [-18, 18]) ink(g, c => c.rect(x - 3, -30, 6, 30), lin(g, x - 3, 0, x + 3, 0, [[0, GOLD_DK], [0.5, GOLD_HI], [1, GOLD_DK]]), 1.1);
    if (open) {
      ink(g, c => c.rect(-24, -32, 48, 6), lin(g, 0, -32, 0, -26, [[0, '#fff2b0'], [1, '#e9b44c']]), 1.2);
      ink(g, c => { c.moveTo(-26, -32); c.lineTo(-22, -56); c.lineTo(22, -56); c.lineTo(26, -32); c.closePath(); }, lin(g, 0, -56, 0, -32, [[0, '#a8402e'], [1, '#5a1a14']]), 1.6);
    } else {
      ink(g, c => { c.moveTo(-28, -30); c.quadraticCurveTo(-26, -48, 0, -48); c.quadraticCurveTo(26, -48, 28, -30); c.closePath(); }, lin(g, 0, -48, 0, -30, [[0, '#b8483a'], [1, '#6a1e18']]), 1.6);
      for (const x of [-18, 18]) stroke(g, [[x, -31], [x, -46]], GOLD, 4);
      ink(g, c => c.rect(-6, -36, 12, 12), lin(g, -6, -36, 6, -24, [[0, GOLD_HI], [1, GOLD_DK]]), 1.2);
      dot(g, 0, -30, 1.8, LINE);
    }
  }

  function drawSpring(g, v) {
    ink(g, c => c.ellipse(0, 0, 56, 26, 0, 0, Math.PI * 2), stoneFill(g, -26, 26, JADE_STONE), 1.8);
    const full = v !== 'dry';
    const water = g.createRadialGradient(0, -4, 2, 0, 0, 46);
    water.addColorStop(0, full ? '#d8fff6' : '#4a5a58'); water.addColorStop(0.5, full ? '#4fd8c0' : '#2a3634'); water.addColorStop(1, full ? '#1a6a64' : '#1a2220');
    ink(g, c => c.ellipse(0, 0, 46, 19, 0, 0, Math.PI * 2), water, 1.4);
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; ink(g, c => c.ellipse(Math.cos(a) * 52, Math.sin(a) * 23, 7, 4, 0, 0, Math.PI * 2), STONE.mid, 1); }
  }

  // ------------------------------------------------------------------ bảng định nghĩa
  // w,h: kích thước canvas cache; ax,ay: điểm neo; col: vật cản (toạ độ tương đối);
  // lights: [dx,dy,bán kính,độ sáng]; occl: vùng làm mờ khi nhân vật đi phía sau; decal: vẽ sát nền.
  const C = (x, y, r) => ({ type: 'circle', x, y, r });
  const R = (x, y, w, h) => ({ type: 'rect', x, y, w, h });
  const DEFS = {
    main_hall: { w: 560, h: 340, ax: 280, ay: 330, draw: g => drawHall(g, { bw: 380, wh: 100, bays: 5, roof: ROOF.gold, double: true, plaque: '天劍殿', plaqueW: 96 }),
      col: [R(-215, -70, 430, 70)], occl: R(-260, -320, 520, 250), lights: [[-120, -40, 90, 0.4], [120, -40, 90, 0.4]] },
    alchemy_hall: { w: 360, h: 240, ax: 180, ay: 230, draw: g => drawHall(g, { bw: 230, wh: 84, bays: 3, roof: ROOF.slate, plaque: '丹房', chimney: true }),
      col: [R(-140, -60, 280, 60)], occl: R(-170, -220, 340, 170), emit: [{ type: 'smoke', x: 68, y: -168 }] },
    pagoda: { w: 240, h: 340, ax: 120, ay: 330, draw: drawPagoda, col: [R(-80, -50, 160, 50)], occl: R(-110, -320, 220, 260), lights: [[0, -40, 70, 0.4]] },
    sect_gate: { w: 380, h: 270, ax: 190, ay: 262, draw: drawGate, col: [C(-95, -6, 14), C(95, -6, 14), C(-150, -6, 13), C(150, -6, 13)], occl: R(-180, -250, 360, 120), noSort: false },
    sword_pavilion: { w: 260, h: 220, ax: 130, ay: 210, draw: drawSwordPavilion, col: [R(-86, -36, 172, 36)], occl: R(-120, -200, 240, 140),
      lights: [[0, -70, 80, 0.6]], glowColor: '#9fe8ff' },
    thunder_altar: { w: 240, h: 180, ax: 120, ay: 150, draw: drawThunderAltar, col: [C(0, -20, 64)], lights: [[0, -40, 120, 0.6]], glowColor: '#b48cff' },
    stone_lantern: { w: 50, h: 90, ax: 25, ay: 86, draw: drawStoneLantern, col: [C(0, -4, 12)], lights: [[0, -54, 90, 0.85]], flame: [0, -54] },
    stone_lion: { w: 70, h: 80, ax: 35, ay: 76, draw: drawStoneLion, col: [C(0, -6, 18)] },
    incense: { w: 70, h: 70, ax: 35, ay: 64, draw: drawIncense, col: [C(0, -6, 18)], emit: [{ type: 'incense', x: 0, y: -50 }], lights: [[0, -50, 40, 0.4]] },
    pine: { w: 180, h: 240, ax: 90, ay: 232, draw: drawPine, col: [C(0, -4, 14)], occl: R(-80, -230, 160, 150), variants: 3 },
    peach: { w: 160, h: 200, ax: 80, ay: 192, draw: drawPeach, col: [C(0, -4, 12)], occl: R(-70, -190, 140, 130), variants: 3, emit: [{ type: 'petal', x: 0, y: -130 }] },
    bamboo: { w: 100, h: 190, ax: 50, ay: 184, draw: drawBamboo, col: [C(0, -4, 14)], variants: 3 },
    rock_moss: { w: 90, h: 70, ax: 45, ay: 62, draw: drawRockMoss, col: [C(0, -10, 24)], variants: 3 },
    fence: { w: 150, h: 54, ax: 75, ay: 48, draw: drawFence, col: [R(-66, -10, 132, 12)] },
    banner: { w: 48, h: 196, ax: 16, ay: 190, draw: drawBannerPole, col: [C(0, -4, 8)], banner: true },
    lotus_pond: { w: 260, h: 130, ax: 130, ay: 65, draw: drawLotusPond, decal: true, col: [C(0, 0, 50), C(-62, 0, 40), C(62, 0, 40)], ripple: true },
    flower_bush: { w: 60, h: 44, ax: 30, ay: 38, draw: drawFlowerBush, variants: 4 },
    market_stall: { w: 170, h: 150, ax: 85, ay: 142, draw: drawStall, col: [R(-64, -30, 128, 30)], occl: R(-80, -140, 160, 100), lights: [[-48, -78, 60, 0.7]], flame: [-48, -78] },
    // Linh Mộc Lâm
    ancient_tree: { w: 320, h: 330, ax: 160, ay: 316, draw: drawAncientTree, col: [C(0, -6, 30)], occl: R(-140, -300, 280, 200), variants: 3,
      lights: [[0, -200, 120, 0.2]], emit: [{ type: 'spore', x: 0, y: -200 }] },
    glow_mushroom: { w: 60, h: 54, ax: 30, ay: 48, draw: drawGlowMushroom, lights: [[0, -18, 60, 0.6]], variants: 3, glowColor: '#4fe0c8' },
    fern: { w: 80, h: 56, ax: 40, ay: 48, draw: drawFern, variants: 3 },
    ruin_pillar: { w: 60, h: 130, ax: 30, ay: 122, draw: drawRuinPillar, col: [C(0, -6, 16)], variants: 3 },
    ruin_stele: { w: 70, h: 100, ax: 35, ay: 94, draw: drawRuinStele, col: [R(-26, -10, 52, 10)] },
    fortress_wall: { w: 280, h: 100, ax: 140, ay: 50, draw: drawFortressWall, col: [R(-128, -18, 256, 36)], occl: R(-138, -48, 276, 66) },
    fortress_wall_v: { w: 100, h: 280, ax: 50, ay: 140, draw: drawFortressWallVertical, col: [R(-18, -128, 36, 256)], occl: R(-48, -138, 66, 276) },
    fortress_tower: { w: 130, h: 160, ax: 65, ay: 154, draw: drawFortressTower, col: [C(0, -8, 34)], occl: R(-58, -150, 116, 130) },
    fortress_gate: { w: 360, h: 250, ax: 180, ay: 244, draw: drawFortressGate,
      col: [R(-145, -18, 103, 36), R(42, -18, 103, 36)], occl: R(-175, -232, 350, 190) },
    fortress_keep: { w: 440, h: 320, ax: 220, ay: 308, draw: drawFortressKeep, col: [R(-150, -45, 300, 45)], occl: R(-200, -290, 400, 250) },
    fortress_rubble: { w: 120, h: 70, ax: 60, ay: 56, draw: drawFortressRubble, col: [C(0, -8, 30)], variants: 4 },
    // Hỏa Diệm Cốc
    obsidian: { w: 100, h: 110, ax: 50, ay: 104, draw: drawObsidian, col: [C(0, -8, 24)], variants: 3, lights: [[0, -20, 70, 0.3]] },
    fire_crystal: { w: 70, h: 90, ax: 35, ay: 82, draw: drawFireCrystal, col: [C(0, -6, 14)], variants: 3, lights: [[0, -30, 110, 0.8]], glowColor: '#ff7a2a' },
    dead_tree: { w: 120, h: 150, ax: 60, ay: 144, draw: drawDeadTree, col: [C(0, -4, 10)], variants: 3 },
    lava_pool: { w: 210, h: 110, ax: 105, ay: 55, draw: drawLavaPool, decal: true, col: [C(0, 0, 36), C(-50, 0, 30), C(50, 0, 30)], lights: [[0, 0, 180, 0.9]], lava: true },
    ember_vent: { w: 80, h: 40, ax: 40, ay: 20, draw: drawEmberVent, decal: true, emit: [{ type: 'ember', x: 0, y: 0 }], lights: [[0, 0, 60, 0.5]] },
    // Huyền Băng Động
    ice_crystal: { w: 90, h: 100, ax: 45, ay: 94, draw: drawIceCrystal, col: [C(0, -6, 16)], variants: 3, lights: [[0, -30, 70, 0.35]], glowColor: '#9fe0ff' },
    frozen_pillar: { w: 70, h: 130, ax: 35, ay: 124, draw: drawFrozenPillar, col: [C(0, -6, 20)] },
    snow_drift: { w: 130, h: 50, ax: 65, ay: 40, draw: drawSnowDrift, decal: true, variants: 2 },
    frozen_sword: { w: 140, h: 222, ax: 70, ay: 208, draw: drawFrozenSword, col: [R(-52, -24, 104, 26)], occl: R(-60, -200, 120, 150), lights: [[0, -100, 140, 0.5]], glowColor: '#bfe6ff' },
    // Thu thập
    herb: { w: 50, h: 50, ax: 25, ay: 46, draw: drawHerb, lights: [[0, -16, 50, 0.6]], sparkle: true },
    ore: { w: 80, h: 70, ax: 40, ay: 62, draw: drawOre, col: [C(0, -8, 22)], lights: [[0, -24, 60, 0.5]], sparkle: true },
    chest: { w: 70, h: 64, ax: 35, ay: 58, draw: drawChest, col: [C(0, -10, 18)], lights: [[0, -30, 70, 0.6]], sparkle: true },
    spring: { w: 130, h: 70, ax: 65, ay: 35, draw: drawSpring, decal: true, col: [C(0, 0, 34)], lights: [[0, 0, 90, 0.6]], ripple: true }
  };

  const cache = {};
  /** Canvas cache của đạo cụ (kind, variant). */
  function sprite(kind, variant) {
    const key = kind + '|' + variant;
    if (cache[key]) return cache[key];
    const d = DEFS[kind];
    const c = TT.Art.canvas(d.w, d.h);
    const g = c.getContext('2d');
    g.lineJoin = 'round'; g.lineCap = 'round';
    g.translate(d.ax, d.ay);
    if (!d.decal) {
      const rx = Math.min(d.w * 0.34, 160);
      g.fillStyle = 'rgba(0,0,0,0.35)';
      g.beginPath(); g.ellipse(0, -2, rx, Math.max(5, rx * 0.22), 0, 0, Math.PI * 2); g.fill();
    }
    if (variant === 'flip') g.scale(-1, 1);
    d.draw(g, variant);
    return (cache[key] = c);
  }

  // ------------------------------------------------------------------ nền đất
  function scatterPatches(g, S, rnd, cols, n, rMin, rMax) {
    for (let i = 0; i < n; i++) {
      const x = rnd() * S, y = rnd() * S, r = rMin + rnd() * (rMax - rMin);
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      const col = cols[Math.floor(rnd() * cols.length)];
      gr.addColorStop(0, rgba(col, 0.6)); gr.addColorStop(1, rgba(col, 0));
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    }
  }

  function grassStrokes(g, S, rnd, n, cols) {
    for (let i = 0; i < n; i++) {
      const x = rnd() * S, y = rnd() * S;
      g.strokeStyle = cols[Math.floor(rnd() * cols.length)]; g.lineWidth = 1.2;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + (rnd() - 0.5) * 4, y - 4 - rnd() * 5); g.stroke();
    }
  }

  /** Lát đá cho 1 đoạn đường thẳng (dọc hoặc ngang). */
  function pavePath(g, x1, y1, x2, y2, w, rnd) {
    const horiz = Math.abs(x2 - x1) > Math.abs(y2 - y1);
    const len = horiz ? Math.abs(x2 - x1) : Math.abs(y2 - y1);
    const sx = Math.min(x1, x2), sy = Math.min(y1, y2);
    const ox = horiz ? sx : x1 - w / 2, oy = horiz ? y1 - w / 2 : sy;
    const W = horiz ? len : w, H = horiz ? w : len;
    g.fillStyle = 'rgba(10,16,14,0.55)'; g.fillRect(ox - 4, oy - 4, W + 8, H + 8);
    const tl = 30, tw = 22;
    for (let a = 0; a < (horiz ? W : H); a += tl) {
      for (let b = 0; b < (horiz ? H : W); b += tw) {
        const off = (Math.floor(a / tl) % 2) * tw / 2;
        const bx = horiz ? ox + a : ox + ((b + off) % W);
        const by = horiz ? oy + ((b + off) % H) : oy + a;
        const ww = horiz ? tl - 2 : Math.min(tw - 2, ox + W - bx), hh = horiz ? Math.min(tw - 2, oy + H - by) : tl - 2;
        if (ww <= 2 || hh <= 2) continue;
        const shade = 130 + Math.floor(rnd() * 30);
        g.fillStyle = `rgb(${shade - 12},${shade + 2},${shade - 6})`;
        g.fillRect(bx + 1, by + 1, ww, hh);
        g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(bx + 1, by + 1, ww, 2);
        if (rnd() < 0.25) { g.fillStyle = 'rgba(70,120,70,0.7)'; g.fillRect(bx + rnd() * ww, by + hh - 1, 4, 2); }
      }
    }
  }

  function pavePlaza(g, cx, cy, r, rnd) {
    g.fillStyle = 'rgba(10,16,14,0.6)'; g.beginPath(); g.arc(cx, cy, r + 6, 0, Math.PI * 2); g.fill();
    for (let rr = 0; rr < r; rr += 26) {
      const n = Math.max(6, Math.floor((rr + 13) * Math.PI * 2 / 34));
      for (let i = 0; i < n; i++) {
        const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2 - 0.03;
        const shade = 140 + Math.floor(rnd() * 28);
        g.fillStyle = `rgb(${shade - 14},${shade + 4},${shade - 4})`;
        g.beginPath(); g.arc(cx, cy, Math.min(r, rr + 24), a0, a1); g.arc(cx, cy, rr + 1, a1, a0, true); g.closePath(); g.fill();
      }
    }
    g.strokeStyle = 'rgba(233,180,76,0.5)'; g.lineWidth = 3;
    g.beginPath(); g.arc(cx, cy, r - 2, 0, Math.PI * 2); g.stroke();
  }

  /** Nền Tông Môn: cỏ xanh, đường lát đá, quảng trường tròn. layout: {plaza:[x,y,r], paths:[[x1,y1,x2,y2,w]]} (px) */
  function makeSectGround(S, layout, seed) {
    const c = TT.Art.canvas(S, S), g = c.getContext('2d'), rnd = U.seeded(seed);
    g.fillStyle = '#2b4636'; g.fillRect(0, 0, S, S);
    scatterPatches(g, S, rnd, ['#36583f', '#223a2c', '#467050', '#2f4f3a'], S * S / 2600, 30, 110);
    grassStrokes(g, S, rnd, S * S / 160, ['rgba(110,170,110,0.45)', 'rgba(70,130,90,0.45)', 'rgba(150,200,120,0.35)']);
    for (let i = 0; i < S * S / 5000; i++) dot(g, rnd() * S, rnd() * S, 1.4, ['#ffe0ea', '#fff3b0', '#c9b8ff'][Math.floor(rnd() * 3)]);
    for (const p of layout.paths) pavePath(g, p[0], p[1], p[2], p[3], p[4], rnd);
    if (layout.plaza) pavePlaza(g, layout.plaza[0], layout.plaza[1], layout.plaza[2], rnd);
    const vg = g.createRadialGradient(S / 2, S / 2, S * 0.35, S / 2, S / 2, S * 0.72);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(5,12,10,0.65)');
    g.fillStyle = vg; g.fillRect(0, 0, S, S);
    return { canvas: c, glows: [] };
  }

  /** Nền Bí Cảnh theo vùng. Trả về {canvas, glows:[[x,y]]} — điểm phát sáng (khe dung nham...). */
  function makeBiomeGround(S, ground, seed) {
    const c = TT.Art.canvas(S, S), g = c.getContext('2d'), rnd = U.seeded(seed);
    const glows = [];
    if (ground === 'linhmoc') {
      g.fillStyle = '#1f3328'; g.fillRect(0, 0, S, S);
      scatterPatches(g, S, rnd, ['#2b4a35', '#183024', '#355a3c', '#122019'], S * S / 2200, 30, 120);
      grassStrokes(g, S, rnd, S * S / 200, ['rgba(80,150,90,0.4)', 'rgba(50,110,70,0.4)']);
      for (let i = 0; i < S * S / 1400; i++) {
        g.fillStyle = ['rgba(140,90,40,0.55)', 'rgba(170,120,50,0.5)', 'rgba(70,120,60,0.6)'][Math.floor(rnd() * 3)];
        g.beginPath(); g.ellipse(rnd() * S, rnd() * S, 3 + rnd() * 2, 1.5, rnd() * 3, 0, Math.PI * 2); g.fill();
      }
      g.strokeStyle = 'rgba(40,26,16,0.6)'; g.lineWidth = 3;
      for (let i = 0; i < S / 60; i++) { let x = rnd() * S, y = rnd() * S; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 4; k++) { x += (rnd() - 0.5) * 70; y += (rnd() - 0.5) * 40; g.lineTo(x, y); } g.stroke(); }
      for (let i = 0; i < S * S / 9000; i++) dot(g, rnd() * S, rnd() * S, 1.3, 'rgba(140,255,210,0.55)');
    } else if (ground === 'hoadiem') {
      g.fillStyle = '#3a2a26'; g.fillRect(0, 0, S, S);
      scatterPatches(g, S, rnd, ['#4a3029', '#261a1a', '#5a3426', '#30221f'], S * S / 2200, 30, 120);
      for (let i = 0; i < S * S / 900; i++) dot(g, rnd() * S, rnd() * S, 1 + rnd(), 'rgba(140,130,130,0.25)');
      for (let i = 0; i < S / 45; i++) {
        let x = rnd() * S, y = rnd() * S;
        const pts = [[x, y]];
        for (let k = 0; k < 6; k++) { x += (rnd() - 0.5) * 80; y += (rnd() - 0.5) * 50; pts.push([x, y]); }
        for (const [lw, col] of [[9, 'rgba(255,60,20,0.25)'], [3.5, '#ff6a1a'], [1.4, '#ffd27a']]) {
          g.strokeStyle = col; g.lineWidth = lw; g.lineJoin = 'round';
          g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (const p of pts) g.lineTo(p[0], p[1]); g.stroke();
        }
        glows.push(pts[3]);
      }
    } else if (ground === 'thanh_luy') {
      g.fillStyle = '#37362f'; g.fillRect(0, 0, S, S);
      scatterPatches(g, S, rnd, ['#514b3d', '#302f2a', '#625a47', '#272a29'], S * S / 2600, 35, 150);
      const tile = 42;
      for (let y = 0; y < S; y += tile) {
        const row = Math.floor(y / tile);
        const off = row % 2 ? tile / 2 : 0;
        for (let x = -tile; x < S; x += tile) {
          const xx = x + off, shade = 76 + Math.floor(rnd() * 26);
          g.fillStyle = `rgb(${shade},${shade - 2},${shade - 9})`;
          g.fillRect(xx + 2, y + 2, tile - 4, tile - 4);
          g.fillStyle = 'rgba(225,205,158,0.08)'; g.fillRect(xx + 3, y + 3, tile - 6, 2);
          if (rnd() < 0.09) {
            g.strokeStyle = 'rgba(18,20,19,0.7)'; g.lineWidth = 1.5;
            g.beginPath(); g.moveTo(xx + 8, y + 9); g.lineTo(xx + 15, y + 17); g.lineTo(xx + 12, y + 26); g.stroke();
          }
        }
      }
      g.strokeStyle = 'rgba(225,190,120,0.22)'; g.lineWidth = 8;
      g.strokeRect(S * 0.25, S * 0.25, S * 0.5, S * 0.5);
      g.strokeStyle = 'rgba(15,18,18,0.5)'; g.lineWidth = 2;
      g.strokeRect(S * 0.25, S * 0.25, S * 0.5, S * 0.5);
      pavePath(g, S / 2, S * 0.75, S / 2, S * 0.18, 118, rnd);
      pavePlaza(g, S / 2, S / 2 + S * 0.1, 190, rnd);
      for (let i = 0; i < S * S / 1800; i++) {
        const x = rnd() * S, y = rnd() * S;
        if (rnd() < 0.55) dot(g, x, y, 1 + rnd() * 2, 'rgba(210,190,140,0.28)');
      }
    } else {
      g.fillStyle = '#6f8aa0'; g.fillRect(0, 0, S, S);
      scatterPatches(g, S, rnd, ['#8fb0c6', '#5a7488', '#a8c8dc', '#62809a'], S * S / 2200, 30, 120);
      g.strokeStyle = 'rgba(240,250,255,0.35)'; g.lineWidth = 1;
      for (let i = 0; i < S / 14; i++) {
        let x = rnd() * S, y = rnd() * S;
        for (let k = 0; k < 5; k++) { const nx = x + (rnd() - 0.5) * 30, ny = y + (rnd() - 0.5) * 30; g.beginPath(); g.moveTo(x, y); g.lineTo(nx, ny); g.stroke(); x = nx; y = ny; }
      }
      for (let i = 0; i < S * S / 600; i++) dot(g, rnd() * S, rnd() * S, 0.8 + rnd(), 'rgba(255,255,255,0.5)');
    }
    const vg = g.createRadialGradient(S / 2, S / 2, S * 0.3, S / 2, S / 2, S * 0.75);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.5)');
    g.fillStyle = vg; g.fillRect(0, 0, S, S);
    return { canvas: c, glows };
  }

  // ------------------------------------------------------------------ vẽ lúc chạy
  function drawBanner(ctx, p, t) {
    const x0 = p.x + 2, y0 = p.y - 160, w = 22, h = 92, segs = 12;
    const phase = t * 3 + p.seed;
    const off = k => Math.sin(phase + k * 0.5) * 3 * k;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    for (let k = 0; k <= segs; k++) ctx.lineTo(x0 + off(k / segs) * 0.4, y0 + (h * k) / segs);
    ctx.lineTo(x0 + w * 0.5 + off(1), y0 + h + 10);
    for (let k = segs; k >= 0; k--) ctx.lineTo(x0 + w + off(k / segs), y0 + (h * k) / segs);
    ctx.closePath();
    ctx.fillStyle = lin(ctx, x0, 0, x0 + w, 0, [[0, '#7a1616'], [0.5, '#c8343c'], [1, '#7a1616']]);
    ctx.fill(); ctx.strokeStyle = GOLD; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = GOLD_HI; ctx.font = `bold 15px ${PLAQUE_FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(p.text || '劍', x0 + w / 2 + off(0.4), y0 + 30);
  }

  /** Vẽ đạo cụ. alpha < 1 khi nhân vật đi phía sau. */
  function draw(ctx, p, t, alpha) {
    const d = DEFS[p.kind];
    const img = sprite(p.kind, p.variant);
    ctx.save();
    if (alpha < 1) ctx.globalAlpha = alpha;
    ctx.drawImage(img, Math.round(p.x - d.ax), Math.round(p.y - d.ay));
    ctx.restore();
    if (d.banner) drawBanner(ctx, p, t);
    const A = TT.Art;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    if (d.flame) {
      const f = 0.75 + Math.sin(t * 13 + p.seed) * 0.12 + Math.sin(t * 7.3 + p.seed) * 0.1;
      A.glow(ctx, p.x + d.flame[0], p.y + d.flame[1], 22 * f, '#ffb347', 0.8);
      A.glow(ctx, p.x + d.flame[0], p.y + d.flame[1], 7, '#fff2c0', 0.9);
    }
    if (d.glowColor) A.glow(ctx, p.x, p.y - d.ay * 0.35, d.ay * 0.55, d.glowColor, 0.18 + Math.sin(t * 2.4 + p.seed) * 0.08);
    if (d.lava) {
      for (let i = 0; i < 4; i++) {
        const ph = (t * 0.7 + i / 4 + p.seed) % 1;
        A.glow(ctx, p.x - 50 + i * 32 + Math.sin(p.seed + i) * 8, p.y - 8 + i % 2 * 12, 8 + ph * 8, '#fff2a0', 0.6 * (1 - ph));
      }
      A.glow(ctx, p.x, p.y, 90, '#ff6a1a', 0.25 + Math.sin(t * 2) * 0.08);
    }
    if (d.ripple && !p.depleted) {
      for (let i = 0; i < 2; i++) {
        const ph = (t * 0.45 + i * 0.5 + p.seed) % 1;
        ctx.strokeStyle = rgba(p.kind === 'spring' ? '#bffff0' : '#d8fff6', 0.35 * (1 - ph));
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.ellipse(p.x + Math.sin(p.seed + i) * 30, p.y + Math.cos(p.seed + i) * 8, 6 + ph * 24, (6 + ph * 24) * 0.4, 0, 0, Math.PI * 2); ctx.stroke();
      }
      if (p.kind === 'spring') A.glow(ctx, p.x, p.y, 50, '#4fd8c0', 0.35 + Math.sin(t * 2) * 0.1);
    }
    if (d.sparkle && !p.depleted) {
      const col = p.kind === 'chest' ? '#ffe39a' : p.kind === 'ore' ? (ORE_PAL[p.variant] || '#ffffff') : (HERB_PAL[p.variant] || HERB_PAL.linhthao).glow;
      A.glow(ctx, p.x, p.y - d.ay * 0.45, 26 + Math.sin(t * 3 + p.seed) * 5, col, 0.35);
      for (let i = 0; i < 3; i++) {
        const ph = (t * 0.8 + i / 3 + p.seed) % 1;
        A.glow(ctx, p.x + Math.sin(i * 2.1 + p.seed) * 14, p.y - 8 - ph * 34, 3, '#ffffff', Math.sin(ph * Math.PI) * 0.9);
      }
    }
    ctx.restore();
  }

  /** Ánh sáng tạo ra bởi đạo cụ: [[x,y,r,a]] */
  function lights(p) {
    const d = DEFS[p.kind];
    if (!d.lights || p.depleted) return [];
    return d.lights.map(([dx, dy, r, a]) => [p.x + dx, p.y + dy, r, a]);
  }

  /** Sinh hạt hiệu ứng (khói, cánh hoa, tàn lửa, bào tử). push(particle) */
  function emit(p, dt, push) {
    const d = DEFS[p.kind];
    if (!d.emit) return;
    for (const e of d.emit) {
      const x = p.x + e.x, y = p.y + e.y;
      if (e.type === 'smoke' && Math.random() < dt * 5) push({ x: x + U.rand(-4, 4), y, vx: U.rand(-4, 10), vy: U.rand(-26, -16), life: 3.2, max: 3.2, color: '#c8ccd4', size: U.rand(5, 9), add: false, grow: 6 });
      else if (e.type === 'incense' && Math.random() < dt * 4) push({ x: x + U.rand(-5, 5), y, vx: U.rand(-3, 3), vy: U.rand(-18, -10), life: 2.4, max: 2.4, color: '#e6e0f0', size: U.rand(2, 3.5), add: false, grow: 3 });
      else if (e.type === 'petal' && Math.random() < dt * 1.6) push({ x: x + U.rand(-60, 60), y: y + U.rand(-30, 30), vx: U.rand(8, 22), vy: U.rand(10, 22), life: 4, max: 4, color: '#f5a8c4', size: 2.2, add: false, petal: true, spin: Math.random() * 6 });
      else if (e.type === 'ember' && Math.random() < dt * 8) push({ x: x + U.rand(-20, 20), y, vx: U.rand(-8, 8), vy: U.rand(-60, -30), life: 1.4, max: 1.4, color: '#ffb04a', size: 1.6, add: true, drift: true });
      else if (e.type === 'spore' && Math.random() < dt * 2) push({ x: x + U.rand(-90, 90), y: y + U.rand(-30, 60), vx: U.rand(-6, 6), vy: U.rand(-10, 4), life: 3, max: 3, color: '#a0ffe0', size: 1.5, add: true, drift: true });
    }
  }

  TT.Env = {
    DEFS, sprite, draw, lights, emit, makeSectGround, makeBiomeGround,
    /** Bút vẽ dùng chung cho các module vẽ tay khác (yêu thú...). */
    paint: { lin, ink, stroke, dot, LINE },
    has(kind) { return !!DEFS[kind]; },
    /** Biến thể mặc định ngẫu nhiên cho đạo cụ có nhiều kiểu. */
    randomVariant(kind) { const n = DEFS[kind].variants; return n ? Math.floor(Math.random() * n) : 0; }
  };
})(window.TT);
