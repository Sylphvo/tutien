// Smoke test chạy trong trình duyệt headless: mô phỏng chơi và ghi lỗi vào DOM.
(function () {
  const log = [];
  const out = msg => { log.push(msg); document.body.setAttribute('data-smoke', log.join(' | ')); };
  window.addEventListener('error', e => out('ERROR: ' + e.message + ' @' + (e.filename || '').split('/').pop() + ':' + e.lineno));
  setTimeout(async () => {
    try {
      const wait = ms => new Promise(r => setTimeout(r, ms));
      const g = window.__game, UI = TT.UI;
      document.getElementById('help-close').click();
      // Tông Môn: vẽ vài khung, đi qua các công trình
      for (let i = 0; i < 30; i++) { g.update(1 / 60); g.render(); }
      for (const pr of g.scene.props.filter(x => x.interact)) { g.player.x = pr.x; g.player.y = pr.y + 20; g.update(1 / 60); g.render(); }
      out('tongmon ok props=' + g.scene.props.length);
      UI.openMenu('bicanh'); UI.openMenu('skins'); UI.closeMenu(); out('tabs ok');
      // NPC: hội thoại với từng người, đi tuần vài giây
      for (const n of g.scene.npcs) { UI.openDialog(n); UI.nextLine(); UI.closeDialog(); }
      for (let i = 0; i < 180; i++) { g.update(1 / 60); if (i % 20 === 0) g.render(); }
      const moved = g.scene.npcs.filter(n => n.path).map(n => Math.round(Math.hypot(n.x - (g.scene.sizePx / 2 + n.npc.x * 32), n.y - (g.scene.sizePx / 2 + n.npc.y * 32)))).join('/');
      const lt0 = g.state.linhThach;
      UI.openMenu('shop'); document.querySelector('.buy').click(); UI.closeMenu();
      out('npc ok n=' + g.scene.npcs.length + ' moved=' + moved + ' shopSpent=' + (lt0 - g.state.linhThach));
      for (const id of Object.keys(TT.DATA.biomes)) {
        g.enterBiCanh(id);
        for (let i = 0; i < 20; i++) { g.update(1 / 60); g.render(); }
        if (id === 'THANH_LUY') {
          const kinds = g.scene.props.map(p => p.kind);
          const count = kind => kinds.filter(x => x === kind).length;
          if (count('fortress_wall') !== 9 || count('fortress_wall_v') !== 10 ||
              count('fortress_tower') !== 4 || count('fortress_gate') !== 1 || count('fortress_keep') !== 1)
            throw new Error('Bố cục Cổ Thành thiếu tường, cổng hoặc tháp canh.');
          const gate = g.scene.props.find(p => p.kind === 'fortress_gate');
          const gatePass = { x: g.scene.sizePx / 2, y: g.scene.sizePx / 2 - 16 * TT.DATA.world.pixelsPerMeter };
          g.collideWorld(gatePass, TT.DATA.player.radiusM * TT.DATA.world.pixelsPerMeter);
          if (Math.hypot(gatePass.x - gate.x, gatePass.y - gate.y) > 1)
            throw new Error('Lối đi qua cổng thành đang bị chặn.');
          const outside = g.scene.props.some(p => p.interact === 'gather' &&
            (Math.abs(p.x - g.scene.sizePx / 2) > 11 * TT.DATA.world.pixelsPerMeter ||
             Math.abs(p.y - g.scene.sizePx / 2) > 11 * TT.DATA.world.pixelsPerMeter));
          if (outside) throw new Error('Vật phẩm Cổ Thành xuất hiện ngoài sân trong.');
        }
        for (const pr of g.scene.props.filter(x => x.interact === 'gather').slice(0, 8)) { g.player.x = pr.x; g.player.y = pr.y + 10; g.gather(pr); }
        // quái của vùng + boss vùng
        const B = TT.DATA.biomes[id];
        for (const type of Object.keys(B.spawnWeights)) g.spawnEnemy(type, g.player.x + 200, g.player.y + 60);
        g.spawnEnemy(B.boss, g.player.x - 220, g.player.y);
        g.state.hp = 1e9;
        for (let i = 0; i < 240; i++) { g.update(1 / 60); if (i % 10 === 0) g.render(); }
        g.state.hp = g.state.stats.maxHp;
        out(id + ' ok props=' + g.scene.props.length + ' pickups=' + g.scene.pickups.length);
      }
      if (location.hash === '#tongmon') { g.enterDongPhu(); g.paused = true; return; }
      if (location.hash.startsWith('#biome_')) { g.enterBiCanh(location.hash.slice(7)); g.paused = true; return; }
      if (location.hash === '#skins') { UI.openMenu('skins'); return; }
      if (location.hash === '#bsel') { g.enterDongPhu(); UI.openMenu('bicanh'); return; }
      g.enterBiCanh('LINH_MOC');
      g.mouse.left = true;
      for (let i = 0; i < 30; i++) g.spawnEnemy('HAC_LANG', g.player.x + 60 + i, g.player.y);
      g.spawnEnemy('QUY_HOA', g.player.x - 100, g.player.y);
      g.spawnEnemy('YEU_VUONG', g.player.x, g.player.y - 200);
      g.state.inventory.add(TT.Items.createEquipment({ level: 3, rarity: 'ThanKhi' }));
      for (let i = 0; i < 300; i++) { g.update(1 / 60); g.render(); UI.hud(g); }
      out('bicanh ok kills=' + g.scene.kills + ' hp=' + Math.round(g.state.hp));
      g.state.mp = g.state.stats.maxMp; g.player.dashCd = 0; g.tryDash();
      for (let i = 0; i < 20; i++) { g.update(1 / 60); g.render(); }
      out('dash ok ghosts=' + g.player.ghosts.length);
      const shot = location.hash.slice(1);
      if (shot === 'bicanh') { g.mouse.x = g.W / 2 + 200; g.mouse.y = g.H / 2; g.mouse.left = true; for (let i = 0; i < 20; i++) g.update(1 / 60); g.paused = true; return; }
      if (shot === 'inv') { g.state.inventory.items.forEach(x => { if (x.kind === 'equip') x.identified = true; }); UI.openMenu('inventory'); return; }
      if (shot === 'reroll') { g.state.inventory.items.forEach(x => { if (x.kind === 'equip') x.identified = true; }); UI.rerollSel = g.state.inventory.items.find(x => x.kind === 'equip'); UI.openMenu('reroll'); return; }
      g.mouse.left = false;
      UI.openMenu('inventory'); out('inv ok');
      UI.openMenu('reroll'); UI.doReroll(); out('reroll ok');
      UI.openMenu('alchemy'); UI.openMenu('dongphu'); UI.closeMenu(); out('menus ok');
      g.state.hp = g.state.stats.maxHp;
      g.state.addTuvi(99999);
      g.enterDongPhu();
      UI.openTribulationPrep(); out('prep ok: ' + document.querySelector('.surv').textContent);
      UI.closePrep();
      g.enterTribulation({ Talisman: null, Treasure: null, Pill: null });
      if (shot === 'prep') { UI.openTribulationPrep(); return; }
      if (shot === 'trib') { g.state.hp = 1e9; for (let i = 0; i < 60 * 4.3; i++) { g.update(1 / 60); g.player.x += 1.5; } g.paused = true; return; }
      for (let i = 0; i < 60 * 25; i++) { g.update(1 / 60); if (i % 10 === 0) g.render(); UI.hud(g); if (g.trib.done) break; }
      out('trib wave=' + g.trib.wave + ' done=' + g.trib.done + ' hp=' + Math.round(g.state.hp) + ' strikes=' + g.scene.strikes.length);
      out('DONE');
    } catch (e) { out('EXC: ' + e.message + ' ' + (e.stack || '').split('\n')[1]); }
  }, 300);
})();
