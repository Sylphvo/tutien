window.TT = window.TT || {};

/**
 * TT.Game — vòng lặp game, cảnh (Động Phủ / Bí Cảnh / Lôi Đài Độ Kiếp),
 * chiến đấu Ngự Kiếm, AI yêu thú, rơi đồ, ánh sáng và hiệu ứng.
 */
(function (TT) {
  'use strict';
  const D = TT.DATA;
  const U = TT.util;
  const Art = TT.Art;
  const PPM = D.world.pixelsPerMeter;
  const CAST_DURATION = 0.25;       // thời lượng động tác kiếm chỉ khi phóng kiếm (giây)
  const HURT_ANIM_DURATION = 0.22;  // thời lượng frame bị đánh (giây)

  class Game {
    constructor(canvasEl) {
      this.cv = canvasEl;
      this.ctx = canvasEl.getContext('2d');
      this.light = Art.canvas(1, 1);
      this.lctx = this.light.getContext('2d');
      this.t = 0;
      this.paused = false;
      this.keys = {};
      this.mouse = { x: 0, y: 0, wx: 0, wy: 0, left: false, right: false };
      this.cam = { x: 0, y: 0, shake: 0 };
      this.flash = 0;
      this.state = TT.Save.load();
      if (!this.state) { this.state = new TT.PlayerState(); this.state.giveStartingKit(); }
      this.fog = [];
      for (let i = 0; i < 9; i++) this.fog.push({ x: Math.random(), y: Math.random(), r: 0.25 + Math.random() * 0.35, s: 0.005 + Math.random() * 0.01 });
      this.resize();
      window.addEventListener('resize', () => this.resize());
      this.bindInput();
      this.enterDongPhu();
      this.last = performance.now();
      requestAnimationFrame(ts => this.loop(ts));
    }

    // ------------------------------------------------------------------ setup
    resize() {
      this.W = this.cv.width = window.innerWidth;
      this.H = this.cv.height = window.innerHeight;
      this.light.width = this.W; this.light.height = this.H;
    }

    bindInput() {
      window.addEventListener('keydown', e => {
        const k = e.key.toLowerCase();
        if (k === 'tab') e.preventDefault();
        if (TT.UI.handleKey(k, e)) return;
        if (this.paused) return;
        this.keys[k] = true;
        if (k === ' ') { e.preventDefault(); this.tryDash(); }
        if (k === 'e') this.interact();
        if (['1', '2', '3', '4'].includes(k)) this.useQuick(+k - 1);
      });
      window.addEventListener('keyup', e => { this.keys[e.key.toLowerCase()] = false; });
      this.cv.addEventListener('mousemove', e => { this.mouse.x = e.clientX; this.mouse.y = e.clientY; });
      this.cv.addEventListener('mousedown', e => {
        if (e.button === 0) this.mouse.left = true;
        if (e.button === 2) this.mouse.right = true;
      });
      window.addEventListener('mouseup', e => {
        if (e.button === 0) this.mouse.left = false;
        if (e.button === 2) this.mouse.right = false;
      });
      window.addEventListener('contextmenu', e => e.preventDefault());
      window.addEventListener('blur', () => { this.keys = {}; this.mouse.left = this.mouse.right = false; });
    }

    setPaused(p) {
      this.paused = p;
      if (p) { this.keys = {}; this.mouse.left = this.mouse.right = false; }
    }

    // ------------------------------------------------------------------ scenes
    /**
     * Dựng cảnh trống. opts (tùy chọn): {ground:{canvas,glows}, dark, fog, ambient:{color,vy,rate}, biome}
     */
    baseScene(type, sizeM, seed, opts) {
      const sizePx = sizeM * PPM;
      opts = opts || {};
      const ground = opts.ground || { canvas: Art.makeGround(sizePx, type, seed), glows: [] };
      this.scene = {
        type, sizePx, ground: ground.canvas, glows: ground.glows, props: [], enemies: [], eproj: [], qi: [],
        particles: [], pickups: [], texts: [], strikes: [], scorches: [], bolts: [], kills: 0, bossSpawned: false,
        boss: null, spawnT: 0, exits: [],
        dark: opts.dark !== undefined ? opts.dark : ({ dongphu: 0.34, bicanh: 0.38, loidai: 0.36 }[type]),
        fog: opts.fog || (type === 'loidai' ? '#3a2a6a' : '#16343a'),
        ambient: opts.ambient || { color: type === 'loidai' ? '#b48cff' : '#7affd0', vy: [-14, -4], rate: 6 },
        biome: opts.biome || null,
        npcs: []
      };
      const st = this.state;
      st.recompute();
      this.player = { x: sizePx / 2, y: sizePx / 2, vx: 0, vy: 0, aim: 0, dashT: 0, dashCd: 0, dashDir: [0, 0],
        invuln: 0, shield: false, slow: 1, moving: false, hitCount: 0, dead: false,
        castT: 0, hurtT: 0, mvx: 0, mvy: 0, ghosts: [], ghostT: 0, lastFrame: null };
      this.rebuildSwords();
      this.cam.x = this.player.x - this.W / 2; this.cam.y = this.player.y - this.H / 2;
    }

    rebuildSwords() {
      const n = this.state.stats.swords;
      this.swords = [];
      for (let i = 0; i < n; i++) this.swords.push({ state: 'orbit', x: this.player.x, y: this.player.y, ang: 0, dx: 0, dy: 0, trav: 0, pierce: 0, hit: new Set(), trail: [] });
    }

    addProp(kind, x, y, size, extra) {
      const p = Object.assign({ kind, x, y, size, seed: Math.random() * 100, solid: ['tree', 'rock', 'pillar', 'altar', 'cauldron'].includes(kind) }, extra || {});
      if (TT.Env.has(kind)) {
        const d = TT.Env.DEFS[kind];
        p.env = true;
        p.solid = false;
        p.colliders = d.col || [];
        p.size = d.ay;
        if (p.variant === undefined) p.variant = TT.Env.randomVariant(kind);
      } else {
        p.radius = { tree: 0.22, rock: 0.45, pillar: 0.25, altar: 0.55, cauldron: 0.45 }[kind] * size || 0;
      }
      this.scene.props.push(p);
      return p;
    }

    /** Ô đất (px) còn trống đủ bán kính r so với các đạo cụ đã đặt và vùng cấm. */
    freeSpot(S, r, avoid) {
      for (let tries = 0; tries < 30; tries++) {
        const x = U.rand(r, S - r), y = U.rand(r, S - r);
        if (avoid.some(([ax, ay, ar]) => Math.hypot(x - ax, y - ay) < ar + r)) continue;
        if (this.scene.props.some(p => p.env && Math.hypot(x - p.x, y - p.y) < r + 26)) continue;
        return [x, y];
      }
      return null;
    }

    /** Tông Môn: bản đồ chính theo D.sect. */
    enterDongPhu() {
      TT.Save.save(this.state);
      const L = D.sect, S = L.sizeM * PPM, c = S / 2, m = v => c + v * PPM;
      const ground = TT.Env.makeSectGround(S, {
        plaza: [m(L.plaza[0]), m(L.plaza[1]), L.plaza[2] * PPM],
        paths: L.paths.map(([x1, y1, x2, y2, w]) => [m(x1), m(y1), m(x2), m(y2), w * PPM])
      }, 7);
      this.baseScene('dongphu', L.sizeM, 7, { ground, dark: 0.16, fog: '#2a4a40', ambient: { color: '#ffe0ea', vy: [-8, 6], rate: 3 } });
      for (const d of L.props) this.addProp(d.kind, m(d.x), m(d.y), 0, { interact: d.interact, label: d.label, variant: d.variant, text: d.text });
      const B = L.borderTrees;
      for (let i = 0; i < B.count; i++) {
        const a = (i / B.count) * Math.PI * 2 + U.rand(-0.05, 0.05), r = U.rand(B.innerM, B.outerM) * PPM;
        this.addProp(i % 5 === 0 ? 'bamboo' : B.kind, c + Math.cos(a) * r, c + Math.sin(a) * r, 0);
      }
      for (const n of D.npcs) {
        this.scene.npcs.push({ npc: n, x: m(n.x), y: m(n.y), size: 70, aim: Math.PI / 2, moving: false, mvx: 0, mvy: 0,
          wpI: 0, wait: U.rand(0, 2), talking: false, label: `Nói chuyện: ${n.title} ${n.name} [E]`, interact: 'npc',
          path: n.path ? n.path.map(([x, y]) => [m(x), m(y)]) : null });
      }
      this.player.x = m(L.spawn[0]); this.player.y = m(L.spawn[1]);
      this.cam.x = this.player.x - this.W / 2; this.cam.y = this.player.y - this.H / 2;
      this.sortProps();
      TT.UI.setScene('dongphu');
    }

    /** Bí Cảnh theo vùng (D.biomes). */
    enterBiCanh(biomeId) {
      const st = this.state;
      biomeId = biomeId || 'LINH_MOC';
      const B = D.biomes[biomeId];
      const S = D.world.bicanhSizeM * PPM, c = S / 2;
      const ground = TT.Env.makeBiomeGround(S, B.ground, 1000 + Math.floor(Math.random() * 1e6));
      this.baseScene('bicanh', D.world.bicanhSizeM, 0, { ground, dark: B.dark, fog: B.fog, ambient: B.ambient, biome: biomeId });
      const avoid = [[c, c, 6 * PPM]];
      for (let i = 0; i < B.propCount; i++) {
        const kind = U.weighted(B.props, x => x[1])[0];
        const spot = this.freeSpot(S, 30, avoid);
        if (spot) this.addProp(kind, spot[0], spot[1], 0);
      }
      const G = B.gather;
      const place = (kind, n, extra) => {
        for (let i = 0; i < n; i++) {
          const spot = this.freeSpot(S, 40, avoid);
          if (spot) this.addProp(kind, spot[0], spot[1], 0, Object.assign({ interact: 'gather' }, extra));
        }
      };
      place('herb', G.herb, { variant: B.herbVariant, label: 'Hái linh thảo [E]' });
      place('ore', G.ore, { variant: B.oreVariant, label: 'Khai thác khoáng mạch [E]' });
      place('chest', G.chest, { variant: 'closed', label: 'Mở bảo rương [E]' });
      place('spring', G.spring, { variant: 'full', label: 'Linh Tuyền — hồi phục [E]' });
      this.addProp('portal', c, c - 2 * PPM, 50, { color: '#4fe0c8', interact: 'exit', label: 'Rời Bí Cảnh [E]', light: '#4fe0c8' });
      this.sortProps();
      this.scene.scale = Math.pow(D.enemyScale, st.globalStage);
      TT.UI.setScene('bicanh', B.name);
      TT.UI.toast(`Tiến vào ${B.name} (Yêu thú cấp ${st.itemLevel}). Diệt ${D.bicanh.killsForBoss} yêu thú để dụ Yêu Vương!`);
    }

    /** Thu thập vật phẩm Bí Cảnh (linh thảo, khoáng mạch, bảo rương, linh tuyền). */
    gather(pr) {
      if (pr.depleted) { TT.UI.toast('Đã khai thác hết.'); return; }
      const st = this.state, B = D.biomes[this.scene.biome];
      const give = (id, n) => {
        if (n <= 0) return;
        const left = st.inventory.add(TT.Items.createStack(id, n));
        if (left > 0) this.dropItem(pr.x, pr.y, TT.Items.createStack(id, left));
        TT.UI.toast(`+${n - left} ${D.items[id].name}`);
      };
      const burst = col => { for (let i = 0; i < 18; i++) this.spark(pr.x, pr.y - 14, col, 3, 0.7); };
      if (pr.kind === 'herb' || pr.kind === 'ore') {
        for (const [id, a, b] of (pr.kind === 'herb' ? B.herbLoot : B.oreLoot)) give(id, U.randInt(a, b));
        burst(pr.kind === 'herb' ? '#7affd0' : '#ffe39a');
        pr.gone = true;
        this.scene.props = this.scene.props.filter(x => !x.gone);
      } else if (pr.kind === 'chest') {
        const rar = U.weighted(Object.keys(D.chestRarityWeights), k => D.chestRarityWeights[k]);
        this.dropItem(pr.x, pr.y, TT.Items.createEquipment({ level: st.itemLevel, rarity: rar, element: B.element }));
        this.dropLinhThach(pr.x, pr.y, Math.ceil(U.randInt(D.chestLinhThach[0], D.chestLinhThach[1]) * Math.sqrt(this.scene.scale)));
        if (Math.random() < D.chestDinhHonChauChance) this.dropItem(pr.x, pr.y, TT.Items.createStack('DINH_HON_CHAU', 1));
        pr.variant = 'open'; pr.depleted = true; pr.label = null;
        burst('#ffe39a');
        TT.UI.toast('Bảo rương mở ra!');
      } else if (pr.kind === 'spring') {
        const fx = D.spring;
        st.hp = Math.min(st.stats.maxHp, st.hp + st.stats.maxHp * fx.healPct);
        st.mp = Math.min(st.stats.maxMp, st.mp + st.stats.maxMp * fx.mpPct);
        st.addDanDoc(fx.danDoc);
        pr.variant = 'dry'; pr.depleted = true; pr.label = null;
        burst('#4fd8c0');
        TT.UI.toast('Linh Tuyền gột rửa thân thể: hồi phục sinh lực, linh lực, giảm đan độc.');
      }
    }

    /** Bắt đầu Độ Kiếp với cấu hình trận pháp. formation: {Talisman, Treasure, Pill} = itemId|null */
    enterTribulation(formation) {
      const st = this.state;
      const key = st.nextTribulation();
      const cfg = D.tribulations[key];
      // tiêu hao vật phẩm trận pháp
      let reduction = 0, block = 0, heal = 0;
      for (const slot in formation) {
        const id = formation[slot];
        if (!id || !st.inventory.remove(id, 1)) continue;
        const fx = D.items[id].formationEffect;
        reduction += fx.reduction || 0; block += fx.blockCharges || 0; heal += fx.healPerWave || 0;
      }
      reduction = Math.min(D.lightning.maxFormationReduction, reduction);
      this.baseScene('loidai', cfg.radiusM * 2 + 8, 99);
      const S = this.scene.sizePx;
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        this.addProp('pillar', S / 2 + Math.cos(a) * (cfg.radiusM + 1.2) * PPM, S / 2 + Math.sin(a) * (cfg.radiusM + 1.2) * PPM, 70, { color: '#b48cff' });
      }
      this.sortProps();
      st.hp = st.stats.maxHp; st.mp = st.stats.maxMp;
      this.trib = { key, cfg, reduction, block, heal, wave: 0, phase: 'gap', timer: 2.5, events: [], done: false, result: null };
      TT.UI.setScene('loidai');
      TT.UI.toast(`${cfg.name} giáng lâm! Né tránh ${cfg.waves} đạo Lôi Kiếp bằng [Space].`);
    }

    sortProps() { this.scene.props.sort((a, b) => a.y - b.y); }

    // ------------------------------------------------------------------ actions
    /** Khoảng cách tương tác: tới đoạn chân công trình (công trình rộng) hoặc tới tâm. */
    interactDist(pr) {
      const p = this.player;
      let half = 0;
      if (pr.env) for (const c of pr.colliders) if (c.type === 'rect') half = Math.max(half, c.w / 2);
      const dx = Math.max(0, Math.abs(p.x - pr.x) - half);
      return Math.hypot(dx, p.y - pr.y);
    }

    nearestInteractable() {
      let best = null, bd = 2.6 * PPM;
      for (const pr of this.scene.props) {
        if (!pr.interact || !pr.label) continue;
        const d = this.interactDist(pr);
        if (d < bd) { bd = d; best = pr; }
      }
      // NPC được ưu tiên khi đứng gần (bán kính 2m)
      for (const n of this.scene.npcs) {
        const d = U.dist(this.player, n) - 0.6 * PPM;
        if (d < Math.min(bd, 2 * PPM)) { bd = d; best = n; }
      }
      return best;
    }

    /** NPC: đi tuần theo path, dừng nghỉ, quay mặt về người chơi khi lại gần hoặc đang nói chuyện. */
    updateNpcs(dt) {
      const p = this.player, r = 0.4 * PPM;
      for (const n of this.scene.npcs) {
        const near = U.dist(p, n) < 3 * PPM;
        n.moving = false;
        if (n.path && !n.talking && !near) {
          if (n.wait > 0) n.wait -= dt;
          else {
            const [tx, ty] = n.path[n.wpI], dx = tx - n.x, dy = ty - n.y, d = Math.hypot(dx, dy);
            const v = (n.npc.speed || 1.5) * PPM * dt;
            if (d <= v) { n.x = tx; n.y = ty; n.wpI = (n.wpI + 1) % n.path.length; n.wait = U.rand(1, 3); }
            else { n.x += (dx / d) * v; n.y += (dy / d) * v; n.moving = true; n.mvx = dx / d; n.mvy = dy / d; n.aim = Math.atan2(dy, dx); }
          }
        }
        if (near || n.talking) n.aim = Math.atan2(p.y - n.y, p.x - n.x);
        else if (!n.path) n.aim = Math.PI / 2;
        // người chơi không đi xuyên NPC
        const dx = p.x - n.x, dy = p.y - n.y, d = Math.hypot(dx, dy), mn = r + D.player.radiusM * PPM;
        if (d < mn && d > 0.01) { p.x = n.x + (dx / d) * mn; p.y = n.y + (dy / d) * mn; }
      }
    }

    interact() {
      const pr = this.nearestInteractable();
      if (!pr) return;
      const UI = TT.UI;
      switch (pr.interact) {
        case 'bicanh': UI.openMenu('bicanh'); break;
        case 'exit': UI.toast('Đã rời Bí Cảnh an toàn.'); this.enterDongPhu(); break;
        case 'tribulation': UI.openTribulationPrep(); break;
        case 'alchemy': UI.openMenu('alchemy'); break;
        case 'skins': UI.openMenu('skins'); break;
        case 'dongphu': UI.openMenu('dongphu'); break;
        case 'help': UI.openHelp(); break;
        case 'gather': this.gather(pr); break;
        case 'npc': UI.openDialog(pr); break;
      }
    }

    tryDash() {
      const p = this.player, cfg = D.player.dash, st = this.state;
      if (p.dashCd > 0 || p.dead) return;
      if (st.mp < cfg.mpCost) { TT.UI.toast('Linh lực không đủ!'); return; }
      let dx = (this.keys.d || this.keys.arrowright ? 1 : 0) - (this.keys.a || this.keys.arrowleft ? 1 : 0);
      let dy = (this.keys.s || this.keys.arrowdown ? 1 : 0) - (this.keys.w || this.keys.arrowup ? 1 : 0);
      if (!dx && !dy) { dx = Math.cos(p.aim); dy = Math.sin(p.aim); }
      const l = Math.hypot(dx, dy);
      p.dashDir = [dx / l, dy / l];
      p.dashT = cfg.durationSec; p.dashCd = cfg.cooldownSec;
      st.mp -= cfg.mpCost;
      for (let i = 0; i < 14; i++) this.spark(p.x, p.y, '#9fd8ff', 3, 0.4);
    }

    /** Dùng vật phẩm tiêu hao. Trả về true nếu dùng thành công. */
    useConsumable(id) {
      const st = this.state, def = D.items[id];
      if (!def || def.category !== 'Consumable' || !def.effect) { TT.UI.toast('Vật phẩm này chỉ dùng trong Trận Pháp Độ Kiếp.'); return false; }
      if (st.inventory.count(id) <= 0) { TT.UI.toast('Đã hết ' + def.name); return false; }
      const fx = def.effect;
      if (fx.danDoc < 0 && st.danDoc <= 0) { TT.UI.toast('Không có Đan độc để giải.'); return false; }
      if (fx.tuviPct && (st.atBottleneck() || st.realmDef.final)) { TT.UI.toast('Đang ở bình cảnh, Tụ Khí Đan vô dụng. Hãy Độ Kiếp!'); return false; }
      st.inventory.remove(id, 1);
      if (fx.healPct) st.hp = Math.min(st.stats.maxHp, st.hp + st.stats.maxHp * fx.healPct);
      if (fx.mpPct) st.mp = Math.min(st.stats.maxMp, st.mp + st.stats.maxMp * fx.mpPct);
      if (fx.tuviPct) { const m = st.addTuvi(Math.ceil(st.tuviNeeded * fx.tuviPct)); if (m) this.onBreakthrough(m); }
      if (fx.danDoc) st.addDanDoc(fx.danDoc);
      if (this.player) for (let i = 0; i < 10; i++) this.spark(this.player.x, this.player.y, def.color, 2, 0.6);
      TT.UI.refresh();
      return true;
    }

    useQuick(i) {
      const id = this.state.quickSlots[i];
      if (id) this.useConsumable(id);
    }

    onBreakthrough(msg) {
      TT.UI.banner(msg);
      this.rebuildSwords();
      if (this.player) for (let i = 0; i < 40; i++) this.spark(this.player.x, this.player.y, '#ffe27a', 5, 1.2);
    }

    // ------------------------------------------------------------------ loop
    loop(ts) {
      const dt = Math.min(0.05, (ts - this.last) / 1000);
      this.last = ts;
      if (!this.paused) { this.t += dt; this.update(dt); }
      this.render();
      TT.UI.hud(this);
      requestAnimationFrame(t => this.loop(t));
    }

    update(dt) {
      const sc = this.scene, st = this.state, p = this.player;
      if (this.swords.length !== st.stats.swords) this.rebuildSwords();
      this.mouse.wx = this.mouse.x + this.cam.x; this.mouse.wy = this.mouse.y + this.cam.y;
      if (!p.dead) this.updatePlayer(dt);
      this.updateSwords(dt);
      if (sc.npcs.length) this.updateNpcs(dt);
      if (sc.type === 'bicanh') this.updateBiCanh(dt);
      if (sc.type === 'loidai') this.updateTribulation(dt);
      this.updateEnemies(dt);
      this.updateProjectiles(dt);
      this.updatePickups(dt);
      // hiệu ứng
      for (const q of sc.particles) {
        q.x += q.vx * dt; q.y += q.vy * dt; q.life -= dt;
        if (q.grow) q.size += q.grow * dt;
        else if (q.petal) { q.spin += dt * 3; q.x += Math.sin(q.spin) * 12 * dt; }
        else if (q.drift) { /* hạt môi trường giữ nguyên vận tốc */ }
        else { q.vx *= 0.94; q.vy *= 0.94; }
      }
      sc.particles = sc.particles.filter(q => q.life > 0);
      for (const tx of sc.texts) { tx.y -= 30 * dt; tx.life -= dt; }
      sc.texts = sc.texts.filter(tx => tx.life > 0);
      for (const b of sc.bolts) b.life -= dt;
      sc.bolts = sc.bolts.filter(b => b.life > 0);
      // hạt môi trường (đom đóm, tàn lửa, tuyết, cánh hoa) theo cảnh
      const amb = sc.ambient;
      if (Math.random() < dt * amb.rate) {
        const x = this.cam.x + Math.random() * this.W, y = this.cam.y + Math.random() * this.H;
        sc.particles.push({ x, y, vx: U.rand(-8, 8), vy: U.rand(amb.vy[0], amb.vy[1]), life: 3, max: 3, color: amb.color, size: 1.6, add: true, drift: true });
      }
      // hiệu ứng phát ra từ đạo cụ gần camera (khói, cánh hoa, tàn lửa, bào tử)
      const push = q => sc.particles.push(q);
      for (const pr of sc.props) {
        if (!pr.env || pr.x < this.cam.x - 200 || pr.x > this.cam.x + this.W + 200 || pr.y < this.cam.y - 100 || pr.y > this.cam.y + this.H + 300) continue;
        TT.Env.emit(pr, dt, push);
      }
      if (sc.particles.length > 900) sc.particles.splice(0, sc.particles.length - 900);
      // camera
      const tx = p.x - this.W / 2, ty = p.y - this.H / 2;
      this.cam.x = U.lerp(this.cam.x, tx, Math.min(1, dt * 6));
      this.cam.y = U.lerp(this.cam.y, ty, Math.min(1, dt * 6));
      this.cam.shake = Math.max(0, this.cam.shake - dt * 30);
      this.flash = Math.max(0, this.flash - dt * 3);
    }

    updatePlayer(dt) {
      const p = this.player, st = this.state, P = D.player;
      p.aim = Math.atan2(this.mouse.wy - p.y, this.mouse.wx - p.x);
      p.dashCd = Math.max(0, p.dashCd - dt);
      p.invuln = Math.max(0, p.invuln - dt);
      p.castT = Math.max(0, p.castT - dt);
      p.hurtT = Math.max(0, p.hurtT - dt);
      for (const gh of p.ghosts) gh.life -= dt;
      p.ghosts = p.ghosts.filter(gh => gh.life > 0);
      st.mp = Math.min(st.stats.maxMp, st.mp + P.mpRegenPerSec * dt);
      // Kiếm Thuẫn
      p.shield = this.mouse.right && st.mp > 1;
      if (p.shield) st.mp -= P.shield.mpPerSec * dt;
      p.slowT = Math.max(0, (p.slowT || 0) - dt);
      if (p.slowT > 0) p.slow *= 1 - p.slowAmt;
      let speed = st.stats.moveSpeed * PPM * p.slow * (p.shield ? 1 - P.shield.slow : 1);
      if (p.dashT > 0) {
        p.dashT -= dt;
        const v = (P.dash.distanceM * PPM) / P.dash.durationSec;
        p.x += p.dashDir[0] * v * dt; p.y += p.dashDir[1] * v * dt;
        p.mvx = p.dashDir[0]; p.mvy = p.dashDir[1];
        p.ghostT -= dt;
        if (p.ghostT <= 0 && p.lastFrame) { p.ghostT = 0.03; p.ghosts.push({ x: p.x, y: p.y, fr: p.lastFrame, life: 0.3, max: 0.3 }); }
      } else {
        let dx = (this.keys.d || this.keys.arrowright ? 1 : 0) - (this.keys.a || this.keys.arrowleft ? 1 : 0);
        let dy = (this.keys.s || this.keys.arrowdown ? 1 : 0) - (this.keys.w || this.keys.arrowup ? 1 : 0);
        const l = Math.hypot(dx, dy);
        p.moving = l > 0;
        p.mvx = l ? dx / l : 0; p.mvy = l ? dy / l : 0;
        if (l) { p.x += (dx / l) * speed * dt; p.y += (dy / l) * speed * dt; }
      }
      this.collideWorld(p, P.radiusM * PPM);
      p.slow = 1;
      // bắn phi kiếm
      p.fireCd = Math.max(0, (p.fireCd || 0) - dt);
      if (this.mouse.left && p.fireCd <= 0 && !p.shield) {
        const s = this.swords.find(w => w.state === 'orbit');
        if (s) {
          s.state = 'fly'; s.dx = Math.cos(p.aim); s.dy = Math.sin(p.aim); s.ang = p.aim;
          s.trav = 0; s.pierce = st.stats.pierce; s.hit.clear();
          p.fireCd = P.swordFireInterval;
          p.castT = CAST_DURATION;
        }
      }
    }

    collideWorld(ent, r) {
      const sc = this.scene;
      for (const pr of sc.props) {
        if (pr.env) {
          if (Math.abs(ent.x - pr.x) > 320 || Math.abs(ent.y - pr.y) > 120) continue;
          for (const c of pr.colliders) {
            if (c.type === 'circle') {
              const cx = pr.x + c.x, cy = pr.y + c.y, m = r + c.r;
              const dx = ent.x - cx, dy = ent.y - cy, d = Math.hypot(dx, dy);
              if (d < m && d > 0.01) { ent.x = cx + (dx / d) * m; ent.y = cy + (dy / d) * m; }
            } else {
              const x0 = pr.x + c.x - r, x1 = pr.x + c.x + c.w + r, y0 = pr.y + c.y - r, y1 = pr.y + c.y + c.h + r;
              if (ent.x > x0 && ent.x < x1 && ent.y > y0 && ent.y < y1) {
                const push = [[ent.x - x0, -1, 0], [x1 - ent.x, 1, 0], [ent.y - y0, 0, -1], [y1 - ent.y, 0, 1]].sort((a, b) => a[0] - b[0])[0];
                ent.x += push[1] * push[0]; ent.y += push[2] * push[0];
              }
            }
          }
          continue;
        }
        if (!pr.solid) continue;
        const dx = ent.x - pr.x, dy = ent.y - pr.y, d = Math.hypot(dx, dy), m = r + pr.radius;
        if (d < m && d > 0.01) { ent.x = pr.x + (dx / d) * m; ent.y = pr.y + (dy / d) * m; }
      }
      if (sc.type === 'loidai') {
        const c = sc.sizePx / 2, R = this.trib.cfg.radiusM * PPM - r;
        const dx = ent.x - c, dy = ent.y - c, d = Math.hypot(dx, dy);
        if (d > R) { ent.x = c + (dx / d) * R; ent.y = c + (dy / d) * R; }
      } else {
        ent.x = U.clamp(ent.x, r, sc.sizePx - r); ent.y = U.clamp(ent.y, r, sc.sizePx - r);
      }
    }

    updateSwords(dt) {
      const p = this.player, st = this.state, n = this.swords.length;
      const speed = st.stats.swordSpeed * PPM;
      const range = D.player.swordRangeM * PPM;
      this.swords.forEach((s, i) => {
        if (s.state === 'orbit') {
          const rad = (p.shield ? 0.9 : 1.1) * PPM;
          const a = (i / n) * Math.PI * 2 + this.t * (p.shield ? 6 : 1.6);
          const tx = p.x + Math.cos(a) * rad, ty = p.y + Math.sin(a) * rad * 0.7 - 10;
          s.x = U.lerp(s.x, tx, Math.min(1, dt * 14)); s.y = U.lerp(s.y, ty, Math.min(1, dt * 14));
          s.ang = p.shield ? a + Math.PI / 2 : -Math.PI / 2 + Math.sin(this.t * 2 + i) * 0.2;
        } else if (s.state === 'fly') {
          s.x += s.dx * speed * dt; s.y += s.dy * speed * dt; s.trav += speed * dt;
          this.swordHits(s, true);
          if (s.trav >= range || s.pierce < 0) s.state = 'return';
        } else {
          const dx = p.x - s.x, dy = p.y - s.y, d = Math.hypot(dx, dy);
          s.ang = Math.atan2(dy, dx);
          const v = speed * 1.3 * dt;
          if (d < v + 0.5 * PPM) { s.state = 'orbit'; s.hit.clear(); }
          else { s.x += (dx / d) * v; s.y += (dy / d) * v; this.swordHits(s, false); }
        }
        s.trail.push([s.x, s.y]);
        if (s.trail.length > (s.state === 'orbit' ? 4 : 10)) s.trail.shift();
      });
      // kiếm khí tách
      const sc = this.scene;
      for (const q of sc.qi) {
        q.x += q.dx * q.v * dt; q.y += q.dy * q.v * dt; q.life -= dt;
        for (const e of sc.enemies) {
          if (!q.hit.has(e) && U.dist(q, e) < e.def.radiusM * PPM + 8) { q.hit.add(e); this.damageEnemy(e, q.dmg, { noProc: true }); q.life = 0; break; }
        }
      }
      sc.qi = sc.qi.filter(q => q.life > 0);
    }

    swordHits(s, consumePierce) {
      const sc = this.scene, st = this.state;
      for (const e of sc.enemies) {
        if (e.dead || s.hit.has(e)) continue;
        if (Math.hypot(e.x - s.x, e.y - s.y) < e.def.radiusM * PPM + 10) {
          s.hit.add(e);
          this.damageEnemy(e, st.stats.atk * U.rand(0.9, 1.1), { from: s });
          if (consumePierce) { s.pierce--; if (s.pierce < 0) return; }
        }
      }
    }

    /** Tính và gây sát thương lên yêu thú, kích hoạt hiệu ứng Unique. */
    damageEnemy(e, base, opts) {
      const st = this.state.stats, p = this.player, sc = this.scene;
      opts = opts || {};
      const crit = !opts.noCrit && Math.random() * 100 < st.critRate;
      let dmg = base * (1 + st.elemDmg / 100) * (crit ? st.critDmg / 100 : 1);
      dmg = Math.max(1, dmg - e.def_);
      e.hp -= dmg; e.hitFlash = 0.08;
      const kb = opts.from ? Math.atan2(e.y - p.y, e.x - p.x) : 0;
      if (!e.def.boss) { e.x += Math.cos(kb) * 6; e.y += Math.sin(kb) * 6; }
      sc.texts.push({ x: e.x + U.rand(-8, 8), y: e.y - 20, text: U.fmt(dmg), color: crit ? '#ffd23f' : '#ffffff', size: crit ? 20 : 14, life: 0.8 });
      for (let i = 0; i < (crit ? 8 : 4); i++) this.spark(e.x, e.y, crit ? '#ffd23f' : '#9fe8ff', 2.5, 0.35);
      if (crit && st.lifesteal > 0) this.state.hp = Math.min(st.maxHp, this.state.hp + dmg * st.lifesteal / 100);
      if (!opts.noProc) {
        p.hitCount++;
        if (st.thunder > 0 && p.hitCount % 5 === 0) {
          sc.bolts.push({ x: e.x, y: e.y, life: 0.25, seed: Math.random() * 1e6, color: '#c9a4ff' });
          this.cam.shake = Math.max(this.cam.shake, 5);
          for (const o of sc.enemies) if (!o.dead && U.dist(o, e) < 1.5 * PPM) this.damageEnemy(o, this.state.stats.atk * st.thunder / 100, { noProc: true });
        }
        if (st.aoe > 0) {
          const R = st.aoe * PPM;
          sc.particles.push({ x: e.x, y: e.y, vx: 0, vy: 0, life: 0.25, max: 0.25, color: '#7fd6ff', size: R, add: true, ring: true });
          for (const o of sc.enemies) if (o !== e && !o.dead && U.dist(o, e) < R) this.damageEnemy(o, base * 0.5, { noProc: true, noCrit: true });
        }
        if (st.split > 0 && opts.from && Math.random() * 100 < st.split) {
          const a = Math.atan2(opts.from.dy, opts.from.dx);
          for (const da of [-0.5, 0.5]) sc.qi.push({ x: e.x, y: e.y, dx: Math.cos(a + da), dy: Math.sin(a + da), v: 16 * PPM, life: 0.35, dmg: base * 0.5, hit: new Set([e]) });
        }
      }
      if (e.hp <= 0 && !e.dead) this.killEnemy(e);
    }

    killEnemy(e) {
      const sc = this.scene, st = this.state;
      e.dead = true;
      sc.kills++;
      for (let i = 0; i < (e.def.boss ? 60 : 14); i++) this.spark(e.x, e.y, e.def.eye, 3.5, 0.8);
      const m = st.addTuvi(Math.ceil(e.def.tuvi * sc.scale));
      if (m) this.onBreakthrough(m);
      this.dropLinhThach(e.x, e.y, Math.ceil(e.def.linhThach * Math.sqrt(sc.scale) * U.rand(0.7, 1.3)));
      const B = D.bicanh;
      if (e.def.boss) {
        for (const d of B.bossDrops) this.dropItem(e.x, e.y, TT.Items.createStack(d.id, U.randInt(d.min, d.max)));
        for (let i = 0; i < B.bossEquipDrops; i++) {
          const rar = U.weighted(Object.keys(D.bossRarityWeights), k => D.bossRarityWeights[k]);
          this.dropItem(e.x, e.y, TT.Items.createEquipment({ level: st.itemLevel, rarity: rar }));
        }
        this.addProp('portal', e.x, e.y, 50, { color: '#ffd23f', interact: 'exit', label: 'Rời Bí Cảnh [E]', light: '#ffd23f' });
        this.sortProps();
        sc.boss = null;
        TT.UI.banner('Đã trảm Yêu Vương! Cổng truyền tống mở ra.');
      } else {
        if (Math.random() < B.equipDropChance) this.dropItem(e.x, e.y, TT.Items.createEquipment({ level: st.itemLevel }));
        for (const d of B.matDrops) if (Math.random() < d.chance) this.dropItem(e.x, e.y, TT.Items.createStack(d.id, U.randInt(d.min, d.max)));
      }
    }

    dropItem(x, y, item) {
      const a = Math.random() * Math.PI * 2, v = U.rand(40, 120);
      this.scene.pickups.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, item, t: 0 });
    }
    dropLinhThach(x, y, n) {
      const a = Math.random() * Math.PI * 2, v = U.rand(30, 90);
      this.scene.pickups.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, linhThach: n, t: 0 });
    }

    updatePickups(dt) {
      const sc = this.scene, p = this.player, st = this.state;
      for (const k of sc.pickups) {
        k.t += dt;
        k.x += k.vx * dt; k.y += k.vy * dt; k.vx *= 0.9; k.vy *= 0.9;
        const d = U.dist(k, p);
        if (k.t > 0.4 && d < D.world.pickupMagnetM * PPM && !k.blocked) {
          const v = 420 * dt;
          k.x += ((p.x - k.x) / d) * v; k.y += ((p.y - k.y) / d) * v;
        }
        if (k.t > 0.4 && d < 0.6 * PPM) {
          if (k.linhThach) { st.linhThach += k.linhThach; k.gone = true; }
          else {
            const left = st.inventory.add(k.item);
            if (left === 0) { k.gone = true; TT.UI.toast('Nhặt: ' + TT.Items.displayName(k.item) + (k.item.kind === 'stack' ? ' x' + k.item.count : '')); }
            else { if (k.item.kind === 'stack') k.item.count = left; if (!k.blocked) TT.UI.toast('Túi Trữ Vật đã đầy!'); k.blocked = true; }
          }
        }
        if (k.blocked && d > 3 * PPM) k.blocked = false;
      }
      sc.pickups = sc.pickups.filter(k => !k.gone);
    }

    // ------------------------------------------------------------------ Bí Cảnh
    updateBiCanh(dt) {
      const sc = this.scene, B = D.bicanh, p = this.player;
      if (!sc.bossSpawned) {
        sc.spawnT -= dt;
        if (sc.spawnT <= 0 && sc.enemies.length < B.maxAlive) {
          sc.spawnT = B.spawnEvery;
          const W8 = sc.biome ? D.biomes[sc.biome].spawnWeights : B.spawnWeights;
          const type = U.weighted(Object.keys(W8), k => W8[k]);
          const pack = D.enemies[type].pack || 1;
          const a = Math.random() * Math.PI * 2, dist = Math.max(this.W, this.H) * 0.6 + 40;
          for (let i = 0; i < pack; i++) this.spawnEnemy(type, p.x + Math.cos(a) * dist + U.rand(-30, 30), p.y + Math.sin(a) * dist + U.rand(-30, 30));
        }
        if (sc.kills >= B.killsForBoss) {
          sc.bossSpawned = true;
          const bossType = (sc.biome && D.biomes[sc.biome].boss) || 'YEU_VUONG';
          sc.boss = this.spawnEnemy(bossType, p.x + 8 * PPM, p.y - 6 * PPM);
          TT.UI.banner(D.enemies[bossType].name + ' xuất hiện!');
          this.cam.shake = 12;
        }
      }
      if (this.state.hp <= 0 && !p.dead) {
        p.dead = true;
        const lost = Math.floor(this.state.linhThach * B.deathLinhThachLoss);
        this.state.linhThach -= lost;
        TT.UI.banner(`Thân tử đạo tiêu... mất ${U.fmt(lost)} Linh Thạch`);
        setTimeout(() => { this.state.hp = this.state.stats.maxHp; this.enterDongPhu(); }, 2200);
      }
    }

    spawnEnemy(type, x, y) {
      const sc = this.scene, def = D.enemies[type];
      const s = sc.scale;
      const e = { type, def, x: U.clamp(x, 20, sc.sizePx - 20), y: U.clamp(y, 20, sc.sizePx - 20), vx: 0, vy: 0,
        hp: def.hp * s, maxHp: def.hp * s, atk: def.atk * s, def_: def.def * s, atkCd: 0, shootCd: U.rand(0.5, def.shootEvery || 1),
        chargeCd: def.chargeEvery || 0, chargeT: 0, telegraph: 0, hitFlash: 0, seed: Math.random() * 10 };
      sc.enemies.push(e);
      return e;
    }

    updateEnemies(dt) {
      const sc = this.scene, p = this.player, st = this.state;
      for (const e of sc.enemies) {
        if (e.dead) continue;
        e.hitFlash -= dt; e.atkCd -= dt;
        const def = e.def, r = def.radiusM * PPM;
        const dx = p.x - e.x, dy = p.y - e.y, d = Math.hypot(dx, dy) || 1;
        let sp = def.speedMps * PPM;
        let mx = dx / d, my = dy / d;
        if (def.ai === 'ranged') {
          if (d < def.keepDistM * PPM) { mx = -mx; my = -my; } else if (d < def.keepDistM * PPM + 40) sp = 0;
          e.shootCd -= dt;
          if (e.shootCd <= 0 && d < 14 * PPM) { e.shootCd = def.shootEvery; this.enemyShoot(e, Math.atan2(dy, dx), def.projSpeedMps); }
        }
        // lao húc (boss, Tuyết Viên...): ngắm 0.6s có tia đỏ báo trước rồi lao thẳng
        if (def.chargeEvery) {
          e.chargeCd -= dt;
          if (e.telegraph > 0) {
            e.telegraph -= dt; sp = 0;
            if (e.telegraph <= 0) { e.chargeT = 0.7; e.cdx = dx / d; e.cdy = dy / d; }
          } else if (e.chargeT > 0) {
            e.chargeT -= dt; sp = def.chargeSpeedMps * PPM; mx = e.cdx; my = e.cdy;
            if (Math.random() < 0.6) this.spark(e.x, e.y, def.eye, 3, 0.4);
          } else if (e.chargeCd <= 0 && d < 12 * PPM) { e.chargeCd = def.chargeEvery; e.telegraph = 0.6; }
        }
        // xả đạn vòng tròn (boss)
        if (def.ringCount) {
          e.shootCd -= dt;
          if (e.shootCd <= 0) {
            e.shootCd = def.shootEvery;
            for (let i = 0; i < def.ringCount; i++) this.enemyShoot(e, (i / def.ringCount) * Math.PI * 2 + this.t, def.projSpeedMps);
          }
        }
        e.vx = mx * sp; e.vy = my * sp;
        e.x += e.vx * dt; e.y += e.vy * dt;
        // tách nhau
        for (const o of sc.enemies) {
          if (o === e || o.dead) continue;
          const ox = e.x - o.x, oy = e.y - o.y, od = Math.hypot(ox, oy), m = r + o.def.radiusM * PPM;
          if (od < m && od > 0.01) { const push = (m - od) * 0.5; e.x += (ox / od) * push; e.y += (oy / od) * push; }
        }
        this.collideWorld(e, r * 0.8);
        // cận chiến
        if (d < r + D.player.radiusM * PPM + 4 && e.atkCd <= 0 && !p.dead) {
          e.atkCd = def.boss ? 0.6 : 0.9;
          this.hurtPlayer(e.atk * (e.chargeT > 0 ? 1.8 : 1), def.eye);
        }
      }
      sc.enemies = sc.enemies.filter(e => !e.dead);
    }

    enemyShoot(e, ang, spd) {
      const def = e.def;
      this.scene.eproj.push({ x: e.x, y: e.y, dx: Math.cos(ang), dy: Math.sin(ang), v: spd * PPM, dmg: e.atk * 0.9, life: 3,
        color: def.projColor || '#ff7a2a', slow: def.projSlow || null });
    }

    updateProjectiles(dt) {
      const sc = this.scene, p = this.player;
      for (const b of sc.eproj) {
        b.x += b.dx * b.v * dt; b.y += b.dy * b.v * dt; b.life -= dt;
        if (Math.random() < 0.5) sc.particles.push({ x: b.x, y: b.y, vx: 0, vy: 0, life: 0.3, max: 0.3, color: b.color, size: 4, add: true });
        if (p.shield) {
          for (const s of this.swords) if (s.state === 'orbit' && Math.hypot(s.x - b.x, s.y - b.y) < 12) { b.life = 0; this.spark(b.x, b.y, '#9fe8ff', 3, 0.3); }
        }
        if (b.life > 0 && Math.hypot(p.x - b.x, p.y - b.y) < D.player.radiusM * PPM + 6 && !p.dead) {
          b.life = 0; this.hurtPlayer(b.dmg, b.color);
          if (b.slow && !p.shield) { p.slowT = b.slow.sec; p.slowAmt = b.slow.amount; TT.UI.toast(b.color === '#bfe6ff' ? 'Bị băng tiễn làm chậm!' : 'Bị tơ độc quấn chân!'); }
        }
      }
      sc.eproj = sc.eproj.filter(b => b.life > 0);
    }

    /** Sát thương lên người chơi. raw=true bỏ qua phòng ngự (Lôi Kiếp). */
    hurtPlayer(dmg, color, raw) {
      const p = this.player, st = this.state;
      if (p.dead) return;
      if (!raw) {
        if (p.invuln > 0) return;
        dmg = dmg * 100 / (100 + st.stats.def);
        p.invuln = D.player.hurtInvulnSec * 0.5;
      }
      if (p.shield) dmg *= 1 - D.player.shield.damageReduction;
      st.hp -= dmg;
      p.hurtT = HURT_ANIM_DURATION;
      this.scene.texts.push({ x: p.x, y: p.y - 30, text: '-' + U.fmt(dmg), color: '#ff5050', size: 16, life: 0.9 });
      for (let i = 0; i < 6; i++) this.spark(p.x, p.y, color || '#ff4040', 2.5, 0.4);
      this.cam.shake = Math.max(this.cam.shake, 4);
      TT.UI.hurt();
    }

    // ------------------------------------------------------------------ Độ Kiếp
    /** Sát thương đạo sét thứ k (GDD 3.3). */
    static tribulationDamage(base, k, danDoc, reduction) {
      const L = D.lightning;
      return base * (1 + L.stepK * k) * (1 + danDoc / L.danDocDivisor) * (1 - reduction);
    }

    updateTribulation(dt) {
      const tb = this.trib, sc = this.scene, p = this.player, st = this.state, L = D.lightning;
      if (tb.done) return;
      if (tb.phase === 'gap') {
        tb.timer -= dt;
        if (tb.timer <= 0) {
          if (tb.wave >= tb.cfg.waves) return this.finishTribulation(true);
          tb.wave++;
          tb.phase = 'wave';
          this.scheduleWave(tb.wave);
          this.flash = 0.4;
        }
      } else {
        tb.waveT += dt;
        for (const ev of tb.events) if (!ev.fired && tb.waveT >= ev.at) { ev.fired = true; ev.fn(); }
        if (tb.events.every(ev => ev.fired) && sc.strikes.length === 0) {
          tb.phase = 'gap'; tb.timer = tb.wave >= tb.cfg.waves ? 1.0 : L.waveGapSec;
          if (tb.heal > 0 && st.hp > 0) {
            st.hp = Math.min(st.stats.maxHp, st.hp + st.stats.maxHp * tb.heal);
            for (let i = 0; i < 20; i++) this.spark(p.x, p.y, '#ff9a3c', 3, 0.8);
          }
          if (tb.wave < tb.cfg.waves) TT.UI.toast(`Vượt qua đạo thứ ${tb.wave}!`);
        }
      }
      // sét
      const pr = D.player.radiusM * PPM;
      for (const s of sc.strikes) {
        s.t += dt;
        if (s.track && s.t < s.trackEnd) {
          const dx = p.x - s.x, dy = p.y - s.y, d = Math.hypot(dx, dy);
          const v = L.trackSpeedMps * PPM * dt * (s.big ? 1.6 : 1);
          if (d > v) { s.x += (dx / d) * v; s.y += (dy / d) * v; } else { s.x = p.x; s.y = p.y; }
        }
        if (!s.struck && s.t >= s.lockEnd) {
          s.struck = true;
          this.cam.shake = Math.max(this.cam.shake, s.big ? 18 : 9);
          this.flash = Math.max(this.flash, s.big ? 0.9 : 0.45);
          for (let i = 0; i < 18; i++) this.spark(s.x, s.y, '#c9a4ff', 6, 0.6);
        }
        if (s.struck && !s.hitDone && s.t < s.lockEnd + L.hitWindow && !p.dead) {
          if (Math.hypot(p.x - s.x, p.y - s.y) < s.radius + pr) {
            s.hitDone = true;
            if (tb.block > 0) { tb.block--; TT.UI.toast('Tị Lôi Phù đỡ một đạo sét!'); for (let i = 0; i < 25; i++) this.spark(p.x, p.y, '#f7dc6f', 5, 0.7); }
            else this.hurtPlayer(s.dmg, '#c9a4ff', true);
          }
        }
        if (s.t >= s.strikeEnd) {
          s.gone = true;
          sc.scorches.push({ x: s.x, y: s.y, r: s.radius, t: 0, life: tb.cfg.scorchSec, dps: s.dmg * L.scorchDpsRatio });
        }
      }
      sc.strikes = sc.strikes.filter(s => !s.gone);
      for (const z of sc.scorches) {
        z.t += dt;
        if (Math.hypot(p.x - z.x, p.y - z.y) < z.r && !p.dead) {
          p.slow = 1 - L.scorchSlow;
          st.hp -= z.dps * dt;
          if (Math.random() < dt * 10) this.spark(p.x, p.y, '#c070ff', 2, 0.3);
        }
      }
      sc.scorches = sc.scorches.filter(z => z.t < z.life);
      if (st.hp <= 0) this.finishTribulation(false);
    }

    scheduleWave(k) {
      const tb = this.trib, L = D.lightning, p = this.player, sc = this.scene;
      tb.events = []; tb.waveT = 0;
      const dmg = Game.tribulationDamage(tb.cfg.baseDamage, k, this.state.danDoc, tb.reduction);
      const c = sc.sizePx / 2, R = tb.cfg.radiusM * PPM;
      let at = 0;
      const mk = (x, y, track, big, extraTrack) => sc.strikes.push({
        x, y, t: 0, track, big, radius: (big ? L.finalRadiusM : L.warnRadiusM) * PPM, dmg: big ? dmg * 1.5 : dmg,
        trackEnd: track ? L.trackEnd + (extraTrack || 0) : 0, lockEnd: L.lockEnd + (extraTrack || 0), strikeEnd: L.strikeEnd + (extraTrack || 0), seed: Math.random() * 1e6
      });
      for (const pat of tb.cfg.pattern[k - 1]) {
        if (pat === 'track') {
          const n = L.trackStrikesBase + Math.floor(k / 2);
          for (let i = 0; i < n; i++) tb.events.push({ at: at + i * L.trackInterval, fn: () => mk(p.x, p.y, true, false) });
          at += n * L.trackInterval + 0.3;
        } else if (pat === 'grid') {
          const sp = L.gridSpacingM * PPM;
          for (const parity of [0, 1]) {
            const ox = U.rand(-sp / 2, sp / 2), oy = U.rand(-sp / 2, sp / 2);
            tb.events.push({ at, fn: () => {
              for (let gx = -12; gx <= 12; gx++) for (let gy = -12; gy <= 12; gy++) {
                if (((gx + gy) & 1) !== parity) continue;
                const x = c + gx * sp + ox, y = c + gy * sp + oy;
                if (Math.hypot(x - c, y - c) < R) mk(x, y, false, false, 0.3);
              }
            } });
            at += 1.5;
          }
        } else if (pat === 'final') {
          tb.events.push({ at, fn: () => {
            mk(p.x, p.y, true, true, 0.6);
            for (let i = 0; i < L.finalRing; i++) {
              const a = (i / L.finalRing) * Math.PI * 2;
              mk(p.x + Math.cos(a) * 5.5 * PPM, p.y + Math.sin(a) * 5.5 * PPM, false, false, 0.9);
            }
          } });
          at += 2.2;
        }
      }
    }

    finishTribulation(success) {
      const tb = this.trib, st = this.state;
      tb.done = true;
      if (success) {
        st.advanceRealm();
        this.onBreakthrough(`Độ Kiếp thành công! Bước vào ${st.realmLabel()}!`);
        if (st.realmDef.final) TT.UI.banner('Chúc mừng! Đạo hữu đã đạt Hóa Thần — hoàn thành hành trình!');
      } else {
        this.player.dead = true;
        st.tuvi = Math.floor(st.tuvi * (1 - D.failTuviLoss));
        TT.UI.banner('Độ Kiếp thất bại... Tu vi tổn hao ' + Math.round(D.failTuviLoss * 100) + '%');
      }
      setTimeout(() => { st.hp = st.stats.maxHp; this.enterDongPhu(); }, 2800);
    }

    // ------------------------------------------------------------------ fx
    spark(x, y, color, size, life) {
      const a = Math.random() * Math.PI * 2, v = U.rand(30, 160);
      this.scene.particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life, max: life, color, size: size * U.rand(0.5, 1), add: true });
    }

    // ------------------------------------------------------------------ render
    render() {
      const ctx = this.ctx, sc = this.scene, p = this.player, st = this.state;
      const W = this.W, H = this.H;
      const sx = (Math.random() - 0.5) * this.cam.shake, sy = (Math.random() - 0.5) * this.cam.shake;
      const cx = Math.round(this.cam.x + sx), cy = Math.round(this.cam.y + sy);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = '#030406'; ctx.fillRect(0, 0, W, H);
      ctx.setTransform(1, 0, 0, 1, -cx, -cy);
      // nền
      ctx.drawImage(sc.ground, 0, 0);
      // decal sát nền (ao sen, hồ dung nham, linh tuyền, tuyết đọng)
      for (const pr of sc.props) {
        if (!pr.env || !TT.Env.DEFS[pr.kind].decal) continue;
        if (pr.x < cx - 150 || pr.x > cx + W + 150 || pr.y < cy - 80 || pr.y > cy + H + 80) continue;
        TT.Env.draw(ctx, pr, this.t, 1);
      }
      const lights = [];
      const t = this.t;
      if (sc.type === 'dongphu') {
        const pz = D.sect.plaza, px = sc.sizePx / 2 + pz[0] * PPM, py = sc.sizePx / 2 + pz[1] * PPM;
        Art.drawFormation(ctx, px, py, (pz[2] - 1.5) * PPM, t, '#e9b44c', 0.4);
        lights.push([px, py, pz[2] * PPM, 0.3]);
      }
      if (sc.type === 'loidai') {
        Art.drawFormation(ctx, sc.sizePx / 2, sc.sizePx / 2, this.trib.cfg.radiusM * PPM, t, '#b48cff', 0.5);
        lights.push([sc.sizePx / 2, sc.sizePx / 2, this.trib.cfg.radiusM * PPM * 1.1, 0.25]);
      }
      // vùng đất cháy
      ctx.globalCompositeOperation = 'lighter';
      for (const z of sc.scorches) {
        const a = 0.35 * (1 - z.t / z.life) + 0.1;
        Art.glow(ctx, z.x, z.y, z.r, '#9b40ff', a);
        ctx.strokeStyle = Art.rgba('#d6a8ff', a);
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
          const aa = t * 3 + i * 2.1 + z.x;
          ctx.beginPath(); ctx.moveTo(z.x, z.y); ctx.lineTo(z.x + Math.cos(aa) * z.r * 0.8, z.y + Math.sin(aa) * z.r * 0.8); ctx.stroke();
        }
        lights.push([z.x, z.y, z.r * 1.4, 0.5]);
      }
      ctx.globalCompositeOperation = 'source-over';
      // cảnh báo sét
      for (const s of sc.strikes) {
        if (s.struck) continue;
        const locked = !s.track || s.t >= s.trackEnd;
        const prog = U.clamp(s.t / s.lockEnd, 0, 1);
        ctx.fillStyle = locked ? 'rgba(255,40,40,0.28)' : 'rgba(220,40,40,0.15)';
        ctx.strokeStyle = locked ? 'rgba(255,70,50,0.95)' : 'rgba(255,80,80,0.6)';
        ctx.lineWidth = locked ? 3 : 2;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = 'rgba(255,90,60,0.35)';
        ctx.beginPath(); ctx.arc(s.x, s.y, s.radius * prog, 0, Math.PI * 2); ctx.fill();
        lights.push([s.x, s.y, s.radius * 1.2, locked ? 0.5 : 0.25]);
      }
      // pickups
      for (const k of sc.pickups) {
        const bob = Math.sin(t * 4 + k.x) * 3;
        let color = '#7affd0';
        if (k.item) color = k.item.kind === 'equip' ? TT.Items.rarityById[k.item.rarity].color : D.items[k.item.id].color;
        ctx.globalCompositeOperation = 'lighter';
        Art.glow(ctx, k.x, k.y + bob, k.item && k.item.kind === 'equip' ? 22 : 12, color, 0.7);
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = color;
        if (k.linhThach) { ctx.beginPath(); ctx.moveTo(k.x, k.y - 6 + bob); ctx.lineTo(k.x + 4, k.y + bob); ctx.lineTo(k.x, k.y + 6 + bob); ctx.lineTo(k.x - 4, k.y + bob); ctx.fill(); }
        else if (k.item.kind === 'equip') {
          ctx.fillRect(k.x - 1, k.y - 30 + bob, 2, 26);
          ctx.globalAlpha = 0.25; ctx.fillRect(k.x - 5, k.y - 40 + bob, 10, 36); ctx.globalAlpha = 1;
          ctx.beginPath(); ctx.arc(k.x, k.y + bob, 4, 0, Math.PI * 2); ctx.fill();
        } else { ctx.beginPath(); ctx.arc(k.x, k.y + bob, 4, 0, Math.PI * 2); ctx.fill(); }
        lights.push([k.x, k.y, 40, 0.35]);
      }
      // sắp xếp theo y
      const draw = [];
      const near = this.nearestInteractable();
      for (const pr of sc.props) {
        if (pr.env) {
          const d = TT.Env.DEFS[pr.kind];
          if (pr.x + d.w < cx || pr.x - d.w > cx + W || pr.y - d.ay > cy + H + 40 || pr.y + d.h - d.ay < cy - 40) continue;
          for (const l of TT.Env.lights(pr)) lights.push(l);
          if (d.decal) continue;
          // làm mờ công trình khi nhân vật đứng phía sau
          let alpha = 1;
          if (d.occl && p.y < pr.y - 4) {
            const o = d.occl;
            if (p.x > pr.x + o.x && p.x < pr.x + o.x + o.w && p.y - 30 > pr.y + o.y && p.y < pr.y + o.y + o.h + 60) alpha = 0.45;
          }
          draw.push({ y: pr.y, f: () => TT.Env.draw(ctx, pr, t, alpha) });
        } else {
          if (pr.x < cx - 150 || pr.x > cx + W + 150 || pr.y < cy - 150 || pr.y > cy + H + 250) continue;
          draw.push({ y: pr.y, f: () => Art.drawProp(ctx, pr, t) });
          if (pr.light) lights.push([pr.x, pr.y - pr.size * 0.6, pr.size * 3, 0.8]);
          if (pr.kind === 'crystal') lights.push([pr.x, pr.y - 10, pr.size * 3, 0.5]);
          if (pr.kind === 'pillar') lights.push([pr.x, pr.y - pr.size * 0.7, pr.size * 1.6, 0.35]);
        }
      }
      for (const n of sc.npcs) {
        if (n.x < cx - 80 || n.x > cx + W + 80 || n.y < cy - 120 || n.y > cy + H + 40) continue;
        const def = n.npc;
        draw.push({ y: n.y, f: () => Art.drawPlayer(ctx, n.x, n.y, n.aim, t + def.x, {
          moving: n.moving, mvx: n.mvx, mvy: n.mvy, skin: def.look,
          spirit: !!def.aura, color: def.aura ? def.aura.color : undefined, realm: def.aura ? def.aura.realm * 0.4 : 0
        }) });
        draw.push({ y: 1e9 - 1, f: () => {
          ctx.font = 'bold 12px "Segoe UI", sans-serif'; ctx.textAlign = 'center';
          const label = def.title + ' · ' + def.name, ty = n.y - 70;
          ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillText(label, n.x + 1, ty + 1);
          ctx.fillStyle = def.actions ? '#ffd23f' : '#cfe6f0'; ctx.fillText(label, n.x, ty);
        } });
        lights.push([n.x, n.y - 20, 70, 0.4]);
      }
      if (near) draw.push({ y: 1e9, f: () => this.label(near.x, near.y - Math.min(near.size, 150) - (near.npc ? 16 : 10), near.label) });
      for (const [gx, gy] of sc.glows) if (gx > cx - 100 && gx < cx + W + 100 && gy > cy - 100 && gy < cy + H + 100) lights.push([gx, gy, 90, 0.45]);
      for (const e of sc.enemies) {
        draw.push({ y: e.y, f: () => {
          if (e.telegraph > 0) { ctx.strokeStyle = 'rgba(255,40,40,0.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(p.x, p.y); ctx.stroke(); }
          Art.drawEnemy(ctx, e, t, PPM);
        } });
        lights.push([e.x, e.y, e.def.radiusM * PPM * 2.2, e.def.boss ? 0.5 : 0.18]);
      }
      const wcol = st.equipment.Weapon ? D.elements.colors[st.equipment.Weapon.element] : '#9fe8ff';
      if (!p.dead || sc.type !== 'loidai') {
        draw.push({ y: p.y, f: () => {
          p.lastFrame = Art.drawPlayer(ctx, p.x, p.y, p.aim, t, {
            moving: p.moving, dash: p.dashT > 0, dashAngle: Math.atan2(p.dashDir[1], p.dashDir[0]),
            cast: p.castT / CAST_DURATION, hurt: p.hurtT > 0, color: wcol, realm: st.realm, skin: st.skin, sword: st.swordSkin,
            mvx: p.mvx, mvy: p.mvy, ghosts: p.ghosts
          });
        } });
      }
      draw.sort((a, b) => a.y - b.y);
      for (const d of draw) d.f();
      lights.push([p.x, p.y, 7 * PPM, 0.9]);
      // phi kiếm
      ctx.globalCompositeOperation = 'lighter';
      for (const s of this.swords) {
        for (let i = 1; i < s.trail.length; i++) {
          ctx.strokeStyle = Art.rgba(wcol, (i / s.trail.length) * 0.5);
          ctx.lineWidth = 4 * (i / s.trail.length);
          ctx.beginPath(); ctx.moveTo(s.trail[i - 1][0], s.trail[i - 1][1]); ctx.lineTo(s.trail[i][0], s.trail[i][1]); ctx.stroke();
        }
        Art.glow(ctx, s.x, s.y, 18, wcol, 0.5);
        lights.push([s.x, s.y, 60, 0.45]);
      }
      for (const q of sc.qi) { Art.glow(ctx, q.x, q.y, 14, wcol, 0.9); }
      ctx.globalCompositeOperation = 'source-over';
      const swSkin = D.swordSkins.find(k => k.id === st.swordSkin);
      for (const s of this.swords) Art.drawSword(ctx, s.x, s.y, s.ang, 30, wcol, 1, swSkin);
      // đạn địch
      ctx.globalCompositeOperation = 'lighter';
      for (const b of sc.eproj) { Art.glow(ctx, b.x, b.y, 14, b.color, 0.9); lights.push([b.x, b.y, 50, 0.5]); }
      ctx.fillStyle = '#fff2c0';
      for (const b of sc.eproj) { ctx.beginPath(); ctx.arc(b.x, b.y, 3.5, 0, Math.PI * 2); ctx.fill(); }
      // tia sét
      for (const s of sc.strikes) {
        if (!s.struck) continue;
        Art.drawLightning(ctx, s.x + U.rand(-30, 30), cy - 40, s.x, s.y, s.big ? 10 : 5, '#c9a4ff', s.seed + Math.floor(t * 30));
        Art.glow(ctx, s.x, s.y, s.radius * 1.5, '#d8c0ff', 0.8);
        lights.push([s.x, s.y, s.radius * 4, 1]);
      }
      for (const b of sc.bolts) {
        Art.drawLightning(ctx, b.x, b.y - 360, b.x, b.y, 4, b.color, b.seed);
        Art.glow(ctx, b.x, b.y, 50, b.color, 0.8);
        lights.push([b.x, b.y, 200, 1]);
      }
      // hạt
      for (const q of sc.particles) {
        if (!q.add) continue;
        const a = q.life / q.max;
        if (q.ring) { ctx.strokeStyle = Art.rgba(q.color, a); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(q.x, q.y, q.size * (1.2 - a * 0.5), 0, Math.PI * 2); ctx.stroke(); continue; }
        ctx.fillStyle = Art.rgba(q.color, a);
        ctx.beginPath(); ctx.arc(q.x, q.y, q.size, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
      // khói và cánh hoa (không cộng sáng)
      for (const q of sc.particles) {
        if (q.add) continue;
        const a = q.life / q.max;
        if (q.petal) {
          ctx.fillStyle = Art.rgba(q.color, Math.min(1, a * 2));
          ctx.beginPath(); ctx.ellipse(q.x, q.y, q.size * 1.6, q.size * Math.abs(Math.cos(q.spin)) + 0.4, q.spin, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.fillStyle = Art.rgba(q.color, 0.28 * a * (1 - a) * 4);
          ctx.beginPath(); ctx.arc(q.x, q.y, q.size, 0, Math.PI * 2); ctx.fill();
        }
      }
      // khiên
      if (p.shield) {
        ctx.strokeStyle = Art.rgba(wcol, 0.5 + Math.sin(t * 20) * 0.2); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(p.x, p.y - 10, 1.3 * PPM, 0, Math.PI * 2); ctx.stroke();
      }
      // ánh sáng
      this.renderLighting(lights, cx, cy);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(this.light, 0, 0);
      // sương mù
      ctx.globalCompositeOperation = 'lighter';
      for (const f of this.fog) {
        f.x += f.s * 0.016; if (f.x > 1.4) f.x = -0.4;
        const fx = ((f.x * W - cx * 0.2) % (W * 1.8) + W * 1.8) % (W * 1.8) - W * 0.4, fy = f.y * H;
        Art.glow(ctx, fx, fy, f.r * W, sc.fog, 0.12);
      }
      ctx.globalCompositeOperation = 'source-over';
      // chữ sát thương
      ctx.setTransform(1, 0, 0, 1, -cx, -cy);
      ctx.textAlign = 'center';
      for (const tx of sc.texts) {
        ctx.font = `bold ${tx.size}px "Segoe UI", sans-serif`;
        ctx.globalAlpha = Math.min(1, tx.life * 2);
        ctx.fillStyle = '#000'; ctx.fillText(tx.text, tx.x + 1, tx.y + 1);
        ctx.fillStyle = tx.color; ctx.fillText(tx.text, tx.x, tx.y);
      }
      ctx.globalAlpha = 1;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      // mưa ở lôi đài
      if (sc.type === 'loidai') {
        ctx.strokeStyle = 'rgba(160,170,220,0.25)'; ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < 140; i++) {
          const x = (i * 97.3 + t * 300) % W, y = (i * 53.7 + t * 900) % H;
          ctx.moveTo(x, y); ctx.lineTo(x - 6, y + 18);
        }
        ctx.stroke();
      }
      // vignette + flash
      const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
      vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.5)');
      ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
      if (this.flash > 0) { ctx.fillStyle = `rgba(220,210,255,${this.flash * 0.45})`; ctx.fillRect(0, 0, W, H); }
      // con trỏ
      ctx.strokeStyle = 'rgba(160,230,255,0.8)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(this.mouse.x, this.mouse.y, 8, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(this.mouse.x - 13, this.mouse.y); ctx.lineTo(this.mouse.x - 4, this.mouse.y);
      ctx.moveTo(this.mouse.x + 4, this.mouse.y); ctx.lineTo(this.mouse.x + 13, this.mouse.y); ctx.stroke();
    }

    renderLighting(lights, cx, cy) {
      const l = this.lctx, W = this.W, H = this.H;
      const dark = this.scene.dark;
      l.globalCompositeOperation = 'source-over';
      l.clearRect(0, 0, W, H);
      l.fillStyle = `rgba(8,12,28,${dark})`;
      l.fillRect(0, 0, W, H);
      l.globalCompositeOperation = 'destination-out';
      for (const [x, y, r, a] of lights) {
        const px = x - cx, py = y - cy;
        if (px < -r || py < -r || px > W + r || py > H + r) continue;
        const g = l.createRadialGradient(px, py, 0, px, py, r);
        g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(1, 'rgba(0,0,0,0)');
        l.fillStyle = g; l.beginPath(); l.arc(px, py, r, 0, Math.PI * 2); l.fill();
      }
      l.globalCompositeOperation = 'source-over';
    }

    label(x, y, text) {
      const ctx = this.ctx;
      ctx.font = '13px "Segoe UI", sans-serif'; ctx.textAlign = 'center';
      const w = ctx.measureText(text).width + 16;
      ctx.fillStyle = 'rgba(5,10,18,0.8)'; ctx.fillRect(x - w / 2, y - 16, w, 22);
      ctx.strokeStyle = 'rgba(120,220,255,0.6)'; ctx.strokeRect(x - w / 2, y - 16, w, 22);
      ctx.fillStyle = '#d8f6ff'; ctx.fillText(text, x, y);
    }
  }

  TT.Game = Game;
})(window.TT);
