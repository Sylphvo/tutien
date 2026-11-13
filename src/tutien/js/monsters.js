window.TT = window.TT || {};

/**
 * TT.Monsters — yêu thú vẽ theo nét tranh tay (viền mực, tô chuyển sắc), cùng phong cách kiếm tu.
 * Mỗi loài được dựng sẵn thành dải 6 frame chuyển động (vẽ gấp đôi, hiển thị 0.5x),
 * kèm bản trắng để chớp khi trúng đòn. Lúc chạy chỉ vẽ thêm mắt phát sáng và hào quang.
 * Thay thế TT.Art.drawEnemy (giữ nguyên chữ ký hàm).
 */
(function (TT) {
  'use strict';
  const { lin, ink, stroke, dot, LINE } = TT.Env.paint;
  const FRAMES = 6;
  const SCALE = 2;
  const TAU = Math.PI * 2;

  // ------------------------------------------------------------------ bảng màu
  const WOLF = { fur: '#2e3450', furHi: '#5f6a90', furDk: '#12141f', belly: 'rgba(14,16,26,0.45)', eye: '#ff3b3b', mane: '#1a1d2c', claw: '#d8d0c0', mouth: '#5a1414', boss: false };
  const BOSS = { fur: '#6a1e28', furHi: '#c0505a', furDk: '#26080e', belly: 'rgba(30,6,10,0.5)', eye: '#ffdd33', mane: '#eadfca', claw: '#fff2d0', mouth: '#2a0606', boss: true };
  const CENT = { shell: '#2f5a2a', shellHi: '#8fd05a', shellDk: '#0c1f0e', spot: '#d6ff5a', leg: '#1a2a12' };
  const GOLEM = { hi: '#a6b4c4', mid: '#5c6878', dark: '#262d38', rune: '#5ff0ff', moss: 'rgba(84,150,86,0.85)' };

  // ------------------------------------------------------------------ Hắc Lang / Huyết Lang Vương
  function wolfLeg(g, R, bx, by, ph, off, col, thin) {
    const k = thin || 1;
    const a = Math.sin(ph + off) * 0.55;
    const lift = Math.max(0, Math.cos(ph + off)) * 0.16 * R;
    const fx = bx + Math.sin(a) * R * 0.5, fy = -lift;
    const kx = bx + Math.sin(a) * R * 0.18 - 0.06 * R, ky = by + (fy - by) * 0.5;
    g.lineCap = 'round'; g.lineJoin = 'round';
    stroke(g, [[bx, by], [kx, ky], [fx, fy - 0.05 * R]], LINE, 0.27 * R * k);
    stroke(g, [[bx, by], [kx, ky], [fx, fy - 0.05 * R]], col, 0.19 * R * k);
    ink(g, c => c.ellipse(fx + 0.07 * R, fy - 0.05 * R, 0.13 * R * k, 0.065 * R * k, 0, 0, TAU), col, 0.04 * R);
  }

  function drawWolf(g, R, ph, P) {
    P = P || WOLF;
    const bob = Math.sin(ph * 2) * 0.04 * R;
    const tw = Math.sin(ph) * 0.15 * R;
    const lw = 0.045 * R;
    // đuôi
    ink(g, c => {
      c.moveTo(-0.85 * R, -0.95 * R + bob);
      c.quadraticCurveTo(-1.45 * R, -1.3 * R + tw, -1.68 * R, -0.86 * R + tw);
      c.quadraticCurveTo(-1.35 * R, -0.96 * R + tw * 0.5, -0.8 * R, -0.72 * R + bob); c.closePath();
    }, lin(g, -1.6 * R, -1.3 * R, -0.8 * R, -0.7 * R, [[0, P.furHi], [1, P.furDk]]), lw);
    // chân xa
    wolfLeg(g, R, -0.55 * R, -0.72 * R + bob, ph, Math.PI, P.furDk);
    wolfLeg(g, R, 0.62 * R, -0.72 * R + bob, ph, 0, P.furDk);
    // thân
    ink(g, c => {
      c.moveTo(-0.95 * R, -0.85 * R + bob);
      c.quadraticCurveTo(-0.9 * R, -1.3 * R + bob, -0.3 * R, -1.28 * R + bob);
      c.quadraticCurveTo(0.4 * R, -1.44 * R + bob, 0.86 * R, -1.26 * R + bob);
      c.quadraticCurveTo(1.06 * R, -0.85 * R + bob, 0.75 * R, -0.62 * R + bob);
      c.quadraticCurveTo(0, -0.5 * R + bob, -0.7 * R, -0.6 * R + bob);
      c.quadraticCurveTo(-1.0 * R, -0.65 * R + bob, -0.95 * R, -0.85 * R + bob); c.closePath();
    }, lin(g, 0, -1.44 * R, 0, -0.5 * R, [[0, P.furHi], [0.45, P.fur], [1, P.furDk]]), lw);
    g.fillStyle = P.belly;
    g.beginPath(); g.ellipse(0, -0.68 * R + bob, 0.7 * R, 0.14 * R, 0, 0, TAU); g.fill();
    // bờm gai dọc sống lưng
    for (let i = 0; i < 8; i++) {
      const x = -0.62 * R + i * 0.2 * R, y = -1.28 * R - Math.sin((i / 7) * Math.PI) * 0.1 * R + bob;
      const tall = (P.boss ? 0.34 : 0.2) * R + (i > 3 ? 0.07 * R : 0);
      ink(g, c => { c.moveTo(x - 0.06 * R, y + 0.04 * R); c.lineTo(x - 0.16 * R, y - tall); c.lineTo(x + 0.1 * R, y + 0.02 * R); c.closePath(); }, P.boss ? P.mane : P.furDk, lw * 0.7);
    }
    // vệt lông sáng
    g.strokeStyle = TT.Art.rgba(P.furHi, 0.7); g.lineWidth = 0.035 * R;
    for (let i = 0; i < 5; i++) {
      const x = -0.6 * R + i * 0.3 * R, y = -1.1 * R + bob;
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 0.12 * R, y + 0.1 * R, x + 0.06 * R, y + 0.24 * R); g.stroke();
    }
    if (P.boss) for (let i = 0; i < 3; i++) stroke(g, [[-0.3 * R + i * 0.14 * R, -1.15 * R + bob], [-0.42 * R + i * 0.14 * R, -0.82 * R + bob]], '#ff6a5a', 0.03 * R);
    // chân gần
    wolfLeg(g, R, -0.45 * R, -0.7 * R + bob, ph, Math.PI + 1.1, P.fur);
    wolfLeg(g, R, 0.72 * R, -0.7 * R + bob, ph, 1.0, P.fur);
    // đầu
    const hx = 1.0 * R, hy = -1.3 * R + bob + Math.sin(ph * 2 + 1) * 0.02 * R;
    const jaw = (Math.sin(ph * 2) * 0.5 + 0.5) * 0.06 * R;
    ink(g, c => { c.moveTo(hx - 0.22 * R, hy - 0.2 * R); c.lineTo(hx - 0.36 * R, hy - 0.62 * R); c.lineTo(hx - 0.04 * R, hy - 0.3 * R); c.closePath(); }, P.furDk, lw);
    if (P.boss) {
      for (const k of [0, 1]) {
        const ox = -k * 0.14 * R;
        ink(g, c => { c.moveTo(hx - 0.1 * R + ox, hy - 0.28 * R); c.quadraticCurveTo(hx - 0.25 * R + ox, hy - 0.9 * R, hx - 0.62 * R + ox, hy - 0.82 * R); c.quadraticCurveTo(hx - 0.32 * R + ox, hy - 0.72 * R, hx - 0.22 * R + ox, hy - 0.24 * R); c.closePath(); },
          lin(g, 0, hy - 0.9 * R, 0, hy - 0.2 * R, [[0, '#fff6e0'], [1, '#a89a80']]), lw * 0.8);
      }
    }
    ink(g, c => {
      c.moveTo(hx + 0.1 * R, hy + 0.16 * R); c.lineTo(hx + 0.56 * R, hy + 0.08 * R + jaw);
      c.quadraticCurveTo(hx + 0.3 * R, hy + 0.32 * R + jaw, hx - 0.05 * R, hy + 0.28 * R); c.closePath();
    }, P.furDk, lw);
    ink(g, c => { c.moveTo(hx + 0.12 * R, hy + 0.12 * R); c.lineTo(hx + 0.58 * R, hy + 0.03 * R); c.lineTo(hx + 0.52 * R, hy + 0.08 * R + jaw); c.closePath(); }, P.mouth, 0);
    ink(g, c => {
      c.moveTo(hx - 0.35 * R, hy);
      c.quadraticCurveTo(hx - 0.3 * R, hy - 0.38 * R, hx + 0.1 * R, hy - 0.32 * R);
      c.quadraticCurveTo(hx + 0.35 * R, hy - 0.28 * R, hx + 0.62 * R, hy - 0.08 * R);
      c.lineTo(hx + 0.64 * R, hy + 0.02 * R);
      c.quadraticCurveTo(hx + 0.3 * R, hy + 0.06 * R, hx + 0.12 * R, hy + 0.14 * R);
      c.quadraticCurveTo(hx - 0.15 * R, hy + 0.3 * R, hx - 0.35 * R, hy); c.closePath();
    }, lin(g, 0, hy - 0.38 * R, 0, hy + 0.2 * R, [[0, P.furHi], [1, P.fur]]), lw);
    for (const fx of [0.5, 0.3]) ink(g, c => { c.moveTo(fx * R + hx - 0.04 * R, hy + 0.05 * R); c.lineTo(fx * R + hx, hy + 0.16 * R); c.lineTo(fx * R + hx + 0.04 * R, hy + 0.04 * R); c.closePath(); }, P.claw, lw * 0.5);
    dot(g, hx + 0.63 * R, hy - 0.03 * R, 0.05 * R, LINE);
    g.save(); g.translate(hx + 0.13 * R, hy - 0.15 * R); g.rotate(-0.3);
    ink(g, c => c.ellipse(0, 0, 0.09 * R, 0.042 * R, 0, 0, TAU), P.eye, lw * 0.6);
    ink(g, c => c.ellipse(0.01 * R, 0, 0.015 * R, 0.035 * R, 0, 0, TAU), LINE, 0);
    g.restore();
    ink(g, c => { c.moveTo(hx - 0.08 * R, hy - 0.26 * R); c.lineTo(hx - 0.14 * R, hy - 0.62 * R); c.lineTo(hx + 0.1 * R, hy - 0.3 * R); c.closePath(); }, P.fur, lw);
    ink(g, c => { c.moveTo(hx - 0.06 * R, hy - 0.3 * R); c.lineTo(hx - 0.11 * R, hy - 0.52 * R); c.lineTo(hx + 0.04 * R, hy - 0.32 * R); c.closePath(); }, P.mouth, 0);
  }

  // ------------------------------------------------------------------ Độc Trùng
  function drawCentipede(g, R, ph) {
    const P = CENT, n = 6, lw = 0.05 * R;
    const segs = [];
    for (let i = 0; i < n; i++) {
      segs.push({ x: -1.1 * R + i * 0.42 * R, y: -0.42 * R + Math.sin(ph * 2 - i * 0.9) * 0.1 * R, r: R * (0.27 + i * 0.03) });
    }
    const legsFor = near => {
      segs.slice(0, n - 1).forEach((s, i) => {
        const sw = Math.sin(ph * 2 - i * 0.9 + (near ? 0 : Math.PI)) * 0.12 * R;
        const pts = [[s.x, s.y + 0.05 * R], [s.x + sw * 0.5 + (near ? 0.05 : -0.05) * R, s.y + 0.22 * R], [s.x + sw, 0]];
        stroke(g, pts, LINE, 0.09 * R);
        stroke(g, pts, near ? P.leg : '#0a140a', 0.05 * R);
      });
    };
    legsFor(false);
    // đuôi kim
    const t0 = segs[0];
    for (const dy of [-0.08, 0.08]) ink(g, c => { c.moveTo(t0.x - t0.r * 0.6, t0.y + dy * R * 0.5); c.lineTo(t0.x - t0.r * 1.6, t0.y + dy * R * 2.2 - 0.06 * R); c.lineTo(t0.x - t0.r * 0.4, t0.y + dy * R); c.closePath(); }, P.shellDk, lw * 0.7);
    for (let i = 0; i < n; i++) {
      const s = segs[i];
      ink(g, c => c.ellipse(s.x, s.y, s.r * 1.12, s.r, 0, 0, TAU), lin(g, 0, s.y - s.r, 0, s.y + s.r, [[0, P.shellHi], [0.5, P.shell], [1, P.shellDk]]), lw);
      stroke(g, [[s.x - s.r * 0.2, s.y - s.r * 0.95], [s.x - s.r * 0.35, s.y + s.r * 0.8]], 'rgba(10,30,10,0.55)', 0.035 * R);
      if (i < n - 1) for (const k of [-0.35, 0.3]) dot(g, s.x + s.r * k, s.y - s.r * 0.35, 0.06 * R, P.spot);
    }
    const h = segs[n - 1];
    const ant = Math.sin(ph * 2) * 0.1 * R;
    for (const k of [0, 1]) {
      g.strokeStyle = LINE; g.lineWidth = 0.035 * R;
      g.beginPath(); g.moveTo(h.x + h.r * 0.3, h.y - h.r * 0.8);
      g.quadraticCurveTo(h.x + h.r * (0.8 + k * 0.3), h.y - h.r * 2.4 + ant, h.x + h.r * (1.9 + k * 0.4), h.y - h.r * (2.2 - k * 0.5) - ant); g.stroke();
    }
    for (const sy of [-1, 1]) {
      ink(g, c => {
        c.moveTo(h.x + h.r * 0.8, h.y + sy * 0.06 * R);
        c.quadraticCurveTo(h.x + h.r * 1.7, h.y + sy * 0.2 * R, h.x + h.r * 1.75, h.y + sy * 0.02 * R);
        c.quadraticCurveTo(h.x + h.r * 1.4, h.y + sy * 0.1 * R, h.x + h.r * 0.9, h.y + sy * 0.12 * R); c.closePath();
      }, '#c8b47a', lw * 0.6);
    }
    dot(g, h.x + h.r * 0.45, h.y - h.r * 0.35, 0.07 * R, P.spot);
    dot(g, h.x + h.r * 0.2, h.y - h.r * 0.45, 0.06 * R, P.spot);
  }

  // ------------------------------------------------------------------ Quỷ Hỏa
  function flameShape(g, R, base, s, ph, wild) {
    g.beginPath();
    g.moveTo(-0.72 * R * s, base + 0.2 * R * s);
    for (let i = 0; i < 5; i++) {
      const tx = (-0.55 + i * 0.275) * R * s;
      const ty = base - R * s * (0.75 + 0.3 * Math.sin(ph + i * 1.7) * wild) - (i === 2 ? 0.32 * R * s : 0);
      g.quadraticCurveTo(tx - 0.12 * R * s, base - 0.3 * R * s, tx, ty);
      g.quadraticCurveTo(tx + 0.1 * R * s, base - 0.35 * R * s, tx + 0.14 * R * s, base - 0.25 * R * s);
    }
    g.quadraticCurveTo(0.85 * R * s, base + 0.1 * R * s, 0.6 * R * s, base + 0.45 * R * s);
    g.quadraticCurveTo(0, base + 0.82 * R * s, -0.6 * R * s, base + 0.45 * R * s);
    g.closePath();
  }

  function drawWisp(g, R, ph) {
    const bob = Math.sin(ph) * 0.12 * R, base = -1.15 * R + bob;
    // đuôi lửa
    ink(g, c => { c.moveTo(-0.3 * R, base + 0.5 * R); c.quadraticCurveTo(-0.1 * R + Math.sin(ph) * 0.1 * R, base + 1.0 * R, 0.15 * R + Math.sin(ph + 1) * 0.12 * R, base + 1.05 * R); c.quadraticCurveTo(0.1 * R, base + 0.7 * R, 0.3 * R, base + 0.5 * R); c.closePath(); }, 'rgba(255,122,42,0.75)', 0);
    flameShape(g, R, base, 1.15, ph, 1);
    g.fillStyle = 'rgba(176,36,20,0.85)'; g.fill();
    g.strokeStyle = '#5a0e08'; g.lineWidth = 0.04 * R; g.stroke();
    flameShape(g, R, base, 0.95, ph + 0.7, 0.8); g.fillStyle = '#ff7a2a'; g.fill();
    flameShape(g, R, base, 0.62, ph + 1.4, 0.6); g.fillStyle = '#ffd27a'; g.fill();
    // lõi đầu lâu
    const gr = g.createRadialGradient(0, base - 0.1 * R, 0.05 * R, 0.05 * R, base, 0.5 * R);
    gr.addColorStop(0, '#6a2448'); gr.addColorStop(1, '#1a0412');
    ink(g, c => c.ellipse(0.05 * R, base, 0.42 * R, 0.45 * R, 0, 0, TAU), gr, 0.05 * R);
    for (const ex of [-0.08, 0.22]) {
      ink(g, c => c.ellipse(ex * R, base - 0.08 * R, 0.1 * R, 0.13 * R, 0, 0, TAU), '#ff9a3c', 0.03 * R);
      dot(g, ex * R + 0.02 * R, base - 0.1 * R, 0.035 * R, '#fff2c0');
    }
    stroke(g, [[-0.14 * R, base + 0.2 * R], [-0.06 * R, base + 0.15 * R], [0.02 * R, base + 0.22 * R], [0.1 * R, base + 0.15 * R], [0.18 * R, base + 0.22 * R], [0.26 * R, base + 0.16 * R]], '#ff9a3c', 0.04 * R);
    for (let k = 0; k < 3; k++) {
      const a = ph + k * 2.1;
      dot(g, Math.cos(a) * 0.85 * R, base + Math.sin(a) * 0.4 * R, 0.07 * R, '#ffd27a');
    }
  }

  // ------------------------------------------------------------------ Thạch Ma
  function rock(g, cx, cy, r, seed, fill, lw) {
    ink(g, c => {
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU + seed, rr = r * (0.82 + ((i * 37 + seed * 13) % 7) / 24);
        const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr * 0.92;
        i ? c.lineTo(x, y) : c.moveTo(x, y);
      }
      c.closePath();
    }, fill, lw);
  }

  function drawGolem(g, R, ph, P) {
    P = P || GOLEM;
    const sway = Math.sin(ph) * 0.06 * R, step = Math.sin(ph), lw = 0.045 * R;
    const sf = (y0, y1, dark) => lin(g, 0, y0, 0, y1, dark ? [[0, P.mid], [1, '#141820']] : [[0, P.hi], [0.45, P.mid], [1, P.dark]]);
    for (const [x, l] of [[-0.36 * R + step * 0.12 * R, Math.max(0, step)], [0.36 * R - step * 0.12 * R, Math.max(0, -step)]]) {
      rock(g, x, -0.24 * R - l * 0.08 * R, 0.3 * R, x, sf(-0.55 * R, 0), lw);
    }
    rock(g, -0.88 * R, -1.05 * R + sway, 0.24 * R, 1, sf(-1.3 * R, -0.8 * R, true), lw);
    rock(g, -0.98 * R + step * 0.15 * R, -0.6 * R + sway, 0.36 * R, 2, sf(-1 * R, -0.25 * R, true), lw);
    rock(g, 0, -1.12 * R + sway, 0.82 * R, 0.4, sf(-1.95 * R, -0.3 * R), lw);
    // vân linh khí
    for (const [col, w] of [[TT.Art.rgba(P.rune, 0.45), 0.12 * R], [P.rune, 0.05 * R], [P.core || '#e8ffff', 0.018 * R]]) {
      stroke(g, [[-0.45 * R, -1.45 * R + sway], [-0.18 * R, -1.2 * R + sway], [-0.3 * R, -0.95 * R + sway], [0.05 * R, -0.75 * R + sway]], col, w);
      stroke(g, [[0.4 * R, -1.5 * R + sway], [0.25 * R, -1.25 * R + sway], [0.45 * R, -1.0 * R + sway]], col, w);
      g.strokeStyle = col; g.lineWidth = w;
      g.beginPath(); g.arc(0.05 * R, -1.15 * R + sway, 0.16 * R, 0, TAU); g.stroke();
    }
    g.fillStyle = P.moss;
    g.beginPath(); g.ellipse(-0.3 * R, -1.82 * R + sway, 0.3 * R, 0.08 * R, -0.2, 0, TAU); g.fill();
    for (const sx of [-1, 1]) {
      rock(g, sx * 0.68 * R, -1.68 * R + sway, 0.3 * R, sx + 3, sf(-2 * R, -1.4 * R), lw);
      g.fillStyle = P.moss; g.beginPath(); g.ellipse(sx * 0.68 * R, -1.9 * R + sway, 0.18 * R, 0.06 * R, 0, 0, TAU); g.fill();
    }
    rock(g, 0.15 * R, -1.98 * R + sway, 0.28 * R, 5, sf(-2.25 * R, -1.75 * R), lw);
    stroke(g, [[-0.05 * R, -2.06 * R + sway], [0.38 * R, -2.08 * R + sway]], '#141820', 0.06 * R);
    for (const ex of [0.12, 0.3]) ink(g, c => c.ellipse(ex * R, -1.98 * R + sway, 0.06 * R, 0.028 * R, 0, 0, TAU), P.rune, 0);
    rock(g, 0.86 * R, -1.05 * R + sway, 0.24 * R, 6, sf(-1.3 * R, -0.8 * R), lw);
    rock(g, 0.98 * R - step * 0.15 * R, -0.6 * R + sway, 0.38 * R, 7, sf(-1 * R, -0.25 * R), lw);
    stroke(g, [[0.85 * R - step * 0.15 * R, -0.75 * R + sway], [1.1 * R - step * 0.15 * R, -0.5 * R + sway]], TT.Art.rgba(P.rune, 0.8), 0.04 * R);
    if (P.boss) {
      for (const sx of [-1, 1]) {
        rock(g, sx * 0.86 * R, -2.05 * R + sway, 0.26 * R, sx * 4, sf(-2.35 * R, -1.8 * R), lw);
      }
      rock(g, 0.12 * R, -2.32 * R + sway, 0.26 * R, 9, sf(-2.6 * R, -2.05 * R), lw);
      for (const [col, w] of [[TT.Art.rgba(P.rune, 0.5), 0.1 * R], [P.core || '#fff3c2', 0.022 * R]]) {
        stroke(g, [[-0.12 * R, -2.25 * R + sway], [0.12 * R, -2.38 * R + sway], [0.35 * R, -2.22 * R + sway]], col, w);
      }
    }
  }

  // ------------------------------------------------------------------ Mộc Yêu
  function drawTreant(g, R, ph) {
    const lw = 0.045 * R, sway = Math.sin(ph) * 0.08 * R;
    const bark = lin(g, -0.5 * R, 0, 0.5 * R, 0, [[0, '#24170f'], [0.45, '#7a5234'], [1, '#2a1a10']]);
    // rễ bò
    for (let i = 0; i < 4; i++) {
      const bx = (-0.35 + i * 0.24) * R, tip = Math.sin(ph + i * 1.6) * 0.14 * R;
      const pts = [[bx, -0.55 * R], [bx + (i - 1.5) * 0.18 * R, -0.25 * R], [bx + (i - 1.5) * 0.32 * R + tip, -0.02 * R]];
      stroke(g, pts, LINE, 0.2 * R); stroke(g, pts, '#5a3a24', 0.13 * R);
    }
    // cành sau
    const armB = [[-0.3 * R, -1.3 * R], [-0.7 * R, -1.55 * R + sway], [-0.95 * R, -1.75 * R + sway]];
    stroke(g, armB, LINE, 0.16 * R); stroke(g, armB, '#3a2618', 0.1 * R);
    // thân
    ink(g, c => {
      c.moveTo(-0.46 * R, -0.45 * R); c.quadraticCurveTo(-0.55 * R, -1.1 * R, -0.36 * R, -1.62 * R);
      c.lineTo(0.38 * R, -1.66 * R); c.quadraticCurveTo(0.6 * R, -1.1 * R, 0.5 * R, -0.45 * R);
      c.quadraticCurveTo(0, -0.36 * R, -0.46 * R, -0.45 * R); c.closePath();
    }, bark, lw);
    g.strokeStyle = 'rgba(20,12,6,0.55)'; g.lineWidth = 0.03 * R;
    for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo((-0.3 + i * 0.2) * R, -0.5 * R); g.quadraticCurveTo((-0.25 + i * 0.18) * R, -1.0 * R, (-0.28 + i * 0.2) * R, -1.55 * R); g.stroke(); }
    // mặt hốc cây
    for (const ex of [0.05, 0.3]) ink(g, c => c.ellipse(ex * R, -1.25 * R, 0.09 * R, 0.07 * R, 0, 0, TAU), '#0e0805', lw * 0.6);
    ink(g, c => { c.moveTo(0, -0.98 * R); for (let k = 0; k <= 5; k++) c.lineTo((0.04 + k * 0.06) * R, (-0.98 + (k % 2 ? 0.06 : -0.02)) * R); c.lineTo(0.34 * R, -0.9 * R); c.quadraticCurveTo(0.17 * R, -0.82 * R, 0, -0.9 * R); c.closePath(); }, '#0e0805', lw * 0.5);
    // rêu
    g.fillStyle = 'rgba(80,150,80,0.85)';
    g.beginPath(); g.ellipse(-0.25 * R, -0.75 * R, 0.14 * R, 0.06 * R, 0.3, 0, TAU); g.fill();
    // tán lá
    const leaves = [['#163a22', 0.62], ['#2f6a38', 0.46], ['#6ab04a', 0.26]];
    for (const [col, rr] of leaves) {
      g.fillStyle = col;
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * TAU + rr * 3;
        g.beginPath(); g.arc(Math.cos(a) * rr * 0.75 * R - (0.62 - rr) * 0.3 * R, -1.9 * R + Math.sin(a) * rr * 0.45 * R - (0.62 - rr) * 0.4 * R + sway * 0.5, rr * 0.48 * R, 0, TAU); g.fill();
      }
    }
    // cành trước có gai
    const armF = [[0.42 * R, -1.25 * R], [0.8 * R, -1.0 * R - sway], [1.05 * R, -0.85 * R - sway]];
    stroke(g, armF, LINE, 0.16 * R); stroke(g, armF, '#4a3020', 0.1 * R);
    for (const d of [-0.12, 0.08]) stroke(g, [[1.0 * R, -0.88 * R - sway], [1.18 * R, (-0.88 + d) * R - sway]], '#4a3020', 0.05 * R);
  }

  // ------------------------------------------------------------------ Độc Chu
  function drawSpider(g, R, ph) {
    const lw = 0.045 * R;
    const legs = near => {
      const feet = [-0.95, -0.45, 0.3, 0.85];
      feet.forEach((fx, i) => {
        const sw = Math.sin(ph * 2 + i * 1.3 + (near ? 0 : Math.PI)) * 0.12 * R;
        const lift = Math.max(0, Math.sin(ph * 2 + i * 1.3 + (near ? 0 : Math.PI))) * 0.08 * R;
        const bx = (0.05 + i * 0.1) * R + (near ? 0.05 * R : -0.05 * R);
        const pts = [[bx, -0.6 * R], [bx + (fx - 0.1) * 0.55 * R, -1.05 * R - lift], [fx * R + sw, -lift * 0.4]];
        stroke(g, pts, LINE, 0.1 * R);
        stroke(g, pts, near ? '#3a2448' : '#1a0e22', 0.06 * R);
      });
    };
    legs(false);
    ink(g, c => c.ellipse(-0.45 * R, -0.78 * R, 0.62 * R, 0.5 * R, -0.15, 0, TAU), lin(g, 0, -1.28 * R, 0, -0.28 * R, [[0, '#5a3470'], [0.5, '#2a1438'], [1, '#0e0614']]), lw);
    // vân đầu lâu đỏ
    ink(g, c => { c.ellipse(-0.48 * R, -0.86 * R, 0.18 * R, 0.15 * R, 0, 0, TAU); }, '#c81e3a', 0);
    for (const ex of [-0.55, -0.41]) dot(g, ex * R, -0.88 * R, 0.04 * R, '#1a0610');
    stroke(g, [[-0.56 * R, -0.76 * R], [-0.4 * R, -0.76 * R]], '#1a0610', 0.025 * R);
    g.strokeStyle = 'rgba(200,170,220,0.45)'; g.lineWidth = 0.02 * R;
    for (let i = 0; i < 8; i++) { const a = -2.6 + i * 0.3; g.beginPath(); g.moveTo(-0.45 * R + Math.cos(a) * 0.6 * R, -0.78 * R + Math.sin(a) * 0.48 * R); g.lineTo(-0.45 * R + Math.cos(a) * 0.68 * R, -0.78 * R + Math.sin(a) * 0.56 * R); g.stroke(); }
    ink(g, c => c.ellipse(0.32 * R, -0.62 * R, 0.34 * R, 0.27 * R, 0, 0, TAU), lin(g, 0, -0.9 * R, 0, -0.35 * R, [[0, '#4a2a5a'], [1, '#140a1c']]), lw);
    legs(true);
    for (const sy of [-1, 1]) ink(g, c => { c.moveTo(0.6 * R, -0.52 * R + sy * 0.04 * R); c.quadraticCurveTo(0.74 * R, -0.42 * R + sy * 0.06 * R, 0.66 * R, -0.34 * R); c.lineTo(0.62 * R, -0.46 * R); c.closePath(); }, '#d8c890', lw * 0.5);
    for (const [ex, ey, r] of [[0.58, -0.74, 0.05], [0.5, -0.78, 0.04], [0.64, -0.68, 0.035], [0.45, -0.72, 0.03]]) dot(g, ex * R, ey * R, r * R, '#ff3355');
  }

  // ------------------------------------------------------------------ Hỏa Tích
  function drawSalamander(g, R, ph) {
    const lw = 0.045 * R, wig = Math.sin(ph * 2) * 0.06 * R;
    const tailTip = [-1.55 * R, -0.36 * R + Math.sin(ph * 2 + 1) * 0.12 * R];
    ink(g, c => { c.moveTo(-0.55 * R, -0.52 * R); c.quadraticCurveTo(-1.1 * R, -0.5 * R + wig, tailTip[0], tailTip[1]); c.quadraticCurveTo(-1.1 * R, -0.32 * R + wig, -0.55 * R, -0.3 * R); c.closePath(); },
      lin(g, 0, -0.55 * R, 0, -0.3 * R, [[0, '#ff8a3a'], [1, '#7a1a08']]), lw);
    for (const [col, s] of [['rgba(255,90,20,0.8)', 1], ['#ffd27a', 0.55]]) {
      ink(g, c => { c.moveTo(tailTip[0], tailTip[1] - 0.1 * R * s); c.quadraticCurveTo(tailTip[0] - 0.25 * R * s, tailTip[1] - 0.3 * R * s, tailTip[0] - 0.15 * R * s, tailTip[1] - 0.45 * R * s); c.quadraticCurveTo(tailTip[0] + 0.05 * R, tailTip[1] - 0.2 * R * s, tailTip[0] + 0.05 * R, tailTip[1]); c.closePath(); }, col, 0);
    }
    const leg = (bx, off, col) => {
      const s = Math.sin(ph * 2 + off) * 0.18 * R, lift = Math.max(0, Math.cos(ph * 2 + off)) * 0.06 * R;
      const pts = [[bx, -0.4 * R], [bx + s * 0.5, -0.2 * R - lift], [bx + s, -lift]];
      stroke(g, pts, LINE, 0.13 * R); stroke(g, pts, col, 0.08 * R);
    };
    leg(-0.35 * R, Math.PI, '#7a1a08'); leg(0.45 * R, 0, '#7a1a08');
    ink(g, c => c.ellipse(0, -0.42 * R + wig * 0.3, 0.75 * R, 0.24 * R, 0, 0, TAU), lin(g, 0, -0.66 * R, 0, -0.18 * R, [[0, '#ff9a4a'], [0.5, '#c0401a'], [1, '#6a1408']]), lw);
    g.fillStyle = 'rgba(255,214,122,0.75)'; g.beginPath(); g.ellipse(0.05 * R, -0.28 * R, 0.55 * R, 0.07 * R, 0, 0, TAU); g.fill();
    for (let i = 0; i < 5; i++) stroke(g, [[(-0.5 + i * 0.24) * R, -0.62 * R + wig * 0.3], [(-0.45 + i * 0.24) * R, -0.3 * R]], 'rgba(40,6,2,0.55)', 0.05 * R);
    for (let i = 0; i < 6; i++) {
      const x = (-0.55 + i * 0.22) * R, h = (0.18 + Math.sin(ph * 3 + i) * 0.05) * R;
      ink(g, c => { c.moveTo(x - 0.06 * R, -0.62 * R + wig * 0.3); c.quadraticCurveTo(x - 0.05 * R, -0.66 * R - h * 0.6, x + 0.02 * R, -0.64 * R - h); c.quadraticCurveTo(x + 0.03 * R, -0.66 * R - h * 0.4, x + 0.07 * R, -0.62 * R + wig * 0.3); c.closePath(); }, i % 2 ? '#ffd27a' : '#ff7a2a', lw * 0.4);
    }
    leg(-0.2 * R, Math.PI + 1.2, '#c0401a'); leg(0.6 * R, 1.2, '#c0401a');
    ink(g, c => { c.moveTo(0.6 * R, -0.58 * R); c.quadraticCurveTo(0.95 * R, -0.68 * R, 1.18 * R, -0.46 * R); c.quadraticCurveTo(0.95 * R, -0.32 * R, 0.62 * R, -0.3 * R); c.closePath(); },
      lin(g, 0, -0.68 * R, 0, -0.3 * R, [[0, '#ff9a4a'], [1, '#8a2a0e']]), lw);
    stroke(g, [[0.8 * R, -0.42 * R], [1.15 * R, -0.45 * R]], LINE, 0.025 * R);
    ink(g, c => c.ellipse(0.93 * R, -0.56 * R, 0.06 * R, 0.045 * R, 0, 0, TAU), '#ffe14a', lw * 0.5);
    ink(g, c => c.ellipse(0.94 * R, -0.56 * R, 0.015 * R, 0.04 * R, 0, 0, TAU), LINE, 0);
  }

  // ------------------------------------------------------------------ Băng Hồ / Cửu Vĩ Băng Hồ
  const FOX = { fur: '#dfeefa', furHi: '#ffffff', furDk: '#8aaac8', tip: '#9fe0ff', mark: '#4fa8e8', gem: '#9fe0ff', tails: 1 };
  const FOX_QUEEN = { fur: '#eaf6ff', furHi: '#ffffff', furDk: '#7aa0c8', tip: '#bfe6ff', mark: '#e9b44c', gem: '#5fc8ff', tails: 9, queen: true };

  function drawFox(g, R, ph, P) {
    const lw = 0.045 * R, bob = Math.sin(ph * 2) * 0.04 * R;
    const n = P.tails;
    for (let i = 0; i < n; i++) {
      const spread = n > 1 ? (i / (n - 1) - 0.5) * 1.6 : 0;
      const a = -2.4 + spread + Math.sin(ph + i * 0.7) * 0.12;
      const L = (n > 1 ? 1.25 : 1.0) * R;
      const bx = -0.7 * R, by = -0.88 * R + bob;
      const tx = bx + Math.cos(a) * L, ty = by + Math.sin(a) * L;
      const nx = -Math.sin(a) * 0.22 * R, ny = Math.cos(a) * 0.22 * R;
      const mx = (bx + tx) / 2, my = (by + ty) / 2;
      ink(g, c => { c.moveTo(bx, by); c.quadraticCurveTo(mx + nx * 1.6, my + ny * 1.6, tx, ty); c.quadraticCurveTo(mx - nx * 1.2, my - ny * 1.2, bx + 0.05 * R, by + 0.12 * R); c.closePath(); },
        lin(g, bx, by, tx, ty, [[0, P.furDk], [0.6, P.fur], [1, P.furHi]]), lw * 0.8);
      dot(g, tx - Math.cos(a) * 0.08 * R, ty - Math.sin(a) * 0.08 * R, 0.1 * R, P.tip);
    }
    wolfLeg(g, R, -0.5 * R, -0.72 * R + bob, ph, Math.PI, P.furDk, 0.7);
    wolfLeg(g, R, 0.5 * R, -0.72 * R + bob, ph, 0, P.furDk, 0.7);
    ink(g, c => {
      c.moveTo(-0.85 * R, -0.85 * R + bob); c.quadraticCurveTo(-0.6 * R, -1.22 * R + bob, 0.2 * R, -1.16 * R + bob);
      c.quadraticCurveTo(0.8 * R, -1.18 * R + bob, 0.82 * R, -0.9 * R + bob); c.quadraticCurveTo(0.6 * R, -0.62 * R + bob, 0, -0.66 * R + bob);
      c.quadraticCurveTo(-0.7 * R, -0.62 * R + bob, -0.85 * R, -0.85 * R + bob); c.closePath();
    }, lin(g, 0, -1.22 * R, 0, -0.62 * R, [[0, P.furHi], [0.55, P.fur], [1, P.furDk]]), lw);
    if (P.queen) for (let i = 0; i < 3; i++) stroke(g, [[(-0.4 + i * 0.3) * R, -1.1 * R + bob], [(-0.3 + i * 0.3) * R, -0.92 * R + bob]], P.mark, 0.04 * R);
    wolfLeg(g, R, -0.4 * R, -0.7 * R + bob, ph, Math.PI + 1.1, P.fur, 0.7);
    wolfLeg(g, R, 0.62 * R, -0.7 * R + bob, ph, 1.0, P.fur, 0.7);
    const hx = 0.92 * R, hy = -1.25 * R + bob;
    for (const ox of [-0.18, 0.02]) {
      ink(g, c => { c.moveTo(hx + ox * R - 0.08 * R, hy - 0.2 * R); c.lineTo(hx + ox * R - 0.02 * R, hy - 0.66 * R); c.lineTo(hx + ox * R + 0.14 * R, hy - 0.22 * R); c.closePath(); }, P.fur, lw);
      ink(g, c => { c.moveTo(hx + ox * R - 0.03 * R, hy - 0.24 * R); c.lineTo(hx + ox * R, hy - 0.5 * R); c.lineTo(hx + ox * R + 0.08 * R, hy - 0.25 * R); c.closePath(); }, P.furDk, 0);
    }
    ink(g, c => {
      c.moveTo(hx - 0.3 * R, hy); c.quadraticCurveTo(hx - 0.25 * R, hy - 0.32 * R, hx + 0.1 * R, hy - 0.26 * R);
      c.quadraticCurveTo(hx + 0.4 * R, hy - 0.16 * R, hx + 0.62 * R, hy + 0.02 * R); c.quadraticCurveTo(hx + 0.3 * R, hy + 0.14 * R, hx - 0.3 * R, hy); c.closePath();
    }, lin(g, 0, hy - 0.32 * R, 0, hy + 0.14 * R, [[0, P.furHi], [1, P.fur]]), lw);
    dot(g, hx + 0.6 * R, hy + 0.01 * R, 0.04 * R, LINE);
    stroke(g, [[hx + 0.04 * R, hy - 0.06 * R], [hx + 0.3 * R, hy + 0.04 * R]], P.mark, 0.035 * R);
    g.save(); g.translate(hx + 0.16 * R, hy - 0.12 * R); g.rotate(-0.35);
    ink(g, c => c.ellipse(0, 0, 0.075 * R, 0.035 * R, 0, 0, TAU), '#7fd6ff', lw * 0.5);
    g.restore();
    g.save(); g.translate(hx - 0.02 * R, hy - 0.24 * R);
    ink(g, c => { c.moveTo(0, -0.07 * R); c.lineTo(0.05 * R, 0); c.lineTo(0, 0.07 * R); c.lineTo(-0.05 * R, 0); c.closePath(); }, P.gem, lw * 0.5);
    g.restore();
  }

  // ------------------------------------------------------------------ Tuyết Viên
  function drawYeti(g, R, ph) {
    const lw = 0.045 * R, step = Math.sin(ph), sway = Math.sin(ph) * 0.05 * R;
    const fur = (y0, y1, dark) => lin(g, 0, y0, 0, y1, dark ? [[0, '#c8d8e6'], [1, '#6a7f96']] : [[0, '#ffffff'], [0.5, '#dce8f2'], [1, '#8aa0b8']]);
    const arm = (sx, near) => {
      const hx = sx * 0.62 * R + (near ? -1 : 1) * step * 0.12 * R;
      const pts = [[sx * 0.48 * R, -1.45 * R + sway], [sx * 0.72 * R, -0.9 * R], [hx + sx * 0.12 * R, -0.25 * R]];
      stroke(g, pts, LINE, 0.36 * R); stroke(g, pts, near ? '#e8f0f6' : '#a8bcd0', 0.28 * R);
      ink(g, c => c.ellipse(hx + sx * 0.14 * R, -0.16 * R, 0.17 * R, 0.13 * R, 0, 0, TAU), '#5a7088', lw);
    };
    arm(-1, false);
    for (const [x, l] of [[-0.25 * R + step * 0.1 * R, Math.max(0, step)], [0.25 * R - step * 0.1 * R, Math.max(0, -step)]]) {
      ink(g, c => c.ellipse(x, -0.22 * R - l * 0.06 * R, 0.2 * R, 0.24 * R, 0, 0, TAU), fur(-0.5 * R, 0, true), lw);
      ink(g, c => c.ellipse(x + 0.05 * R, -0.04 * R - l * 0.06 * R, 0.17 * R, 0.07 * R, 0, 0, TAU), '#5a7088', lw * 0.6);
    }
    ink(g, c => {
      c.moveTo(-0.62 * R, -0.5 * R);
      for (let k = 0; k <= 10; k++) {
        const a = Math.PI + (k / 10) * Math.PI, rr = (k % 2 ? 0.74 : 0.8) * R;
        c.lineTo(Math.cos(a) * rr * 0.95, -1.05 * R + sway + Math.sin(a) * rr * 0.85);
      }
      c.lineTo(0.62 * R, -0.5 * R); c.quadraticCurveTo(0, -0.32 * R, -0.62 * R, -0.5 * R); c.closePath();
    }, fur(-1.8 * R, -0.35 * R), lw);
    g.strokeStyle = 'rgba(120,150,180,0.6)'; g.lineWidth = 0.03 * R;
    for (let i = 0; i < 6; i++) { const x = (-0.45 + i * 0.18) * R; g.beginPath(); g.moveTo(x, -1.25 * R + sway); g.quadraticCurveTo(x + 0.06 * R, -1.0 * R, x, -0.8 * R); g.stroke(); }
    const hx = 0.4 * R, hy = -1.68 * R + sway;
    ink(g, c => c.arc(hx, hy, 0.32 * R, 0, TAU), fur(hy - 0.32 * R, hy + 0.32 * R), lw);
    ink(g, c => c.ellipse(hx + 0.1 * R, hy + 0.04 * R, 0.2 * R, 0.17 * R, 0, 0, TAU), lin(g, 0, hy - 0.14 * R, 0, hy + 0.2 * R, [[0, '#7a90a8'], [1, '#3e4e62']]), lw * 0.7);
    stroke(g, [[hx - 0.02 * R, hy - 0.12 * R], [hx + 0.28 * R, hy - 0.05 * R]], '#2a3444', 0.05 * R);
    ink(g, c => { c.moveTo(hx + 0.02 * R, hy + 0.1 * R); c.lineTo(hx + 0.26 * R, hy + 0.1 * R); c.lineTo(hx + 0.2 * R, hy + 0.17 * R); c.lineTo(hx + 0.06 * R, hy + 0.17 * R); c.closePath(); }, '#2a0e12', 0);
    for (const fx of [0.06, 0.22]) ink(g, c => { c.moveTo(hx + fx * R - 0.02 * R, hy + 0.1 * R); c.lineTo(hx + fx * R, hy + 0.16 * R); c.lineTo(hx + fx * R + 0.02 * R, hy + 0.1 * R); c.closePath(); }, '#fff', 0);
    arm(1, true);
  }

  const LAVA = { hi: '#5e4a46', mid: '#2e2422', dark: '#120c0b', rune: '#ff6a1a', core: '#fff2a0', moss: 'rgba(255,120,40,0.55)' };
  const FORTRESS = { hi: '#c8b48c', mid: '#786b55', dark: '#2f281e', rune: '#ffd36a', core: '#fff3c2', moss: 'rgba(180,150,80,0.7)', boss: true };

  // ------------------------------------------------------------------ Vẽ Monster bằng Sprite / Procedural
  function drawSpriteMonster(g, R, ph, monsterKey, boxW, boxH) {
    const bob = Math.sin(ph) * 0.04 * R;
    const sp = TT.Art && TT.Art.getMonsterSprite ? TT.Art.getMonsterSprite(monsterKey) : null;
    if (sp && sp.canvas) {
      const w = boxW * R, h = boxH * R;
      g.drawImage(sp.canvas, -w / 2, -h + bob, w, h);
    } else {
      g.fillStyle = '#222736';
      g.beginPath();
      g.ellipse(0, -boxH * R * 0.45 + bob, boxW * R * 0.4, boxH * R * 0.45, 0, 0, TAU);
      g.fill();
    }
  }

  // ------------------------------------------------------------------ bảng loài
  // box: kích thước frame theo đơn vị R; eyes: vị trí mắt (đơn vị r, hướng phải) để vẽ ánh sáng lúc chạy.
  const TYPES = {
    HAC_LANG: { draw: (g, R, ph) => drawWolf(g, R, ph, WOLF), box: [3.7, 2.2], fps: 12, eyes: [[1.13, -1.45]] },
    DOC_TRUNG: { draw: drawCentipede, box: [4.4, 2.0], fps: 14, eyes: [[1.25, -0.6]] },
    QUY_HOA: { draw: drawWisp, box: [2.7, 3.1], fps: 8, eyes: [[-0.08, -1.23], [0.22, -1.23]], aura: '#ff7a2a', float: true },
    THACH_MA: { draw: drawGolem, box: [3.0, 2.6], fps: 6, eyes: [[0.21, -1.98]], aura: '#5ff0ff' },
    YEU_VUONG: { draw: (g, R, ph) => drawWolf(g, R, ph, BOSS), box: [3.9, 2.5], fps: 10, eyes: [[1.13, -1.45]], aura: '#ff3030' },
    MOC_YEU: { draw: drawTreant, box: [2.8, 2.7], fps: 6, eyes: [[0.05, -1.25], [0.3, -1.25]] },
    DOC_CHU: { draw: drawSpider, box: [2.6, 1.6], fps: 10, eyes: [[0.58, -0.74]] },
    HOA_TICH: { draw: drawSalamander, box: [3.9, 1.3], fps: 14, eyes: [[0.93, -0.56]], aura: '#ff7a2a' },
    BANG_HO: { draw: (g, R, ph) => drawFox(g, R, ph, FOX), box: [3.4, 2.4], fps: 12, eyes: [[1.08, -1.37]], aura: '#9fe0ff' },
    TUYET_VIEN: { draw: drawYeti, box: [2.4, 2.4], fps: 6, eyes: [[0.45, -1.78]] },
    DUNG_NHAM_MA: { draw: (g, R, ph) => drawGolem(g, R, ph, LAVA), box: [3.0, 2.6], fps: 5, eyes: [[0.21, -1.98]], aura: '#ff5a1a' },
    CUU_VI_HO: { draw: (g, R, ph) => drawFox(g, R, ph, FOX_QUEEN), box: [5.0, 3.3], fps: 10, eyes: [[1.08, -1.37]], aura: '#bfe6ff' },
    THANH_CHU: { draw: (g, R, ph) => drawGolem(g, R, ph, FORTRESS), box: [3.4, 2.9], fps: 5, eyes: [[0.21, -1.98]], aura: '#d8b778' },

    // CÁC ĐẠI BOSS THƯỢNG CỔ
    CUU_VI_THIEN_HO: { draw: (g, R, ph) => drawSpriteMonster(g, R, ph, 'CUU_VI_THIEN_HO', 4.4, 3.2), box: [4.4, 3.2], fps: 8, eyes: [[0.8, -1.2]], aura: '#38bdf8' },
    LOI_DINH_CU_SA: { draw: (g, R, ph) => drawSpriteMonster(g, R, ph, 'LOI_DINH_CU_SA', 4.2, 2.6), box: [4.2, 2.6], fps: 10, eyes: [[1.0, -1.1]], aura: '#0ea5e9' },
    HAC_AM_CU_HUNG: { draw: (g, R, ph) => drawSpriteMonster(g, R, ph, 'HAC_AM_CU_HUNG', 3.8, 3.2), box: [3.8, 3.2], fps: 6, eyes: [[0.5, -1.4]], aura: '#ef4444' },
    HAN_BANG_CU_MA: { draw: (g, R, ph) => drawSpriteMonster(g, R, ph, 'HAN_BANG_CU_MA', 4.0, 3.4), box: [4.0, 3.4], fps: 6, eyes: [[0.4, -1.6]], aura: '#7dd3fc' },
    HU_KHONG_AM_LONG: { draw: (g, R, ph) => drawSpriteMonster(g, R, ph, 'HU_KHONG_AM_LONG', 4.6, 3.6), box: [4.6, 3.6], fps: 8, eyes: [[0.9, -1.4]], aura: '#a855f7' },

    // QUÂN ĐOÀN HẮC ẢNH
    HAC_ANH_TU_THAN: { draw: (g, R, ph) => drawSpriteMonster(g, R, ph, 'HAC_ANH_TU_THAN', 2.8, 3.0), box: [2.8, 3.0], fps: 8, eyes: [[0.3, -1.3]], aura: '#6366f1' },
    HAC_ANH_KIEM_SI: { draw: (g, R, ph) => drawSpriteMonster(g, R, ph, 'HAC_ANH_KIEM_SI', 2.8, 3.0), box: [2.8, 3.0], fps: 8, eyes: [[0.3, -1.2]], aura: '#60a5fa' },
    BACH_COT_THICH_KHACH: { draw: (g, R, ph) => drawSpriteMonster(g, R, ph, 'BACH_COT_THICH_KHACH', 2.5, 2.8), box: [2.5, 2.8], fps: 10, eyes: [[0.3, -1.1]], aura: '#f97316' },
    HU_KHONG_U_HON: { draw: (g, R, ph) => drawSpriteMonster(g, R, ph, 'HU_KHONG_U_HON', 2.6, 2.8), box: [2.6, 2.8], fps: 8, eyes: [[0.2, -1.2]], aura: '#38bdf8', float: true },
    TOA_LIEM_MA_QUAN: { draw: (g, R, ph) => drawSpriteMonster(g, R, ph, 'TOA_LIEM_MA_QUAN', 3.8, 3.4), box: [3.8, 3.4], fps: 8, eyes: [[0.4, -1.4]], aura: '#60a5fa' },
    HAC_DA_THONG_SOAI: { draw: (g, R, ph) => drawSpriteMonster(g, R, ph, 'HAC_DA_THONG_SOAI', 4.2, 3.6), box: [4.2, 3.6], fps: 8, eyes: [[0.5, -1.5]], aura: '#38bdf8' },

    // YÊU THÚ & THẦN THÚ BỔ SUNG
    MONSTER_SCORPION: { draw: (g, R, ph) => drawSpriteMonster(g, R, ph, 'MONSTER_SCORPION', 3.4, 2.4), box: [3.4, 2.4], fps: 8, eyes: [[0.7, -0.9]], aura: '#a855f7' },
    NHAT_THUC_THAN_CAM: { draw: (g, R, ph) => drawSpriteMonster(g, R, ph, 'NHAT_THUC_THAN_CAM', 4.4, 3.2), box: [4.4, 3.2], fps: 8, eyes: [[0.6, -1.3]], aura: '#f59e0b', float: true },
    BANG_LINH_THAN_THU: { draw: (g, R, ph) => drawSpriteMonster(g, R, ph, 'BANG_LINH_THAN_THU', 4.4, 3.2), box: [4.4, 3.2], fps: 8, eyes: [[0.6, -1.3]], aura: '#7dd3fc', float: true },
    KIM_SUNG_THIEN_LONG: { draw: (g, R, ph) => drawSpriteMonster(g, R, ph, 'KIM_SUNG_THIEN_LONG', 4.8, 3.8), box: [4.8, 3.8], fps: 8, eyes: [[0.8, -1.6]], aura: '#c084fc', float: true }
  };

  const sheets = {};
  /** Dựng dải frame cho 1 loài (cache theo loài). */
  function sheet(type, def, ppm) {
    if (sheets[type]) return sheets[type];
    const T = TYPES[type] || TYPES.THACH_MA;
    const R = def.radiusM * ppm * SCALE;
    const FW = Math.ceil(T.box[0] * R), FH = Math.ceil(T.box[1] * R);
    const ax = FW / 2, ay = FH - 0.1 * R;
    const img = TT.Art.canvas(FW * FRAMES, FH);
    const g = img.getContext('2d');
    g.lineJoin = 'round'; g.lineCap = 'round';
    for (let f = 0; f < FRAMES; f++) {
      g.save();
      g.beginPath(); g.rect(f * FW, 0, FW, FH); g.clip();
      g.translate(f * FW + ax, ay);
      T.draw(g, R, (f / FRAMES) * TAU);
      g.restore();
    }
    const white = TT.Art.canvas(img.width, img.height);
    const w = white.getContext('2d');
    w.drawImage(img, 0, 0);
    w.globalCompositeOperation = 'source-atop';
    w.fillStyle = '#ffffff'; w.fillRect(0, 0, white.width, white.height);
    return (sheets[type] = { img, white, FW, FH, ax, ay });
  }

  /** Vẽ yêu thú (thay TT.Art.drawEnemy). e: {type, def, x, y, vx, hp, maxHp, hitFlash, seed, telegraph, chargeT} */
  function drawEnemy(ctx, e, t, ppm) {
    const def = e.def, T = TYPES[e.type] || TYPES.THACH_MA;
    const r = def.radiusM * ppm;
    const sh = sheet(e.type, def, ppm);
    const face = e.vx >= 0 ? 1 : -1;
    const gx = e.x, gy = e.y + r * 0.75;
    const speedUp = e.chargeT > 0 ? 2.2 : 1;
    const f = Math.floor(t * T.fps * speedUp + (e.seed || 0) * 3) % FRAMES;
    const A = TT.Art;
    ctx.fillStyle = T.float ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.45)';
    ctx.beginPath(); ctx.ellipse(gx, gy, r * (T.float ? 0.7 : 1.1), r * 0.3, 0, 0, TAU); ctx.fill();
    if (T.aura || e.telegraph > 0) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const tele = e.telegraph > 0;
      A.glow(ctx, gx, gy - r * 1.1, r * (tele ? 2.6 : 1.6), tele ? '#ff2020' : T.aura, tele ? 0.45 + Math.sin(t * 30) * 0.15 : 0.18 + Math.sin(t * 3 + (e.seed || 0)) * 0.06);
      ctx.restore();
    }
    ctx.save();
    ctx.translate(gx, gy);
    ctx.scale(face / SCALE, 1 / SCALE);
    ctx.drawImage(sh.img, f * sh.FW, 0, sh.FW, sh.FH, -sh.ax, -sh.ay, sh.FW, sh.FH);
    if (e.hitFlash > 0) { ctx.globalAlpha = 0.8; ctx.drawImage(sh.white, f * sh.FW, 0, sh.FW, sh.FH, -sh.ax, -sh.ay, sh.FW, sh.FH); }
    ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const [ex, ey] of T.eyes) A.glow(ctx, gx + face * ex * r, gy + ey * r, r * 0.32, def.eye, 0.85);
    ctx.restore();
    if (e.hp < e.maxHp && !def.boss) {
      const w = Math.max(24, r * 2), top = gy - sh.ay / SCALE - 6;
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(e.x - w / 2, top, w, 4);
      ctx.fillStyle = '#e74c3c'; ctx.fillRect(e.x - w / 2, top, w * (e.hp / e.maxHp), 4);
    }
  }

  TT.Monsters = { TYPES, sheet, drawEnemy, FRAMES };
  TT.Art.drawEnemy = drawEnemy;
})(window.TT);
