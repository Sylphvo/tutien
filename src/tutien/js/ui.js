window.TT = window.TT || {};

/**
 * TT.UI — giao diện DOM: HUD, Kho Đồ + Cộng Hưởng Ngũ Hành, Tẩy Luyện,
 * Luyện Đan, Động Phủ, Chuẩn bị Độ Kiếp (wireframe GDD mục 5).
 */
(function (TT) {
  'use strict';
  const D = TT.DATA, U = TT.util, I = TT.Items, Art = TT.Art;
  const $ = s => document.querySelector(s);
  const esc = U.esc;

  const UI = {
    game: null,
    menuOpen: false,
    sectsOpen: false,
    sectTab: 'sect',
    tab: 'inventory',
    filter: 'all',
    hovered: null,
    rerollSel: null,
    prep: null,
    confirmCb: null,

    init(game) {
      this.game = game;
      $('#menu-close').onclick = () => this.closeMenu();
      document.querySelectorAll('#menu .tab').forEach(b => { b.onclick = () => { this.tab = b.dataset.tab; this.renderMenu(); }; });
      $('#confirm-yes').onclick = () => { const cb = this.confirmCb; this.hideConfirm(); if (cb) cb(); };
      $('#confirm-no').onclick = () => this.hideConfirm();
      $('#prep-close').onclick = () => this.closePrep();
      $('#prep-start').onclick = () => this.startTribulation();
      $('#help-close').onclick = () => { $('#help').classList.add('hidden'); this.syncPause(); };
      $('#sk-sects').onclick = () => this.openSects();
      $('#sects-close').onclick = () => this.closeSects();
      document.querySelectorAll('#sects-modal [data-sect-tab]').forEach(button => {
        button.onclick = () => { this.sectTab = button.dataset.sectTab; this.renderSects(); };
      });
      this.buildHudSlots();
      this.initSkillIcons();
      this.syncPause();
    },

    initSkillIcons() {
      const drawIcon = (cvId, col, row, isClanBadge) => {
        const el = document.getElementById(cvId);
        if (!el || !TT.Art) return;
        const g = el.getContext('2d');
        const fetcher = isClanBadge ? TT.Art.getClanBadge : TT.Art.getSkillIcon;
        fetcher(col, row, {
          callback: sp => {
            if (sp && sp.canvas) {
              g.clearRect(0, 0, el.width, el.height);
              g.drawImage(sp.canvas, 0, 0, el.width, el.height);
            }
          }
        });
        const immediate = fetcher(col, row);
        if (immediate && immediate.canvas) {
          g.clearRect(0, 0, el.width, el.height);
          g.drawImage(immediate.canvas, 0, 0, el.width, el.height);
        }
      };

      drawIcon('icon-sword', 1, 0, false);
      drawIcon('icon-dash', 3, 5, false);
      drawIcon('icon-shield', 5, 2, false);
      drawIcon('icon-sects', 2, 1, true);
    },

    syncPause() {
      const open = this.menuOpen || this.sectsOpen || !!this.prep || !!this.dlg || !$('#help').classList.contains('hidden') || !$('#confirm').classList.contains('hidden');
      this.game.setPaused(open);
    },

    handleKey(k, e) {
      if (!$('#confirm').classList.contains('hidden')) {
        if (k === 'enter') $('#confirm-yes').click();
        if (k === 'escape') this.hideConfirm();
        return true;
      }
      if (!$('#help').classList.contains('hidden')) {
        if (k === 'escape' || k === 'enter' || k === 'h') $('#help-close').click();
        return true;
      }
      if (this.prep) { if (k === 'escape') this.closePrep(); return true; }
      if (this.dlg) {
        if (k === 'escape') this.closeDialog();
        else if (k === 'e' || k === 'enter' || k === ' ') { e.preventDefault(); this.nextLine(); }
        return true;
      }
      if (k === 'g') {
        if (this.sectsOpen) this.closeSects(); else this.openSects();
        return true;
      }
      if (this.sectsOpen) { if (k === 'escape') this.closeSects(); return true; }
      if (k === 'tab' || k === 'i') {
        if (this.menuOpen) this.closeMenu(); else this.openMenu('inventory');
        return true;
      }
      if (k === 'h' && !this.menuOpen) { $('#help').classList.remove('hidden'); this.syncPause(); return true; }
      if (!this.menuOpen) return false;
      if (k === 'escape') { this.closeMenu(); return true; }
      if (['1', '2', '3', '4'].includes(k) && this.hovered && this.hovered.kind === 'stack') {
        const def = D.items[this.hovered.id];
        if (def.category === 'Consumable' && def.effect) {
          const qs = this.game.state.quickSlots;
          for (let i = 0; i < 4; i++) if (qs[i] === this.hovered.id) qs[i] = null;
          qs[+k - 1] = this.hovered.id;
          this.toast(`Gắn ${def.name} vào ô [${k}]`);
          this.renderMenu();
        }
        return true;
      }
      if (k === 'x' && this.hovered && this.tab === 'inventory') { this.sell(this.hovered); return true; }
      if (k === 'r' && this.tab === 'reroll') { this.doReroll(); return true; }
      return true;
    },

    // ---------------------------------------------------------------- HUD
    buildHudSlots() {
      const wrap = $('#quick');
      wrap.innerHTML = '';
      for (let i = 0; i < 4; i++) {
        const d = document.createElement('div');
        d.className = 'qslot'; d.id = 'q' + i;
        d.innerHTML = `<span class="key">${i + 1}</span><img alt=""><span class="cnt"></span>`;
        d.onclick = () => this.game.useQuick(i);
        wrap.appendChild(d);
      }
    },

    setScene(type, name) {
      $('#hud-trib').classList.toggle('hidden', type !== 'loidai');
      $('#hud-bicanh').classList.toggle('hidden', type !== 'bicanh');
      $('#scene-name').textContent = {
        dongphu: D.sect.name.toUpperCase(), bicanh: 'BÍ CẢNH · ' + (name || '').toUpperCase(), loidai: 'LÔI ĐÀI ĐỘ KIẾP'
      }[type];
      this.refresh();
    },

    openHelp() { $('#help').classList.remove('hidden'); this.syncPause(); },

    bar(sel, v, max, text) {
      const el = $(sel);
      el.querySelector('.fill').style.width = (max > 0 ? U.clamp(v / max, 0, 1) * 100 : 0) + '%';
      el.querySelector('.txt').textContent = text;
    },

    hud(game) {
      const st = game.state, s = st.stats;
      this.bar('#hp', st.hp, s.maxHp, `HP ${U.fmt(Math.max(0, st.hp))} / ${U.fmt(s.maxHp)}`);
      this.bar('#mp', st.mp, s.maxMp, `MP ${U.fmt(st.mp)} / ${U.fmt(s.maxMp)}`);
      this.bar('#dd', st.danDoc, 100, `Đan Độc ${Math.round(st.danDoc)}%`);
      this.bar('#tv', st.tuvi, st.tuviNeeded, st.realmDef.final ? 'Tu vi viên mãn' :
        `${st.realmLabel()} · Tu vi ${U.fmt(st.tuvi)}/${U.fmt(st.tuviNeeded)}${st.atBottleneck() ? ' · BÌNH CẢNH' : ''}`);
      $('#linhthach').textContent = U.fmt(st.linhThach);
      const p = game.player;
      $('#sk-dash').textContent = p.dashCd > 0 ? `Space: Lôi Độn (${p.dashCd.toFixed(1)}s)` : 'Space: Lôi Độn (Sẵn sàng)';
      $('#sk-dash').classList.toggle('cd', p.dashCd > 0);
      $('#sk-shield').classList.toggle('on', !!p.shield);
      const ready = game.swords.filter(w => w.state === 'orbit').length;
      $('#sk-sword').textContent = `LMB: Ngự Kiếm (${ready}/${game.swords.length})`;
      for (let i = 0; i < 4; i++) {
        const id = st.quickSlots[i], el = $('#q' + i), img = el.querySelector('img');
        if (id) {
          const def = D.items[id];
          const src = Art.icon(def.icon, def.color);
          if (img.getAttribute('src') !== src) img.setAttribute('src', src);
          img.style.visibility = 'visible';
          const n = st.inventory.count(id);
          el.querySelector('.cnt').textContent = n;
          el.classList.toggle('empty', n === 0);
          el.title = def.name;
        } else { img.style.visibility = 'hidden'; el.querySelector('.cnt').textContent = ''; el.title = ''; }
      }
      const sc = game.scene;
      if (sc.type === 'bicanh') {
        $('#kills').textContent = sc.bossSpawned ? (sc.boss ? 'Trảm Huyết Lang Vương!' : 'Yêu Vương đã bị trảm — tìm cổng vàng để rời đi') :
          `Trảm yêu: ${sc.kills}/${D.bicanh.killsForBoss}`;
        const boss = sc.boss;
        $('#bossbar').classList.toggle('hidden', !boss);
        if (boss) this.bar('#bossbar', boss.hp, boss.maxHp, `${boss.def.name}  ${U.fmt(Math.max(0, boss.hp))}`);
      } else $('#bossbar').classList.add('hidden');
      if (sc.type === 'loidai' && game.trib) {
        const tb = game.trib;
        $('#trib-wave').textContent = `[CẢNH BÁO THIÊN KIẾP] ${tb.cfg.name} · Đạo thứ: ${tb.wave} / ${tb.cfg.waves}`;
        $('#trib-timer').textContent = tb.phase === 'gap' && !tb.done ? `Đạo kế tiếp: ${Math.max(0, tb.timer).toFixed(1)}s` : (tb.done ? '' : 'Lôi kiếp đang giáng!');
        const prog = (tb.wave - (tb.phase === 'wave' ? 0.5 : 0)) / tb.cfg.waves;
        $('#trib-prog .fill').style.width = U.clamp(prog, 0, 1) * 100 + '%';
        $('#trib-shield').textContent = tb.block > 0 ? `Khiên Hộ Thể: ${tb.block} lượt đỡ (Tị Lôi Phù)` : '';
        $('#trib-red').textContent = tb.reduction > 0 ? `Trận pháp giảm ${Math.round(tb.reduction * 100)}% ST` : '';
      }
    },

    toast(msg) {
      const box = $('#toasts');
      const d = document.createElement('div');
      d.className = 'toast'; d.textContent = msg;
      box.appendChild(d);
      while (box.children.length > 5) box.removeChild(box.firstChild);
      setTimeout(() => d.classList.add('fade'), 2200);
      setTimeout(() => d.remove(), 2900);
    },

    banner(msg) {
      const b = $('#banner');
      b.textContent = msg;
      b.classList.remove('show'); void b.offsetWidth; b.classList.add('show');
    },

    hurt() {
      const h = $('#hurt');
      h.classList.remove('on'); void h.offsetWidth; h.classList.add('on');
    },

    refresh() { if (this.menuOpen) this.renderMenu(); },

    openSects() {
      if (this.menuOpen) {
        this.menuOpen = false;
        $('#menu').classList.add('hidden');
      }
      this.sectsOpen = true;
      this.sectTab = 'sect';
      $('#sects-modal').classList.remove('hidden');
      this.renderSects();
      this.syncPause();
    },

    closeSects() {
      this.sectsOpen = false;
      $('#sects-modal').classList.add('hidden');
      this.syncPause();
    },

    sectBuffLines(sect) {
      const b = sect.buffs;
      const lines = [];
      if (b.swordDamagePct) lines.push(`+${b.swordDamagePct}% sát thương Ngự Kiếm`);
      if (b.shieldMpCostReduction) lines.push(`-${Math.round(b.shieldMpCostReduction * 100)}% MP duy trì Kiếm Thuẫn`);
      if (b.lifesteal) lines.push(`Hút máu ${Math.round(b.lifesteal * 100)}% sát thương`);
      if (b.lowHpDamagePct) lines.push(`Sinh lực càng thấp, sát thương tăng tối đa ${b.lowHpDamagePct}%`);
      if (b.moveSpeedPct) lines.push(`+${b.moveSpeedPct}% tốc độ di chuyển`);
      if (b.chainEvery) lines.push(`Mỗi ${b.chainEvery} đòn đánh giật sét lan`);
      if (b.dashCooldownReduction) lines.push(`-${Math.round(b.dashCooldownReduction * 100)}% hồi chiêu Lôi Độn`);
      if (b.danDocGainMultiplier) lines.push(`-${Math.round((1 - b.danDocGainMultiplier) * 100)}% Đan Độc tích tụ`);
      if (b.potionEffectPct) lines.push(`+${b.potionEffectPct}% hiệu quả hồi phục từ đan`);
      if (b.hpRegenPctPerSec) lines.push(`Hồi ${b.hpRegenPctPerSec * 100}% HP tối đa mỗi giây`);
      if (b.attackSlowPct) lines.push(`Đòn đánh làm chậm ${b.attackSlowPct}%`);
      if (b.freezeChance) lines.push(`${Math.round(b.freezeChance * 100)}% đóng băng trong ${b.freezeDurationSec}s`);
      if (b.shieldDamageReductionPct) lines.push(`+${Math.round(b.shieldDamageReductionPct * 100)}% giảm sát thương khi giữ Kiếm Thuẫn`);
      return lines;
    },

    clanBuffLines(clan) {
      const b = clan.buffs;
      const lines = [];
      if (b.additionalSwords) lines.push(`+${b.additionalSwords} phi kiếm bay quanh người`);
      if (b.critRate) lines.push(`+${b.critRate}% chí mạng`);
      if (b.attackPct) lines.push(`+${b.attackPct}% sát thương cơ bản`);
      if (b.burnDamagePctPerSec) lines.push(`Thiêu đốt ${b.burnDamagePctPerSec}% Công mỗi giây trong ${b.burnDurationSec}s`);
      if (b.linhThachDropPct) lines.push(`+${b.linhThachDropPct}% Linh Thạch từ quái`);
      if (b.shopDiscount) lines.push(`-${Math.round(b.shopDiscount * 100)}% giá tại Vạn Bảo Các`);
      if (b.maxHpPct) lines.push(`+${b.maxHpPct}% HP tối đa`);
      if (b.damageReduction) lines.push(`-${Math.round(b.damageReduction * 100)}% sát thương nhận vào`);
      if (b.lightningResistance) lines.push(`-${Math.round(b.lightningResistance * 100)}% sát thương Lôi Kiếp`);
      return lines;
    },

    paintBadges(container) {
      if (!container || !TT.Art || !TT.Art.getClanBadge) return;
      container.querySelectorAll('.sect-badge-cv, .clan-badge-cv').forEach(cv => {
        const col = parseInt(cv.dataset.col, 10) || 0;
        const row = parseInt(cv.dataset.row, 10) || 0;
        const g = cv.getContext('2d');
        const paint = sp => {
          if (sp && sp.canvas) {
            g.clearRect(0, 0, cv.width, cv.height);
            g.drawImage(sp.canvas, 2, 2, cv.width - 4, cv.height - 4);
          }
        };
        const res = TT.Art.getClanBadge(col, row, { callback: paint });
        if (res && res.canvas) paint(res);
      });
    },

    renderSects() {
      const st = this.game.state, body = $('#sects-body');
      document.querySelectorAll('#sects-modal [data-sect-tab]').forEach(button =>
        button.classList.toggle('active', button.dataset.sectTab === this.sectTab));
      if (this.sectTab === 'clan') {
        const clan = st.currentClan;
        const cost = clan ? D.sectSystem.clanChangeCost : 0;
        const clanBadgeCol = clan && clan.badge ? clan.badge.col : 0;
        const clanBadgeRow = clan && clan.badge ? clan.badge.row : 0;
        body.innerHTML = `<div class="sects-content">
          <div class="clan-current" style="--clan-color:${clan ? clan.color : '#67e8f9'}">
            <div class="clan-title-box">
              <canvas class="clan-badge-cv" width="44" height="44" data-col="${clanBadgeCol}" data-row="${clanBadgeRow}"></canvas>
              <div>
                <h2>${clan ? esc(clan.name) : 'Chưa chọn huyết mạch'}</h2>
                <div class="sect-meta">${clan ? esc(clan.epithet) : 'Lần chọn đầu tiên được miễn phí'}</div>
              </div>
            </div>
            <p>${clan ? esc(clan.description) : 'Chọn một thế gia để thức tỉnh huyết mạch và nhận chỉ số gia tộc.'}</p>
            ${clan ? `<ul>${this.clanBuffLines(clan).map(line => `<li>${esc(line)}</li>`).join('')}</ul>` : ''}
            <div class="sect-meta">Linh Thạch hiện có: ◆ ${U.fmt(st.linhThach)} · ${clan ? `Tẩy Tủy đổi huyết mạch: ◆ ${U.fmt(cost)}` : 'Chọn miễn phí'}</div>
          </div>
          <div class="clan-grid">${D.clans.map(item => {
            const active = item.id === st.currentClanId;
            const bCol = item.badge ? item.badge.col : 0;
            const bRow = item.badge ? item.badge.row : 0;
            return `<article class="clan-card ${active ? 'current' : ''}" style="--card-color:${item.color}">
              <div class="clan-title-box">
                <canvas class="clan-badge-cv" width="34" height="34" data-col="${bCol}" data-row="${bRow}"></canvas>
                <div>
                  <h3>${esc(item.name)}</h3>
                  <div class="sect-meta">${esc(item.epithet)}</div>
                </div>
              </div>
              <p class="dim">${esc(item.description)}</p>
              <ul>${this.clanBuffLines(item).map(line => `<li>${esc(line)}</li>`).join('')}</ul>
              <button class="bigbtn clan-choose" data-id="${item.id}" ${active || st.linhThach < cost ? 'disabled' : ''}>
                ${active ? 'Đang Mang Huyết Mạch' : `${clan ? 'Tẩy Tủy Đổi' : 'Chọn Huyết Mạch'}${cost ? ` · ◆ ${U.fmt(cost)}` : ' · Miễn phí'}`}
              </button>
            </article>`;
          }).join('')}</div>
        </div>`;
        this.paintBadges(body);
        body.querySelectorAll('.clan-choose').forEach(button => {
          button.onclick = () => {
            const error = st.chooseClan(button.dataset.id);
            if (error) this.toast(error);
            else { TT.Save.save(st); this.toast(`Huyết mạch đã thức tỉnh: ${st.currentClan.name}`); }
            this.renderSects();
          };
        });
        return;
      }

      const sect = st.currentSect, rank = st.sectRank, nextRank = D.sectRanks[st.sectRankIndex + 1];
      const progress = nextRank ? U.clamp(st.sectContribution / nextRank.contribution, 0, 1) * 100 : 100;
      const questTarget = D.sectSystem.questKills, questReady = st.sectQuestKills >= questTarget;
      const stipendReady = rank.stipend > 0 && Date.now() - st.lastSectStipendAt >= D.sectSystem.stipendIntervalMs;
      const stipendLeft = Math.max(0, D.sectSystem.stipendIntervalMs - (Date.now() - st.lastSectStipendAt));
      const stipendButton = rank.stipend <= 0 ? 'Đạt cấp bậc để mở bổng lộc'
        : stipendReady ? `Nhận ◆ ${U.fmt(rank.stipend)} Linh Thạch`
          : `Bổng lộc sau ${Math.ceil(stipendLeft / 3600000)} giờ`;
      const ultimate = sect.ultimate, ultimateCfg = D.sectSystem.ultimate, p = this.game.player;
      const ultimateReady = p.sectUltimateCd <= 0 && st.mp >= st.stats.maxMp * ultimateCfg.mpCostPct / 100 && this.game.scene.type === 'bicanh' && !p.dead;
      const sBadgeCol = sect.badge ? sect.badge.col : 2;
      const sBadgeRow = sect.badge ? sect.badge.row : 1;
      body.innerHTML = `<div class="sects-content">
        <div class="sect-current" style="--sect-color:${sect.color}">
          <div>
            <div class="sect-title-box">
              <canvas class="sect-badge-cv" width="44" height="44" data-col="${sBadgeCol}" data-row="${sBadgeRow}"></canvas>
              <div>
                <h2>${esc(sect.name)}</h2>
                <div class="sect-meta">${esc(sect.alignment)} · ${esc(sect.discipline)} · ${esc(rank.name)}</div>
              </div>
            </div>
            <p>${esc(sect.description)}</p>
            <ul>${this.sectBuffLines(sect).map(line => `<li>${esc(line)}</li>`).join('')}</ul>
            <div class="sect-progress">
              <div class="dim">Cống hiến: <b>${U.fmt(st.sectContribution)}</b> ${nextRank ? `/ ${U.fmt(nextRank.contribution)} để thăng ${esc(nextRank.name)}` : '· Đã đạt chức vị cao nhất'}</div>
              <div class="pbar wide"><i style="width:${progress}%"></i><span>${nextRank ? `${U.fmt(st.sectContribution)} / ${U.fmt(nextRank.contribution)}` : 'Tối đa'}</span></div>
            </div>
            <div class="sect-rank-actions">
              <button id="sect-promote" class="bigbtn" ${st.canPromoteSectRank() ? '' : 'disabled'}>Thăng Chức</button>
              <button id="sect-stipend" class="bigbtn" ${stipendReady ? '' : 'disabled'}>${esc(stipendButton)}</button>
            </div>
          </div>
          <div class="sect-meta">◆ ${U.fmt(st.linhThach)} Linh Thạch</div>
        </div>
        <div class="sect-quest">
          <div><strong>Nhiệm vụ Tông Môn: Trảm Yêu Trừ Ma</strong><div class="dim">Tiêu diệt ${questTarget} yêu thú trong Bí Cảnh · Thưởng +${D.sectSystem.questContribution} Cống Hiến</div></div>
          <button id="sect-quest-claim" class="bigbtn" ${questReady ? '' : 'disabled'}>${questReady ? 'Nhận Cống Hiến' : `${st.sectQuestKills} / ${questTarget}`}</button>
          <div class="pbar"><i style="width:${U.clamp(st.sectQuestKills / questTarget, 0, 1) * 100}%"></i></div>
        </div>
        <div class="sect-ultimate">
          <strong>${esc(ultimate.name)}</strong><div class="dim">${esc(ultimate.description)}</div>
          <div class="dim">Tiêu hao ${ultimateCfg.mpCostPct}% MP tối đa · Hồi chiêu ${ultimateCfg.cooldownSec}s · Chỉ dùng trong Bí Cảnh</div>
          <button id="sect-ultimate-cast" class="bigbtn" ${ultimateReady ? '' : 'disabled'}>Thi triển Tuyệt Học${p.sectUltimateCd > 0 ? ` · ${p.sectUltimateCd.toFixed(1)}s` : ''}</button>
        </div>
        <h3 class="sect-list-title">Ngũ Đại Tông Môn</h3>
        <div class="sect-grid">${D.sects.map(item => {
          const active = item.id === st.currentSectId;
          const fee = D.sectSystem.sectChangeCost;
          const iCol = item.badge ? item.badge.col : 2;
          const iRow = item.badge ? item.badge.row : 1;
          return `<article class="sect-card ${active ? 'current' : ''}" style="--card-color:${item.color}">
            <div class="sect-title-box">
              <canvas class="sect-badge-cv" width="34" height="34" data-col="${iCol}" data-row="${iRow}"></canvas>
              <div>
                <h3>${esc(item.name)}</h3>
                <div class="sect-meta">${esc(item.alignment)} · ${esc(item.discipline)}</div>
              </div>
            </div>
            <p class="dim">${esc(item.description)}</p>
            <ul>${this.sectBuffLines(item).map(line => `<li>${esc(line)}</li>`).join('')}</ul>
            <div class="dim">Tuyệt học: <b>${esc(item.ultimate.name)}</b></div>
            <button class="bigbtn sect-join" data-id="${item.id}" ${active || st.linhThach < fee ? 'disabled' : ''}>
              ${active ? 'Đang Gia Nhập' : `Bái Nhập · ◆ ${U.fmt(fee)}`}
            </button>
          </article>`;
        }).join('')}</div>
      </div>`;
      this.paintBadges(body);
      $('#sect-promote').onclick = () => {
        if (st.promoteSectRank()) { TT.Save.save(st); this.toast(`Thăng chức: ${st.sectRank.name}`); }
        this.renderSects();
      };
      $('#sect-stipend').onclick = () => {
        const amount = st.claimSectStipend();
        if (amount) { TT.Save.save(st); this.toast(`Đã nhận bổng lộc ◆ ${U.fmt(amount)} Linh Thạch.`); }
        this.renderSects();
      };
      $('#sect-quest-claim').onclick = () => {
        if (st.claimSectQuestReward()) { TT.Save.save(st); this.toast(`Nhận ${D.sectSystem.questContribution} Cống Hiến Tông Môn.`); }
        this.renderSects();
      };
      $('#sect-ultimate-cast').onclick = () => {
        this.closeSects();
        if (this.game.castSectUltimate()) TT.Save.save(st);
      };
      body.querySelectorAll('.sect-join').forEach(button => {
        button.onclick = () => {
          const error = st.joinSect(button.dataset.id);
          if (error) this.toast(error);
          else { TT.Save.save(st); this.toast(`Đã bái nhập ${st.currentSect.name}.`); }
          this.renderSects();
        };
      });
    },

    // ---------------------------------------------------------------- confirm
    confirm(html, cb) {
      $('#confirm-msg').innerHTML = html;
      this.confirmCb = cb;
      $('#confirm').classList.remove('hidden');
      this.syncPause();
    },
    hideConfirm() { $('#confirm').classList.add('hidden'); this.confirmCb = null; this.syncPause(); },

    // ---------------------------------------------------------------- menu
    openMenu(tab) {
      this.tab = tab || 'inventory';
      this.menuOpen = true;
      $('#menu').classList.remove('hidden');
      this.syncPause();
      this.renderMenu();
    },
    closeMenu() {
      this.menuOpen = false; this.hovered = null;
      $('#menu').classList.add('hidden');
      this.syncPause();
    },

    renderMenu() {
      document.querySelectorAll('#menu .tab').forEach(b => b.classList.toggle('active', b.dataset.tab === this.tab));
      const body = $('#menu-body');
      this.hovered = null;
      if (this.tab === 'inventory') this.renderInventory(body);
      else if (this.tab === 'weapons') this.renderWeapons(body);
      else if (this.tab === 'reroll') this.renderReroll(body);
      else if (this.tab === 'alchemy') this.renderAlchemy(body);
      else if (this.tab === 'bicanh') this.renderBiCanhSelect(body);
      else if (this.tab === 'skins') this.renderSkins(body);
      else if (this.tab === 'shop') this.renderShop(body);
      else this.renderDongPhu(body);
    },

    itemIcon(item) {
      if (item.kind === 'equip') {
        return Art.icon(item.slot, D.elements.colors[item.element], item.identified ? '' : 'unid');
      }
      const def = D.items[item.id];
      return Art.icon(def.icon, def.color);
    },

    itemColor(item) {
      return item.kind === 'equip' ? I.rarityById[item.rarity].color : '#cfd8e3';
    },

    tooltipHTML(item) {
      if (!item) return '<div class="tt-empty">Rê chuột lên vật phẩm để xem chi tiết.<br>Chuột trái: Trang bị / Dùng · Giữ chuột phải: Giám định · 1-4: Gắn Quick-slot · X: Bán</div>';
      if (item.kind === 'stack') {
        const def = D.items[item.id];
        return `<div class="tt-name" style="color:${def.color}">${esc(def.name)} <span class="dim">x${item.count}</span></div>
          <div class="dim">${{ Consumable: 'Đan Dược & Phù Lục', Material: 'Linh Thảo & Khoáng Thạch' }[def.category]}</div>
          <div>${esc(def.desc)}</div><div class="dim">Giá bán: ${U.fmt(def.price)} Linh Thạch / cái</div>`;
      }
      const rar = I.rarityById[item.rarity];
      const st = this.game.state;
      const equippedSlot = Object.keys(st.equipment).find(k => st.equipment[k] === item);
      const res = equippedSlot && st.stats.resonance[equippedSlot];
      const base = I.baseStats(item);
      const baseTxt = Object.keys(base).map(k => {
        const v = k === 'ProjectileCount' ? base[k] : Math.round(base[k] * (res ? 1 + D.elements.resonanceBonus : 1));
        return `${I.statLabel[k]}: ${U.fmt(v)}`;
      }).join(' | ');
      let aff;
      if (!item.identified) aff = `<div class="unid">??? ${item.affixes.length} dòng Từ tố ẩn — giữ chuột phải ${D.inventory.identifyHoldSec}s (tốn ${D.inventory.identifyMpCost} Linh Lực) để Thần Thức quét.</div>`;
      else aff = item.affixes.map(a => {
        const def = I.affixById[a.AffixId];
        return `<div class="aff ${def.Category === 'Unique' ? 'uniq' : ''}" style="color:${I.tierColor(a.Tier)}">[T${a.Tier}] ${esc(def.Name)}: ${esc(I.describeAffix(a))}</div>`;
      }).join('');
      const ring = item.slot === 'Ring' ? `<div class="dim">Mở rộng túi: +${I.ringBonusSlots(item)} ô</div>` : '';
      return `<div class="tt-name" style="color:${rar.color}">${esc(item.name)} <span class="dim">Cấp ${item.level}</span></div>
        <div class="dim">[${rar.name} - Hệ <span style="color:${D.elements.colors[item.element]}">${D.elements.names[item.element]}</span>] · ${D.equipSlots.find(s => s.id === item.slot).name}${equippedSlot ? ' · <b>Đang trang bị</b>' : ''}</div>
        <div>${baseTxt}${res ? ' <span class="reso">(Cộng Hưởng +15%)</span>' : ''}</div>${ring}${aff}`;
    },

    // ---------- Kho đồ
    renderInventory(body) {
      const st = this.game.state;
      const slots = D.equipSlots;
      const pos = [[150, 40], [262, 122], [220, 252], [80, 252], [38, 122]];
      let arrows = '';
      for (let i = 0; i < 5; i++) {
        const a = pos[i], b = pos[(i + 1) % 5];
        const on = st.stats.resonance[slots[(i + 1) % 5].id];
        const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy);
        const ux = dx / l, uy = dy / l;
        arrows += `<line x1="${a[0] + ux * 40}" y1="${a[1] + uy * 40}" x2="${b[0] - ux * 44}" y2="${b[1] - uy * 44}" class="${on ? 'on' : ''}" marker-end="url(#${on ? 'ah-on' : 'ah'})"/>`;
      }
      let slotHtml = '';
      slots.forEach((s, i) => {
        const it = st.equipment[s.id];
        const res = st.stats.resonance[s.id];
        slotHtml += `<div class="eslot ${res ? 'reso' : ''}" data-slot="${s.id}" style="left:${pos[i][0] - 34}px;top:${pos[i][1] - 34}px;border-color:${it ? I.rarityById[it.rarity].color : '#3a4558'}">
          ${it ? `<img src="${this.itemIcon(it)}">` : `<span class="ph">${i + 1}</span>`}
          <div class="elab">Ô ${i + 1}: ${s.name}<br>${it ? `<span style="color:${D.elements.colors[it.element]}">(Hệ ${D.elements.names[it.element]})</span>` : '<span class="dim">(Trống)</span>'}</div></div>`;
      });
      const s = st.stats;
      const ring = st.equipment.Ring;
      const bagName = ring ? `${esc(ring.name)} (${st.inventory.items.length}/${st.inventory.capacity} Ô)` : `Túi Vải Thô (${st.inventory.items.length}/${st.inventory.capacity} Ô)`;
      const filters = [['all', 'Tất cả'], ['equip', 'Pháp Bảo'], ['Consumable', 'Đan Dược'], ['Material', 'Nguyên Liệu']];
      body.innerHTML = `
      <div class="inv">
        <div class="inv-left">
          <div class="penta">
            <svg width="300" height="300"><defs>
              <marker id="ah" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#46526a"/></marker>
              <marker id="ah-on" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#ffd23f"/></marker>
            </defs>${arrows}</svg>
            ${slotHtml}
          </div>
          <div class="reso-count">[CỘNG HƯỞNG: ${s.resonanceCount}/5 KÍCH HOẠT]</div>
          <div class="hint dim">Vòng Tương Sinh: Kim → Thủy → Mộc → Hỏa → Thổ → Kim</div>
          <div class="statbox">
            <div>Cảnh giới: <b>${st.realmLabel()}</b></div>
            <div>Công kích: <b>${U.fmt(s.atk)}</b> <span class="dim">(+${U.fmt(s.atkBonus)})</span></div>
            <div>Sinh lực: ${U.fmt(s.maxHp)} · Linh lực: ${U.fmt(s.maxMp)} · Phòng ngự: ${U.fmt(s.def)}</div>
            <div>Chí mạng: ${U.fmt1(s.critRate)}% · ST chí mạng: ${U.fmt1(s.critDmg)}%</div>
            <div>Số kiếm: ${s.swords} · Xuyên thấu: ${s.pierce} · Tốc độ kiếm: ${U.fmt1(s.swordSpeed)} m/s</div>
            <div>Tốc độ di chuyển: ${U.fmt1(s.moveSpeed)} m/s${s.aoe > 0 ? ` · Nổ: ${U.fmt1(s.aoe)}m` : ''}</div>
            <div>Đan độc: <span class="ddbar"><i style="width:${st.danDoc}%"></i></span> ${Math.round(st.danDoc)}%</div>
          </div>
        </div>
        <div class="inv-right">
          <div class="bag-head">
            <span>TÚI TRỮ VẬT: <b>[${bagName}]</b></span>
            <button id="btn-demo-kit" class="demo-btn" title="Nạp trang bị Thần Khí 5/5 tương sinh & Trang phục Hóa Thần xịn nhất">⚡ Nạp Demo Xịn Nhất</button>
            <span class="lt">◆ ${U.fmt(st.linhThach)} Linh Thạch</span>
          </div>
          <div class="filters">Bộ lọc: ${filters.map(f => `<button class="flt ${this.filter === f[0] ? 'active' : ''}" data-f="${f[0]}">${f[1]}</button>`).join('')}</div>
          <div class="grid" id="bag"></div>
          <div class="tooltip" id="tt">${this.tooltipHTML(null)}</div>
        </div>
      </div>`;
      const btnDemo = body.querySelector('#btn-demo-kit');
      if (btnDemo) {
        btnDemo.onclick = () => {
          this.confirm('Nạp toàn bộ <b>Trang Bị Thần Khí Cấp 15 (5/5 Tương Sinh)</b> và <b>Trang Phục Hóa Thần xịn nhất</b> cho nhân vật?', () => {
            st.giveUltimateDemoKit();
            TT.Save.save(st);
            this.toast('⚡ Đã nạp thành công Bộ Thần Khí Hóa Thần Đỉnh Phong & Vạn Cổ Tiên Đế Bào!');
            this.updateHud();
            this.renderMenu();
          });
        };
      }
      body.querySelectorAll('.flt').forEach(b => { b.onclick = () => { this.filter = b.dataset.f; this.renderMenu(); }; });
      body.querySelectorAll('.eslot').forEach(el => {
        const it = st.equipment[el.dataset.slot];
        el.onmouseenter = () => { this.hovered = it; $('#tt').innerHTML = this.tooltipHTML(it); };
        el.onmouseleave = () => { this.hovered = null; };
        el.onclick = () => {
          if (!it) return;
          const err = st.unequip(el.dataset.slot);
          if (err) this.toast(err);
          this.renderMenu();
        };
      });
      this.renderBag();
    },

    renderBag() {
      const st = this.game.state, bag = $('#bag');
      const items = st.inventory.items.filter(it => {
        if (this.filter === 'all') return true;
        if (this.filter === 'equip') return it.kind === 'equip';
        return it.kind === 'stack' && D.items[it.id].category === this.filter;
      });
      bag.innerHTML = '';
      const total = this.filter === 'all' ? st.inventory.capacity : Math.max(items.length, 10);
      for (let i = 0; i < total; i++) {
        const it = items[i];
        const c = document.createElement('div');
        c.className = 'cell';
        if (it) {
          c.style.borderColor = this.itemColor(it);
          const q = it.kind === 'stack' ? st.quickSlots.indexOf(it.id) : -1;
          c.innerHTML = `<img src="${this.itemIcon(it)}">${it.kind === 'stack' ? `<span class="cnt">x${it.count}</span>` : ''}${q >= 0 ? `<span class="qk">${q + 1}</span>` : ''}<div class="idprog"></div>`;
          c.onmouseenter = () => { this.hovered = it; $('#tt').innerHTML = this.tooltipHTML(it); };
          c.onmouseleave = () => { this.hovered = null; this.cancelIdentify(); };
          c.onclick = () => this.clickItem(it);
          c.onmousedown = e => { if (e.button === 2 && it.kind === 'equip' && !it.identified) this.startIdentify(it, c); };
          c.onmouseup = e => { if (e.button === 2) this.cancelIdentify(); };
        } else c.classList.add('empty');
        bag.appendChild(c);
      }
    },

    clickItem(it) {
      const st = this.game.state;
      if (it.kind === 'equip') {
        const err = st.equip(it);
        if (err) this.toast(err);
      } else {
        this.game.useConsumable(it.id);
      }
      this.renderMenu();
    },

    startIdentify(item, cell) {
      const st = this.game.state;
      if (st.mp < D.inventory.identifyMpCost) { this.toast(`Cần ${D.inventory.identifyMpCost} Linh Lực để Thần Thức quét!`); return; }
      this.cancelIdentify();
      const bar = cell.querySelector('.idprog');
      const t0 = performance.now();
      this.idTimer = setInterval(() => {
        const k = (performance.now() - t0) / 1000 / D.inventory.identifyHoldSec;
        bar.style.width = Math.min(100, k * 100) + '%';
        if (k >= 1) {
          this.cancelIdentify();
          st.mp -= D.inventory.identifyMpCost;
          item.identified = true;
          const rar = I.rarityById[item.rarity];
          this.toast(`Giám định: ${item.name} [${rar.name}]`);
          if (item.affixes.some(a => a.Tier === 5)) this.banner('Thần thức phát hiện Từ tố Tiên Phẩm!');
          this.renderMenu();
        }
      }, 30);
    },
    cancelIdentify() {
      if (this.idTimer) { clearInterval(this.idTimer); this.idTimer = null; }
      document.querySelectorAll('.idprog').forEach(b => { b.style.width = '0'; });
    },

    sell(it) {
      const st = this.game.state;
      if (!st.inventory.items.includes(it)) { this.toast('Chỉ bán được vật phẩm trong túi.'); return; }
      const price = I.sellPrice(it);
      const go = () => {
        st.inventory.removeItem(it);
        st.linhThach += price;
        this.toast(`Đã bán ${I.displayName(it)} được ${U.fmt(price)} Linh Thạch`);
        this.renderMenu();
      };
      const rare = it.kind === 'equip' && I.rarityById[it.rarity].index >= 3;
      if (rare || it.kind === 'stack') this.confirm(`Bán <b>${esc(I.displayName(it))}</b>${it.kind === 'stack' ? ' x' + it.count : ''} lấy <b>${U.fmt(price)}</b> Linh Thạch?`, go);
      else go();
    },

    // ---------- Tẩy Luyện
    rerollCandidates() {
      const st = this.game.state;
      const list = [];
      for (const k in st.equipment) if (st.equipment[k]) list.push(st.equipment[k]);
      for (const it of st.inventory.items) if (it.kind === 'equip' && it.identified) list.push(it);
      return list;
    },

    renderReroll(body) {
      const st = this.game.state;
      const cands = this.rerollCandidates();
      if (!cands.includes(this.rerollSel)) this.rerollSel = cands[0] || null;
      const it = this.rerollSel;
      const list = cands.map((c, i) => `<div class="rc ${c === it ? 'sel' : ''}" data-i="${i}" style="color:${I.rarityById[c.rarity].color}"><img src="${this.itemIcon(c)}">${esc(c.name)} <span class="dim">Cấp ${c.level}</span></div>`).join('');
      if (!it) { body.innerHTML = '<div class="empty-note">Không có trang bị đã giám định để Tẩy Luyện.</div>'; return; }
      const rar = I.rarityById[it.rarity];
      const cost = TT.Reroll.cost(it);
      const L = TT.Reroll.lockedCount(it), maxL = TT.Reroll.maxLocks(it);
      const have = { lt: st.linhThach, tlt: st.inventory.count('TAY_LUYEN_THACH'), dhc: st.inventory.count('DINH_HON_CHAU') };
      const ok = have.lt >= cost.linhThach && have.tlt >= cost.tayLuyenThach && have.dhc >= cost.dinhHonChau;
      const pityOk = rar.maxTier >= 5;
      const affs = it.affixes.map((a, i) => {
        const def = I.affixById[a.AffixId];
        const tw = I.tierWeight[a.Tier];
        return `<div class="arow ${a.IsLocked ? 'locked' : ''} ${this.flashRows && this.flashRows.includes(i) ? 't5flash' : ''}">
          <span class="anum">${i + 1}.</span>
          <span style="color:${tw.ColorHex}">[T${a.Tier} - ${tw.Name}] ${esc(I.describeAffix(a))}</span>
          <button class="lock ${a.IsLocked ? 'on' : ''}" data-i="${i}">${a.IsLocked ? '🔒 KHÓA' : '🔓 MỞ'}</button></div>`;
      }).join('');
      body.innerHTML = `
      <div class="rr">
        <div class="rr-left">
          <div class="rr-sel">
            <img src="${this.itemIcon(it)}" class="big" style="border-color:${rar.color}">
            <div style="color:${rar.color}" class="rr-name">${esc(it.name)}</div>
            <div class="dim">(Phẩm: ${rar.name} · Cấp ${it.level} · Tier ${rar.minTier}-${rar.maxTier})</div>
          </div>
          <div class="pity">Linh Vận (Bảo Hiểm T5):
            <div class="pbar"><i style="width:${st.linhVan}%"></i><span>${st.linhVan}/${D.reroll.pityMax}</span></div>
            <div class="dim">${pityOk ? `(Đầy ${D.reroll.pityMax} chắc chắn ra T5)` : '(Phẩm chất này không thể đạt T5)'}</div>
          </div>
          <div class="rc-list">${list}</div>
        </div>
        <div class="rr-right">
          <div class="rr-head">DANH SÁCH TỪ TỐ HIỆN TẠI (Khóa tối đa: ${L}/${maxL})</div>
          ${affs}
          <div class="warn">[!] Lưu ý: Các dòng [MỞ] sẽ bị thay thế ngẫu nhiên khi bấm Tẩy Luyện!</div>
          <div class="costs">
            <div class="${have.lt < cost.linhThach ? 'bad' : ''}">◆ Linh Thạch: ${U.fmt(cost.linhThach)} / ${U.fmt(have.lt)} <span class="dim">(Hệ số khóa x${cost.lockMultiplier})</span></div>
            <div class="${have.tlt < cost.tayLuyenThach ? 'bad' : ''}">◆ Tẩy Luyện Thạch: ${cost.tayLuyenThach} / ${have.tlt}</div>
            <div class="${have.dhc < cost.dinhHonChau ? 'bad' : ''}">◆ Định Hồn Châu: ${cost.dinhHonChau} / ${have.dhc} <span class="dim">(Tốn ${L} viên do khóa ${L} dòng)</span></div>
          </div>
          <button id="do-reroll" class="bigbtn" ${ok ? '' : 'disabled'}>[ BẤM ĐỂ TẨY LUYỆN (R) ]</button>
        </div>
      </div>`;
      body.querySelectorAll('.rc').forEach(el => { el.onclick = () => { this.rerollSel = cands[+el.dataset.i]; this.flashRows = null; this.renderMenu(); }; });
      body.querySelectorAll('.lock').forEach(b => {
        b.onclick = () => {
          const a = it.affixes[+b.dataset.i];
          if (!a.IsLocked && L >= maxL) { this.toast(`Chỉ được khóa tối đa ${maxL} dòng.`); return; }
          a.IsLocked = !a.IsLocked;
          this.flashRows = null;
          this.renderMenu();
        };
      });
      $('#do-reroll').onclick = () => this.doReroll();
    },

    doReroll() {
      const st = this.game.state, it = this.rerollSel;
      if (!it) return;
      const cost = TT.Reroll.cost(it);
      if (st.linhThach < cost.linhThach || st.inventory.count('TAY_LUYEN_THACH') < cost.tayLuyenThach || st.inventory.count('DINH_HON_CHAU') < cost.dinhHonChau) {
        this.toast('Không đủ nguyên liệu Tẩy Luyện!'); return;
      }
      const go = () => {
        st.linhThach -= cost.linhThach;
        st.inventory.remove('TAY_LUYEN_THACH', cost.tayLuyenThach);
        if (cost.dinhHonChau) st.inventory.remove('DINH_HON_CHAU', cost.dinhHonChau);
        const r = TT.Reroll.reroll(it, st.linhVan);
        st.linhVan = r.pity;
        this.flashRows = r.newTier5;
        if (r.forced) this.toast('Linh Vận viên mãn! Ép ra Tiên Phẩm (T5).');
        if (r.newTier5.length) this.banner('✦ TIÊN PHẨM XUẤT THẾ ✦');
        st.recompute();
        this.renderMenu();
      };
      if (TT.Reroll.hasUnlockedTier5(it)) this.confirm('Có dòng <b style="color:#F39C12">Tier 5 (Tiên Phẩm)</b> chưa khóa sẽ bị thay thế.<br>Vẫn tiếp tục Tẩy Luyện?', go);
      else go();
    },

    // ---------- Luyện Đan
    renderAlchemy(body) {
      const st = this.game.state;
      const rows = D.recipes.map((r, i) => {
        const def = D.items[r.out];
        const parts = Object.keys(r.cost).map(id => {
          const have = st.inventory.count(id);
          return `<span class="${have < r.cost[id] ? 'bad' : ''}">${D.items[id].name} ${have}/${r.cost[id]}</span>`;
        });
        parts.push(`<span class="${st.linhThach < r.linhThach ? 'bad' : ''}">◆ ${r.linhThach} Linh Thạch</span>`);
        const ok = Object.keys(r.cost).every(id => st.inventory.count(id) >= r.cost[id]) && st.linhThach >= r.linhThach;
        return `<div class="recipe"><img src="${Art.icon(def.icon, def.color)}"><div class="rinfo"><b style="color:${def.color}">${def.name}</b> x${r.count}
          <div class="dim">${esc(def.desc)}</div><div class="rcost">${parts.join(' · ')}</div></div>
          <button class="craft" data-i="${i}" ${ok ? '' : 'disabled'}>Luyện</button></div>`;
      }).join('');
      body.innerHTML = `<div class="alc"><div class="alc-head">ĐAN LÔ · Luyện chế Đan Dược, Phù Lục và nguyên liệu Tẩy Luyện. <span class="lt">◆ ${U.fmt(st.linhThach)}</span></div>${rows}</div>`;
      body.querySelectorAll('.craft').forEach(b => {
        b.onclick = () => {
          const r = D.recipes[+b.dataset.i];
          const out = I.createStack(r.out, r.count);
          // kiểm tra chỗ trống trước khi trừ
          const probe = new TT.Inventory();
          probe.capacity = st.inventory.capacity;
          probe.items = st.inventory.items.map(x => Object.assign({}, x));
          for (const id in r.cost) probe.remove(id, r.cost[id]);
          if (probe.add(I.createStack(r.out, r.count)) > 0) { this.toast('Túi Trữ Vật không đủ chỗ!'); return; }
          for (const id in r.cost) st.inventory.remove(id, r.cost[id]);
          st.linhThach -= r.linhThach;
          st.inventory.add(out);
          this.toast(`Luyện thành công ${D.items[r.out].name} x${r.count}`);
          this.renderMenu();
        };
      });
    },

    // ---------- Hộp thoại NPC
    /** Lời thoại theo ngữ cảnh (Chưởng Môn nhận xét tiến độ tu luyện). */
    npcLines(def) {
      const st = this.game.state, lines = def.lines.slice();
      if (def.context) {
        let hint;
        if (st.realmDef.final) hint = 'Ngươi đã đạt Hóa Thần, vượt cả bổn tọa năm xưa. Thiên Kiếm Tông có ngươi là phúc.';
        else if (st.atBottleneck()) hint = `Ngươi đã chạm bình cảnh ${st.realmLabel()}. Lên Lôi Đài vượt ${D.tribulations[st.nextTribulation()].name} đi!`;
        else hint = `Ngươi đang ở ${st.realmLabel()}, tu vi ${U.fmt(st.tuvi)}/${U.fmt(st.tuviNeeded)}. Vào Bí Cảnh trảm yêu để tích lũy.`;
        if (st.danDoc >= 40) hint += ` Đan độc trong người đã ${Math.round(st.danDoc)}%, hãy giải bớt trước khi Độ Kiếp.`;
        lines.unshift(hint);
      }
      return lines;
    },

    openDialog(n) {
      const def = n.npc;
      n.talking = true;
      this.dlg = { n, lines: this.npcLines(def), i: 0 };
      $('#dlg-title').textContent = def.title;
      $('#dlg-name').textContent = def.name;
      const cv = $('#dlg-portrait'), ctx = cv.getContext('2d');
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.save(); ctx.scale(2, 2);
      TT.Character.draw(ctx, 35, 70, Math.PI / 2, 0.5, { skin: def.look, spirit: !!def.aura, color: def.aura ? def.aura.color : undefined, realm: 0 });
      ctx.restore();
      const btns = $('#dlg-btns');
      btns.innerHTML = '';
      const add = (label, fn) => { const b = document.createElement('button'); b.className = 'bigbtn'; b.textContent = label; b.onclick = fn; btns.appendChild(b); };
      for (const [label, action] of def.actions || []) add(label, () => { this.closeDialog(); this.runAction(action); });
      if (this.dlg.lines.length > 1) add('Nói tiếp (E)', () => this.nextLine());
      add('Tạm biệt (Esc)', () => this.closeDialog());
      $('#dialog').classList.remove('hidden');
      this.showLine();
      this.syncPause();
    },
    showLine() { $('#dlg-text').textContent = this.dlg.lines[this.dlg.i]; },
    nextLine() { if (!this.dlg) return; this.dlg.i = (this.dlg.i + 1) % this.dlg.lines.length; this.showLine(); },
    closeDialog() {
      if (this.dlg) this.dlg.n.talking = false;
      this.dlg = null;
      $('#dialog').classList.add('hidden');
      this.syncPause();
    },
    runAction(action) {
      if (action === 'tribulation') this.openTribulationPrep();
      else if (action === 'help') this.openHelp();
      else this.openMenu(action);
    },

    // ---------- Cửa hàng Vạn Bảo Các
    renderShop(body) {
      const st = this.game.state;
      const rows = D.shop.map(([id, price], i) => {
        const def = D.items[id];
        const discountedPrice = Math.max(1, Math.floor(price * (1 - st.stats.clanShopDiscount)));
        const can1 = st.linhThach >= discountedPrice, can5 = st.linhThach >= discountedPrice * 5;
        return `<div class="recipe shop-row"><img src="${Art.icon(def.icon, def.color)}"><div class="rinfo"><b style="color:${def.color}">${esc(def.name)}</b>
          <span class="dim">· đang có ${st.inventory.count(id)}</span><div class="dim">${esc(def.desc)}</div><div class="rcost">◆ ${U.fmt(discountedPrice)} Linh Thạch / cái${st.stats.clanShopDiscount ? ` <span class="dim">(giảm ${Math.round(st.stats.clanShopDiscount * 100)}%)</span>` : ''}</div></div>
          <button class="craft buy" data-i="${i}" data-n="1" ${can1 ? '' : 'disabled'}>Mua 1</button>
          <button class="craft buy" data-i="${i}" data-n="5" ${can5 ? '' : 'disabled'}>Mua 5</button></div>`;
      }).join('');
      body.innerHTML = `<div class="alc"><div class="alc-head">VẠN BẢO CÁC · Thương Nhân Vạn Bảo <span class="lt">◆ ${U.fmt(st.linhThach)}</span></div>${rows}
        <p class="dim">Bán đồ: mở Túi Trữ Vật, rê chuột lên vật phẩm và bấm X.</p></div>`;
      body.querySelectorAll('.buy').forEach(b => {
        b.onclick = () => {
          const [id, price] = D.shop[+b.dataset.i], n = +b.dataset.n;
          const discountedPrice = Math.max(1, Math.floor(price * (1 - st.stats.clanShopDiscount)));
          if (st.linhThach < discountedPrice * n) return;
          const left = st.inventory.add(I.createStack(id, n));
          const bought = n - left;
          if (bought <= 0) { this.toast('Túi Trữ Vật đã đầy!'); return; }
          st.linhThach -= discountedPrice * bought;
          this.toast(`Mua ${D.items[id].name} x${bought}` + (left ? ' (túi đầy)' : ''));
          this.renderMenu();
        };
      });
    },

    // ---------- Chọn Bí Cảnh
    renderBiCanhSelect(body) {
      const g = this.game, inHub = g.scene.type === 'dongphu';
      const cards = Object.keys(D.biomes).map(id => {
        const b = D.biomes[id], col = D.elements.colors[b.element];
        return `<div class="biome" style="border-color:${col}">
          <canvas class="bprev" data-id="${id}" width="300" height="120"></canvas>
          <div class="bname" style="color:${col}">${esc(b.name)} <span class="dim">· Hệ ${D.elements.names[b.element]}</span></div>
          <div class="dim">${esc(b.desc)}</div>
          <div class="bmeta">Linh thảo ${b.gather.herb} · Khoáng mạch ${b.gather.ore} · Bảo rương ${b.gather.chest} · Linh tuyền ${b.gather.spring}</div>
          <div class="dim">Bảo rương rơi trang bị hệ ${D.elements.names[b.element]}.</div>
          <button class="bigbtn bgo" data-id="${id}" ${inHub ? '' : 'disabled'}>Tiến Vào</button>
        </div>`;
      }).join('');
      body.innerHTML = `<div class="bsel"><div class="alc-head">SƠN MÔN · Chọn Bí Cảnh để lịch luyện (Yêu thú theo cảnh giới hiện tại: cấp ${g.state.itemLevel})</div><div class="biomes">${cards}</div>
        ${inHub ? '' : '<p class="dim">Chỉ có thể chọn Bí Cảnh khi ở Tông Môn.</p>'}</div>`;
      body.querySelectorAll('.bprev').forEach(cv => this.drawBiomePreview(cv, cv.dataset.id));
      body.querySelectorAll('.bgo').forEach(b => { b.onclick = () => { this.closeMenu(); g.enterBiCanh(b.dataset.id); }; });
    },

    /** Ảnh xem trước vùng: một lát nền + vài đạo cụ đặc trưng. */
    drawBiomePreview(cv, id) {
      const b = D.biomes[id], ctx = cv.getContext('2d');
      const gr = TT.Env.makeBiomeGround(300, b.ground, 42);
      ctx.drawImage(gr.canvas, 0, 0, 300, 300, 0, -90, 300, 300);
      const kinds = b.props.slice().sort((x, y) => y[1] - x[1]).map(x => x[0]);
      const spots = [[60, 112], [150, 104], [240, 116], [105, 118], [200, 120]];
      spots.forEach(([x, y], i) => {
        const kind = i === 3 ? 'herb' : i === 4 ? 'chest' : kinds[i % kinds.length];
        const d = TT.Env.DEFS[kind], img = TT.Env.sprite(kind, kind === 'herb' ? b.herbVariant : kind === 'chest' ? 'closed' : 0);
        const s = Math.min(1, 100 / d.ay);
        ctx.drawImage(img, x - d.ax * s, y - d.ay * s, d.w * s, d.h * s);
      });
    },

    // ---------- Vũ Khí (Thần Binh & Kiếm Hình)
    renderWeapons(body) {
      const st = this.game.state;
      const wcol = st.equipment.Weapon ? D.elements.colors[st.equipment.Weapon.element] : '#9fe8ff';
      const cards = D.swordSkins.map(s => {
        const owned = st.ownedSwordSkins.includes(s.id), on = st.swordSkin === s.id;
        const reqRealm = s.realm ? D.realms[s.realm].name : 'Luyện Khí';
        const price = s.price ? Math.max(1, Math.floor(s.price * (1 - st.stats.clanShopDiscount))) : 0;
        let btn;
        if (on) btn = `<button class="bigbtn" disabled>Đang Dùng</button>`;
        else if (owned) btn = `<button class="bigbtn wp-wear" data-id="${s.id}">Ngự Kiếm</button>`;
        else if (st.realm < s.realm) btn = `<button class="bigbtn" disabled>Cần ${reqRealm}</button>`;
        else btn = `<button class="bigbtn wp-buy" data-id="${s.id}" ${st.linhThach >= price ? '' : 'disabled'}>Luyện Hóa ◆ ${U.fmt(price)}</button>`;

        const metaText = s.price ? `◆ ${U.fmt(price)} Linh Thạch${st.stats.clanShopDiscount ? ` (giảm ${Math.round(st.stats.clanShopDiscount * 100)}%)` : ''} · Cần ${reqRealm}` : `Miễn Phí · Cần ${reqRealm}`;
        return `<div class="weapon-card ${on ? 'on' : ''}">
          <canvas class="wpprev" data-id="${s.id}" width="180" height="150"></canvas>
          <div class="bname">${esc(s.name)}</div>
          <div class="wp-meta">${metaText}</div>
          <div class="dim">${esc(s.desc)}</div>
          ${btn}
        </div>`;
      }).join('');

      body.innerHTML = `<div class="bsel">
        <div class="alc-head">KIẾM CÁC · VŨ KHÍ &amp; PHI KIẾM <span class="lt">◆ ${U.fmt(st.linhThach)} Linh Thạch</span></div>
        <div class="wp-subtitle dim">Mỗi thanh kiếm thay đổi ngoại hình kiếm cầm tay và phi kiếm khi phóng bằng kỹ năng <b>Ngự Kiếm</b>. Hào quang tự động kích hoạt theo hệ Ngũ Hành.</div>
        <div class="weapons">${cards}</div>
      </div>`;

      body.querySelectorAll('.wpprev').forEach(cv => {
        const ctx = cv.getContext('2d'), id = cv.dataset.id;
        const s = D.swordSkins.find(k => k.id === id);
        ctx.fillStyle = '#101722'; ctx.fillRect(0, 0, 180, 150);
        // nhân vật cầm kiếm nhìn nghiêng bên trái
        ctx.save(); ctx.scale(1.4, 1.4);
        TT.Character.draw(ctx, 32, 74, 0, 1.3, { skin: st.skin, sword: id, color: wcol, realm: 0, spirit: false });
        ctx.restore();
        // phi kiếm phóng to bên phải
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        TT.Art.glow(ctx, 130, 75, 36, (s && s.pal && (s.pal.gem || s.pal.gold)) || wcol, 0.4);
        ctx.restore();
        TT.Art.drawSword(ctx, 130, 75, -Math.PI / 2, 92, wcol, 1, s, 0);
      });

      body.querySelectorAll('.wp-buy').forEach(b => {
        b.onclick = () => {
          const s = D.swordSkins.find(k => k.id === b.dataset.id);
          const price = s.price ? Math.max(1, Math.floor(s.price * (1 - st.stats.clanShopDiscount))) : 0;
          this.confirm(`Luyện hóa <b>${esc(s.name)}</b> với giá <b>${U.fmt(price)}</b> Linh Thạch?`, () => {
            if (st.linhThach < price || st.ownedSwordSkins.includes(s.id)) return;
            st.linhThach -= price; st.ownedSwordSkins.push(s.id); st.swordSkin = s.id;
            TT.Save.save(st);
            this.toast('Đã luyện hóa: ' + s.name);
            this.renderMenu();
          });
        };
      });

      body.querySelectorAll('.wp-wear').forEach(b => {
        b.onclick = () => {
          const s = D.swordSkins.find(k => k.id === b.dataset.id);
          st.swordSkin = b.dataset.id;
          TT.Save.save(st);
          this.toast('Đã ngự trang: ' + (s ? s.name : b.dataset.id));
          this.renderMenu();
        };
      });
    },

    // ---------- Y Phục (skin)
    renderSkins(body) {
      const st = this.game.state;
      const cards = D.skins.map(s => {
        const owned = st.ownedSkins.includes(s.id), on = st.skin === s.id;
        let btn;
        if (on) btn = `<button class="bigbtn" disabled>Đang Mặc</button>`;
        else if (owned) btn = `<button class="bigbtn sk-wear" data-id="${s.id}">Thay Y Phục</button>`;
        else if (st.realm < s.realm) btn = `<button class="bigbtn" disabled>Cần ${D.realms[s.realm].name}</button>`;
        else btn = `<button class="bigbtn sk-buy" data-id="${s.id}" ${st.linhThach >= s.price ? '' : 'disabled'}>Mua ◆ ${U.fmt(s.price)}</button>`;
        return `<div class="skin ${on ? 'on' : ''}"><canvas class="skprev" data-id="${s.id}" width="150" height="150"></canvas>
          <div class="bname">${esc(s.name)}</div><div class="dim">${esc(s.desc)}</div>${btn}</div>`;
      }).join('');

      body.innerHTML = `<div class="bsel">
        <div class="alc-head">KIẾM CÁC · Y PHỤC <span class="lt">◆ ${U.fmt(st.linhThach)} Linh Thạch</span></div>
        <div class="wp-subtitle dim">Khoác tiên bào, đạo y tăng phong thái Kiếm Tu. Đổi vũ khí và phi kiếm tại tab <b class="gold cursor-pointer" id="btn-tab-wp">[VŨ KHÍ]</b>.</div>
        <div class="skins">${cards}</div>
      </div>`;

      const toWp = body.querySelector('#btn-tab-wp');
      if (toWp) toWp.onclick = () => this.openMenu('weapons');

      const wcol = st.equipment.Weapon ? D.elements.colors[st.equipment.Weapon.element] : '#9fe8ff';
      body.querySelectorAll('.skprev').forEach(cv => {
        const ctx = cv.getContext('2d'), id = cv.dataset.id;
        ctx.fillStyle = '#121a24'; ctx.fillRect(0, 0, 150, 150);
        ctx.save(); ctx.scale(1.6, 1.6);
        TT.Character.draw(ctx, 47, 70, Math.PI / 2, 1.3, { skin: id, sword: st.swordSkin, color: wcol, realm: st.realm });
        ctx.restore();
      });

      body.querySelectorAll('.sk-buy').forEach(b => {
        b.onclick = () => {
          const s = D.skins.find(k => k.id === b.dataset.id);
          this.confirm(`Mua <b>${esc(s.name)}</b> với giá <b>${U.fmt(s.price)}</b> Linh Thạch?`, () => {
            if (st.linhThach < s.price || st.ownedSkins.includes(s.id)) return;
            st.linhThach -= s.price; st.ownedSkins.push(s.id); st.skin = s.id;
            TT.Save.save(st);
            this.toast('Đã khoác ' + s.name);
            this.renderMenu();
          });
        };
      });

      body.querySelectorAll('.sk-wear').forEach(b => {
        b.onclick = () => { st.skin = b.dataset.id; TT.Save.save(st); this.renderMenu(); };
      });
    },

    // ---------- Động Phủ
    renderDongPhu(body) {
      const st = this.game.state, g = this.game;
      const trib = st.nextTribulation();
      const inHub = g.scene.type === 'dongphu';
      body.innerHTML = `<div class="dp">
        <div class="dp-realm">${st.realmLabel()}</div>
        <div class="pbar wide"><i style="width:${U.clamp(st.tuvi / st.tuviNeeded, 0, 1) * 100}%"></i><span>Tu vi ${U.fmt(st.tuvi)} / ${U.fmt(st.tuviNeeded)}</span></div>
        <p>${st.realmDef.final ? 'Đạo hữu đã đạt Hóa Thần. Có thể tiếp tục vào Bí Cảnh săn Thần Khí.' :
          st.atBottleneck() ? `<b class="gold">Bình cảnh!</b> Cần vượt <b>${D.tribulations[trib].name}</b> để đột phá ${D.realms[st.realm + 1].name}.` :
          'Trảm yêu thú trong Bí Cảnh hoặc dùng Tụ Khí Đan để tích lũy tu vi.'}</p>
        <p>Đan độc: <b>${Math.round(st.danDoc)}/100</b> ${st.danDoc > 0 ? '— Đan độc làm Lôi Kiếp mạnh hơn tới 50%. Dùng Thanh Tâm Đan để giải.' : ''}</p>
        <div class="dp-btns">
          <button id="dp-trib" class="bigbtn" ${st.atBottleneck() && inHub ? '' : 'disabled'}>Chuẩn Bị Độ Kiếp</button>
          <button id="dp-go" class="bigbtn" ${inHub ? '' : 'disabled'}>Vào Bí Cảnh</button>
          <button id="dp-demo" class="bigbtn demo-btn" style="padding: 10px 14px; font-size: 13px;">⚡ Nạp Demo Xịn Nhất</button>
          <button id="dp-save" class="bigbtn">Lưu</button>
          <button id="dp-reset" class="bigbtn danger">Chơi Lại Từ Đầu</button>
        </div>
        ${inHub ? '' : '<p class="dim">Chỉ có thể Độ Kiếp / vào Bí Cảnh khi ở Động Phủ.</p>'}
        <div class="help-inline">${$('#help-body').innerHTML}</div>
      </div>`;
      $('#dp-trib').onclick = () => { this.closeMenu(); this.openTribulationPrep(); };
      $('#dp-go').onclick = () => { this.tab = 'bicanh'; this.renderMenu(); };
      $('#dp-demo').onclick = () => {
        this.confirm('Nạp toàn bộ <b>Trang Bị Thần Khí Cấp 15 (5/5 Tương Sinh)</b> và <b>Trang Phục Hóa Thần xịn nhất</b> cho nhân vật?', () => {
          st.giveUltimateDemoKit();
          TT.Save.save(st);
          this.toast('⚡ Đã nạp thành công Bộ Thần Khí Hóa Thần Đỉnh Phong & Vạn Cổ Tiên Đế Bào!');
          this.updateHud();
          this.renderMenu();
        });
      };
      $('#dp-save').onclick = () => { TT.Save.save(st); this.toast('Đã lưu.'); };
      $('#dp-reset').onclick = () => this.confirm('Xóa toàn bộ dữ liệu và bắt đầu lại từ Luyện Khí?', () => { TT.Save.clear(); location.reload(); });
    },

    // ---------------------------------------------------------------- Độ Kiếp
    openTribulationPrep() {
      const st = this.game.state;
      if (!st.atBottleneck()) {
        this.toast(st.realmDef.final ? 'Đã viên mãn, không còn Thiên Kiếp.' : `Tu vi chưa viên mãn (${st.realmLabel()}). Cần đạt Hậu Kỳ đầy tu vi mới có thể Độ Kiếp.`);
        return;
      }
      const pickFirst = cat => Object.keys(D.items).find(id => D.items[id].formation === cat && st.inventory.count(id) > 0) || null;
      this.prep = { Talisman: pickFirst('Talisman'), Treasure: pickFirst('Treasure'), Pill: pickFirst('Pill') };
      $('#prep').classList.remove('hidden');
      this.syncPause();
      this.renderPrep();
    },
    closePrep() { this.prep = null; $('#prep').classList.add('hidden'); this.syncPause(); },

    prepEffects() {
      let reduction = 0, block = 0, heal = 0;
      for (const k in this.prep) {
        const id = this.prep[k];
        if (!id) continue;
        const fx = D.items[id].formationEffect;
        reduction += fx.reduction || 0; block += fx.blockCharges || 0; heal += fx.healPerWave || 0;
      }
      return { reduction: Math.min(D.lightning.maxFormationReduction, reduction), block, heal };
    },

    /** Ước tính tỷ lệ sống sót bằng mô phỏng Monte Carlo đơn giản. */
    estimateSurvival(cfg, fx) {
      const st = this.game.state, L = D.lightning;
      let ok = 0;
      const runs = 400;
      const hitP = { track: 0.22, grid: 0.12, final: 0.35 };
      for (let r = 0; r < runs; r++) {
        let hp = st.stats.maxHp, block = fx.block, alive = true;
        for (let k = 1; k <= cfg.waves && alive; k++) {
          const dmg = TT.Game.tribulationDamage(cfg.baseDamage, k, st.danDoc, fx.reduction, st.stats.clanLightningResistance);
          for (const pat of cfg.pattern[k - 1]) {
            const n = pat === 'track' ? L.trackStrikesBase + Math.floor(k / 2) : pat === 'grid' ? 2 : 1;
            for (let i = 0; i < n; i++) {
              if (Math.random() < hitP[pat]) {
                if (block > 0) { block--; continue; }
                hp -= (pat === 'final' ? dmg * 1.5 : dmg) * 1.15;
              }
            }
          }
          if (hp <= 0) alive = false;
          else hp = Math.min(st.stats.maxHp, hp + st.stats.maxHp * fx.heal);
        }
        if (alive) ok++;
      }
      return Math.round((ok / runs) * 100);
    },

    renderPrep() {
      const st = this.game.state;
      const key = st.nextTribulation(), cfg = D.tribulations[key];
      const fx = this.prepEffects();
      const dmin = TT.Game.tribulationDamage(cfg.baseDamage, 1, st.danDoc, fx.reduction, st.stats.clanLightningResistance);
      const dmax = TT.Game.tribulationDamage(cfg.baseDamage, cfg.waves, st.danDoc, fx.reduction, st.stats.clanLightningResistance);
      const surv = this.estimateSurvival(cfg, fx);
      const slot = (cat, title) => {
        const id = this.prep[cat];
        const def = id ? D.items[id] : null;
        return `<div class="fslot" data-cat="${cat}">
          <div class="ftitle">[${title}]</div>
          ${def ? `<img src="${Art.icon(def.icon, def.color)}"><div style="color:${def.color}">${def.name} <span class="dim">(còn ${st.inventory.count(id)})</span></div><div class="dim">${esc(def.desc.replace('Độ Kiếp: ', ''))}</div>` : '<div class="dim">(Trống — bấm để chọn)</div>'}
        </div>`;
      };
      $('#prep-title').textContent = `CHUẨN BỊ ĐỘ KIẾP: ${st.realmLabel().toUpperCase()} → ${D.realms[st.realm + 1].name.toUpperCase()}`;
      $('#prep-body').innerHTML = `
        <div class="prep-left">
          <div class="ph">THÔNG TIN THIÊN KIẾP: <b>${cfg.name}</b></div>
          <div>* Số đợt sét: <b>${cfg.waves} Đạo</b> · Bán kính Lôi Đài: ${cfg.radiusM}m</div>
          <div>* Sát thương dự kiến: <b>${U.fmt(dmin)} → ${U.fmt(dmax)}</b> / tia</div>
          <div>* Sinh lực của bạn: ${U.fmt(st.stats.maxHp)}</div>
          <div>* Đan độc hiện tại: ${Math.round(st.danDoc)}/100 ${st.danDoc > 0 ? `<span class="bad">(Cảnh báo: Sét mạnh thêm +${Math.round(st.danDoc / D.lightning.danDocDivisor * 100)}%!)</span>` : ''}</div>
          <div>* Giảm sát thương trận pháp: ${Math.round(fx.reduction * 100)}% <span class="dim">(tối đa ${D.lightning.maxFormationReduction * 100}%)</span></div>
          <div class="surv">TỶ LỆ SỐNG SÓT ƯỚC TÍNH: <b class="${surv >= 60 ? 'good' : surv >= 30 ? 'gold' : 'bad'}">${surv}%</b></div>
          <div class="dim">${st.danDoc > 20 ? 'Lời khuyên: Hãy uống Thanh Tâm Đan để giảm Đan Độc trước khi Độ Kiếp!' : 'Lời khuyên: Khi vòng đỏ đứng yên (0.3s), bấm Space lướt ra ngoài!'}</div>
        </div>
        <div class="prep-right">
          <div class="ph">TRẬN PHÁP HỘ THÂN (Đặt vật phẩm trợ giúp)</div>
          <div class="fslots">${slot('Talisman', 'Ô PHÙ LỤC')}${slot('Treasure', 'Ô PHÁP BẢO ĐỠ')}${slot('Pill', 'Ô ĐAN DƯỢC ĐỘT PHÁ')}</div>
          <div class="dim">Bấm vào ô để đổi vật phẩm. Luyện thêm tại Đan Lô.</div>
        </div>`;
      document.querySelectorAll('.fslot').forEach(el => {
        el.onclick = () => {
          const cat = el.dataset.cat;
          const opts = [null].concat(Object.keys(D.items).filter(id => D.items[id].formation === cat && st.inventory.count(id) > 0));
          const i = opts.indexOf(this.prep[cat]);
          this.prep[cat] = opts[(i + 1) % opts.length];
          this.renderPrep();
        };
      });
    },

    startTribulation() {
      const f = this.prep;
      const go = () => { this.closePrep(); this.game.enterTribulation(f); };
      const surv = this.estimateSurvival(D.tribulations[this.game.state.nextTribulation()], this.prepEffects());
      if (surv < 30) this.confirm(`Tỷ lệ sống sót chỉ khoảng <b class="bad">${surv}%</b>. Thất bại sẽ mất ${Math.round(D.failTuviLoss * 100)}% tu vi.<br>Vẫn triệu hồi Lôi Kiếp?`, go);
      else go();
    }
  };

  TT.UI = UI;
})(window.TT);
