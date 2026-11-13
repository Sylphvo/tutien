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

  function drawSectAura(ctx, x, y, t, color, radius) {
    if (!color) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = rgba(color, 0.3 + Math.sin(t * 2.2) * 0.08);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(x, y, radius + Math.sin(t * 1.7) * 1.5, 5, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Dáng lưỡi kiếm cho skin kiếm (D.swordSkins[].shape).
  const SWORD_SHAPES = {
    jian:  { len: 1,    w: 1,    taper: 0.67, guard: 1,    blunt: false }, // trường kiếm thẳng
    thin:  { len: 1.08, w: 0.72, taper: 0.7,  guard: 0.8,  blunt: false }, // kiếm mảnh
    broad: { len: 1,    w: 1.4,  taper: 0.85, guard: 1.15, blunt: false }, // bản rộng
    heavy: { len: 0.95, w: 1.8,  taper: 0.95, guard: 1.3,  blunt: true },  // trọng kiếm mũi bằng
    solar_flame: { len: 1.08, w: 1.3, taper: 0.62, guard: 1.5, blunt: false },
    crystal_sword: { len: 1.15, w: 1.2, taper: 0.65, guard: 1.2, blunt: false }
  };

  // ---- Quản lý Sprite Sheet & Khử Nền Caro (Sprite Sheet & Background Filter) ----
  const CRYSTAL_SWORD_PIVOT_X = 0.65;
  const CRYSTAL_SWORD_PIVOT_Y = 0.30;
  const CRYSTAL_SWORD_BASE_ANGLE = Math.atan2(1204 - 1308 * CRYSTAL_SWORD_PIVOT_Y, 219 - 736 * CRYSTAL_SWORD_PIVOT_X); // ~1.88015 rad
  const CRYSTAL_SWORD_BLADE_LEN = Math.hypot(219 - 736 * CRYSTAL_SWORD_PIVOT_X, 1204 - 1308 * CRYSTAL_SWORD_PIVOT_Y); // ~852.05 px

  const SHEET_CONFIGS = {
    crystal_sword: ['assets/crystal_sword.png', 'src/tutien/assets/crystal_sword.png', 'kiem/crystal_sword.png', '../kiem/crystal_sword.png', '../../src/tutien/assets/crystal_sword.png'],
    sheet1: ['assets/sheet1.png', 'src/tutien/assets/sheet1.png', '../assets/sheet1.png', '../../src/tutien/assets/sheet1.png'],
    sheet2: ['assets/sheet2.png', 'src/tutien/assets/sheet2.png', '../assets/sheet2.png', '../../src/tutien/assets/sheet2.png'],
    sheet3: ['assets/sheet3.png', 'src/tutien/assets/sheet3.png', '../assets/sheet3.png', '../../src/tutien/assets/sheet3.png']
  };

  const loadedRawImages = {};       // key -> HTMLImageElement
  const cleanedSheetCanvases = {};   // key -> Offscreen HTMLCanvasElement (đã lọc nền)
  const weaponTrimmedSprites = {};   // skinId -> { canvas, pivotX, pivotY, baseAngleOffset, bladeLen, w, h }

  /**
   * Khử nền thông minh: Color-keying với tolerance (mặc định 35) + feather làm mềm viền + flood fill từ biên.
   */
  function cleanImageBackgroundAdvanced(sourceImg, options) {
    if (typeof document === 'undefined') return sourceImg;
    const w = sourceImg.naturalWidth || sourceImg.width;
    const h = sourceImg.naturalHeight || sourceImg.height;
    if (!w || !h) return sourceImg;

    options = options || {};
    const tolerance = options.tolerance !== undefined ? options.tolerance : 35;
    const feather = options.feather !== undefined ? options.feather : 6;
    const mode = options.mode || 'auto'; // 'auto' | 'white' | 'black'

    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    const ctx = cv.getContext('2d');
    ctx.drawImage(sourceImg, 0, 0);

    try {
      const imgData = ctx.getImageData(0, 0, w, h);
      const d = imgData.data;

      // 1. Lấy mẫu màu ở 4 góc ảnh: (0,0), (w-1,0), (0,h-1), (w-1,h-1)
      const corners = [[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1]];
      const cornerColors = [];
      let maxCornerAlpha = 0;
      let avgR = 0, avgG = 0, avgB = 0;
      for (const [cx, cy] of corners) {
        const idx = (cy * w + cx) * 4;
        const a = d[idx + 3];
        if (a > maxCornerAlpha) maxCornerAlpha = a;
        cornerColors.push([d[idx], d[idx + 1], d[idx + 2], a]);
        avgR += d[idx]; avgG += d[idx + 1]; avgB += d[idx + 2];
      }
      avgR /= 4; avgG /= 4; avgB /= 4;

      // Xóa nhiễu alpha mờ đục quanh ảnh (nếu có alpha < 18)
      for (let i = 3; i < d.length; i += 4) {
        if (d[i] > 0 && d[i] < 18) d[i] = 0;
      }

      if (maxCornerAlpha >= 18) {
        const isWhiteBg = mode === 'white' || (mode === 'auto' && avgR > 210 && avgG > 210 && avgB > 210);
        const isDarkBg = mode === 'black' || (mode === 'auto' && avgR < 45 && avgG < 45 && avgB < 45);

        const visited = new Uint8Array(w * h);
        const queue = [];

        // Đẩy toàn bộ pixel viền 4 cạnh vào hàng đợi flood fill
        for (let x = 0; x < w; x++) {
          queue.push(0 * w + x);
          queue.push((h - 1) * w + x);
        }
        for (let y = 0; y < h; y++) {
          queue.push(y * w + 0);
          queue.push(y * w + (w - 1));
        }

        function isBgPixel(r, g, b, a) {
          if (a < 18) return true;
          if (isWhiteBg) {
            return r >= 255 - tolerance && g >= 255 - tolerance && b >= 255 - tolerance;
          }
          if (isDarkBg) {
            return r <= tolerance && g <= tolerance && b <= tolerance;
          }
          for (const [cr, cg, cb, ca] of cornerColors) {
            if (ca < 18) continue;
            if (Math.abs(r - cr) <= tolerance && Math.abs(g - cg) <= tolerance && Math.abs(b - cb) <= tolerance) {
              return true;
            }
          }
          // Nền ô vuông caro xám/trắng
          const isGray = Math.abs(r - g) < 12 && Math.abs(g - b) < 12;
          if (isGray && (r < 60 || r > 195)) {
            for (const [cr] of cornerColors) {
              if (Math.abs(r - cr) <= tolerance + 10) return true;
            }
          }
          return false;
        }

        let head = 0;
        while (head < queue.length) {
          const p = queue[head++];
          if (visited[p]) continue;
          visited[p] = 1;

          const px = p % w;
          const py = Math.floor(p / w);
          const idx = p * 4;
          const r = d[idx], g = d[idx + 1], b = d[idx + 2], a = d[idx + 3];

          if (isBgPixel(r, g, b, a)) {
            d[idx + 3] = 0; // Biến nền thành trong suốt hoàn toàn

            if (px > 0 && !visited[p - 1]) queue.push(p - 1);
            if (px < w - 1 && !visited[p + 1]) queue.push(p + 1);
            if (py > 0 && !visited[p - w]) queue.push(p - w);
            if (py < h - 1 && !visited[p + w]) queue.push(p + w);
          } else if (feather > 0) {
            // Làm mềm viền cho pixel giáp ranh
            let minDiff = 255;
            if (isWhiteBg) minDiff = 255 - Math.min(r, g, b);
            else if (isDarkBg) minDiff = Math.max(r, g, b);
            else {
              for (const [cr, cg, cb] of cornerColors) {
                const diff = Math.max(Math.abs(r - cr), Math.abs(g - cg), Math.abs(b - cb));
                if (diff < minDiff) minDiff = diff;
              }
            }
            if (minDiff > tolerance && minDiff <= tolerance + feather) {
              const factor = (minDiff - tolerance) / feather;
              d[idx + 3] = Math.round(d[idx + 3] * factor);
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
      }
    } catch (e) {}
    return cv;
  }

  function cleanImageBackground(sourceImg) {
    return cleanImageBackgroundAdvanced(sourceImg, { tolerance: 35, feather: 6 });
  }

  function loadSheetImage(sheetKey) {
    if (loadedRawImages[sheetKey]) return loadedRawImages[sheetKey];
    if (typeof Image === 'undefined') return null;

    const img = new Image();
    loadedRawImages[sheetKey] = img;
    const candidates = SHEET_CONFIGS[sheetKey] || [sheetKey, 'assets/' + sheetKey + '.png'];
    let idx = 0;

    img.onload = () => {
      cleanedSheetCanvases[sheetKey] = cleanImageBackground(img);
      for (const k in weaponTrimmedSprites) {
        if (k.startsWith(sheetKey)) delete weaponTrimmedSprites[k];
      }
      if (window.TT && window.TT.Character && window.TT.Character.invalidateSheets) {
        window.TT.Character.invalidateSheets();
      }
    };
    img.onerror = () => {
      idx++;
      if (idx < candidates.length) {
        img.src = candidates[idx];
      }
    };
    img.src = candidates[0];
    return img;
  }

  // Khởi động load trước các file sheet
  for (const k in SHEET_CONFIGS) {
    loadSheetImage(k);
  }

  function getWeaponSprite(skin) {
    if (!skin || (!skin.sheet && !skin.sprite && !skin.customImg && skin.shape !== 'crystal_sword')) {
      return null;
    }
    const id = skin.id || (skin.sheet ? skin.sheet + '_' + (skin.sx || 0) : 'CUSTOM');
    if (weaponTrimmedSprites[id]) {
      return weaponTrimmedSprites[id];
    }

    // 1. Ảnh đơn lẻ (crystal_sword.png hoặc customImg)
    if (skin.sprite && !skin.sheet) {
      let srcImg = skin.customImg;
      if (!srcImg) {
        const sheetName = skin.sprite.includes('crystal_sword') ? 'crystal_sword' : skin.sprite;
        srcImg = loadedRawImages[sheetName] || loadSheetImage(sheetName);
      }
      if (!srcImg || !srcImg.complete || (srcImg.naturalWidth === 0 && srcImg.width === 0)) return null;

      const cleaned = cleanImageBackground(srcImg);
      const entry = {
        canvas: cleaned,
        pivotX: skin.pivotX !== undefined ? skin.pivotX : CRYSTAL_SWORD_PIVOT_X,
        pivotY: skin.pivotY !== undefined ? skin.pivotY : CRYSTAL_SWORD_PIVOT_Y,
        baseAngleOffset: skin.baseAngleOffset !== undefined ? skin.baseAngleOffset : CRYSTAL_SWORD_BASE_ANGLE,
        bladeLen: skin.bladeLen || CRYSTAL_SWORD_BLADE_LEN,
        w: cleaned.width,
        h: cleaned.height
      };
      weaponTrimmedSprites[id] = entry;
      return entry;
    }

    // 2. Sprite Sheet (sheet1, sheet2, sheet3)
    if (skin.sheet) {
      const sheetCanvas = cleanedSheetCanvases[skin.sheet];
      if (!sheetCanvas) {
        loadSheetImage(skin.sheet);
        return null;
      }

      let sx = skin.sx, sy = skin.sy, sw = skin.sw, sh = skin.sh;
      if (sx === undefined && skin.row !== undefined && skin.col !== undefined && skin.rows && skin.cols) {
        const cellW = sheetCanvas.width / skin.cols;
        const cellH = sheetCanvas.height / skin.rows;
        sx = Math.round(skin.col * cellW);
        sy = Math.round(skin.row * cellH);
        sw = Math.round(cellW);
        sh = Math.round(cellH);
      }
      if (sx === undefined) {
        sx = 0; sy = 0; sw = sheetCanvas.width; sh = sheetCanvas.height;
      }

      if (typeof document === 'undefined') {
        const entry = {
          canvas: sheetCanvas,
          pivotX: skin.pivotX !== undefined ? skin.pivotX : 0.5,
          pivotY: skin.pivotY !== undefined ? skin.pivotY : 0.5,
          baseAngleOffset: skin.baseAngleOffset !== undefined ? skin.baseAngleOffset : 0,
          bladeLen: skin.bladeLen || sh,
          w: sw,
          h: sh
        };
        weaponTrimmedSprites[id] = entry;
        return entry;
      }

      // Crop & Auto-trim
      const tempCv = document.createElement('canvas');
      tempCv.width = sw; tempCv.height = sh;
      const tCtx = tempCv.getContext('2d');
      tCtx.drawImage(sheetCanvas, sx, sy, sw, sh, 0, 0, sw, sh);

      let trimX = 0, trimY = 0, trimW = sw, trimH = sh;
      try {
        const imgData = tCtx.getImageData(0, 0, sw, sh);
        const d = imgData.data;
        let minX = sw, maxX = 0, minY = sh, maxY = 0;
        for (let y = 0; y < sh; y++) {
          for (let x = 0; x < sw; x++) {
            if (d[(y * sw + x) * 4 + 3] > 18) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }
        if (minX <= maxX && minY <= maxY) {
          trimX = minX; trimY = minY;
          trimW = maxX - minX + 1;
          trimH = maxY - minY + 1;
        }
      } catch (err) {}

      const trimmedCv = document.createElement('canvas');
      trimmedCv.width = trimW; trimmedCv.height = trimH;
      const trCtx = trimmedCv.getContext('2d');
      trCtx.drawImage(tempCv, trimX, trimY, trimW, trimH, 0, 0, trimW, trimH);

      const defaultBaseAngle = skin.sheet === 'sheet1' ? -Math.PI / 2 : (skin.sheet === 'sheet2' ? 1.8118 : Math.PI / 2);
      const defaultPivotY = skin.sheet === 'sheet1' ? 0.90 : (skin.sheet === 'sheet2' ? 0.08 : 0.09);

      const entry = {
        canvas: trimmedCv,
        pivotX: skin.pivotX !== undefined ? skin.pivotX : 0.50,
        pivotY: skin.pivotY !== undefined ? skin.pivotY : defaultPivotY,
        baseAngleOffset: skin.baseAngleOffset !== undefined ? skin.baseAngleOffset : defaultBaseAngle,
        bladeLen: skin.bladeLen || trimH,
        w: trimW,
        h: trimH
      };
      weaponTrimmedSprites[id] = entry;
      return entry;
    }

    return null;
  }

  function renderSwordSprite(ctx, skinOrImg, x, y, angle, len, alpha, pivotX, pivotY, baseAngle, bladeLen) {
    if (skinOrImg && typeof skinOrImg === 'object' && ('id' in skinOrImg || 'sheet' in skinOrImg || 'shape' in skinOrImg || 'sprite' in skinOrImg)) {
      const sprite = getWeaponSprite(skinOrImg);
      if (!sprite || !sprite.canvas) return false;
      const cv = sprite.canvas;
      const px = cv.width * sprite.pivotX;
      const py = cv.height * sprite.pivotY;
      const scale = (len * 1.15) / sprite.bladeLen;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle - sprite.baseAngleOffset);
      ctx.globalAlpha = alpha === undefined ? 1 : alpha;

      const prevSmooth = ctx.imageSmoothingEnabled;
      const prevQuality = ctx.imageSmoothingQuality;
      ctx.imageSmoothingEnabled = true;
      if ('imageSmoothingQuality' in ctx) ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(cv, -px * scale, -py * scale, cv.width * scale, cv.height * scale);

      ctx.imageSmoothingEnabled = prevSmooth;
      if ('imageSmoothingQuality' in ctx) ctx.imageSmoothingQuality = prevQuality;
      ctx.restore();
      return true;
    }

    const img = skinOrImg;
    if (!img || (img.naturalWidth === 0 && img.width === 0)) return false;
    const imgW = img.naturalWidth || img.width;
    const imgH = img.naturalHeight || img.height;
    const pxRatio = pivotX !== undefined ? pivotX : CRYSTAL_SWORD_PIVOT_X;
    const pyRatio = pivotY !== undefined ? pivotY : CRYSTAL_SWORD_PIVOT_Y;
    const bAngle = baseAngle !== undefined ? baseAngle : CRYSTAL_SWORD_BASE_ANGLE;
    const bLen = bladeLen || (imgH ? imgH * 0.65 : CRYSTAL_SWORD_BLADE_LEN);
    const scale = (len * 1.15) / bLen;
    const px = imgW * pxRatio;
    const py = imgH * pyRatio;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle - bAngle);
    ctx.globalAlpha = alpha === undefined ? 1 : alpha;

    const prevSmooth = ctx.imageSmoothingEnabled;
    const prevQuality = ctx.imageSmoothingQuality;
    ctx.imageSmoothingEnabled = true;
    if ('imageSmoothingQuality' in ctx) ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(img, -px * scale, -py * scale, imgW * scale, imgH * scale);

    ctx.imageSmoothingEnabled = prevSmooth;
    if ('imageSmoothingQuality' in ctx) ctx.imageSmoothingQuality = prevQuality;
    ctx.restore();
    return true;
  }

  function renderCrystalSwordSprite(ctx, x, y, angle, len, alpha) {
    const skin = (window.TT && window.TT.DATA && window.TT.DATA.swordSkins && window.TT.DATA.swordSkins.find(s => s.id === 'BANG_TINH')) || {
      id: 'BANG_TINH', sprite: 'assets/crystal_sword.png', baseAngleOffset: CRYSTAL_SWORD_BASE_ANGLE,
      pivotX: CRYSTAL_SWORD_PIVOT_X, pivotY: CRYSTAL_SWORD_PIVOT_Y, bladeLen: CRYSTAL_SWORD_BLADE_LEN
    };
    return renderSwordSprite(ctx, skin, x, y, angle, len, alpha);
  }

  // ---- HỆ THỐNG LOAD, TÁCH NỀN VÀ CẮT LƯỚI SPRITE NÂNG CAO ----
  const advancedSpriteCache = {};
  const rawImageMap = {};

  function loadAndCleanSprite(src, options, callback) {
    options = options || {};
    const key = src + '_' + (options.rows || 1) + 'x' + (options.cols || 1) + '_' + (options.row !== undefined ? options.row : 'all') + '_' + (options.col !== undefined ? options.col : 'all') + '_' + (options.tolerance || 35) + '_' + (options.mode || 'auto') + '_' + (options.trim !== false);
    if (advancedSpriteCache[key]) {
      if (callback) callback(advancedSpriteCache[key]);
      return advancedSpriteCache[key];
    }

    const res = { canvas: null, w: 0, h: 0, ready: false };
    advancedSpriteCache[key] = res;

    if (typeof document === 'undefined' || typeof Image === 'undefined') {
      return res;
    }

    const candidates = [
      src,
      'assets/' + src,
      'src/tutien/assets/' + src,
      '../assets/' + src,
      '../../src/tutien/assets/' + src
    ];

    function processImg(img) {
      const cleaned = cleanImageBackgroundAdvanced(img, options);
      let finalCanvas = cleaned;
      let finalW = cleaned.width;
      let finalH = cleaned.height;

      if (options.rows && options.cols && options.row !== undefined && options.col !== undefined) {
        const cellW = cleaned.width / options.cols;
        const cellH = cleaned.height / options.rows;
        const sx = Math.round(options.col * cellW);
        const sy = Math.round(options.row * cellH);
        const sw = Math.round(cellW);
        const sh = Math.round(cellH);

        const tempCv = document.createElement('canvas');
        tempCv.width = sw; tempCv.height = sh;
        const tctx = tempCv.getContext('2d');
        tctx.drawImage(cleaned, sx, sy, sw, sh, 0, 0, sw, sh);

        if (options.trim !== false) {
          let minX = sw, maxX = 0, minY = sh, maxY = 0;
          try {
            const idata = tctx.getImageData(0, 0, sw, sh).data;
            for (let y = 0; y < sh; y++) {
              for (let x = 0; x < sw; x++) {
                if (idata[(y * sw + x) * 4 + 3] > 18) {
                  if (x < minX) minX = x;
                  if (x > maxX) maxX = x;
                  if (y < minY) minY = y;
                  if (y > maxY) maxY = y;
                }
              }
            }
          } catch (e) {}

          if (minX <= maxX && minY <= maxY) {
            const tw = maxX - minX + 1;
            const th = maxY - minY + 1;
            const trimCv = document.createElement('canvas');
            trimCv.width = tw; trimCv.height = th;
            trimCv.getContext('2d').drawImage(tempCv, minX, minY, tw, th, 0, 0, tw, th);
            finalCanvas = trimCv;
            finalW = tw;
            finalH = th;
          } else {
            finalCanvas = tempCv;
            finalW = sw;
            finalH = sh;
          }
        } else {
          finalCanvas = tempCv;
          finalW = sw;
          finalH = sh;
        }
      }

      res.canvas = finalCanvas;
      res.w = finalW;
      res.h = finalH;
      res.ready = true;
      if (callback) callback(res);
      if (window.TT && window.TT.Character && window.TT.Character.invalidateSheets) {
        window.TT.Character.invalidateSheets();
      }
    }

    let img = rawImageMap[src];
    if (img && img.complete && (img.naturalWidth > 0 || img.width > 0)) {
      processImg(img);
      return res;
    }

    if (!img) {
      img = new Image();
      rawImageMap[src] = img;
      let idx = 0;
      img.onload = () => processImg(img);
      img.onerror = () => {
        idx++;
        if (idx < candidates.length) {
          img.src = candidates[idx];
        }
      };
      img.src = candidates[0];
    } else {
      const oldOnload = img.onload;
      img.onload = () => {
        if (oldOnload) oldOnload();
        processImg(img);
      };
    }

    return res;
  }

  function getGridSprite(src, rows, cols, row, col, options) {
    return loadAndCleanSprite(src, Object.assign({ rows, cols, row, col }, options));
  }

  function getSkillIcon(col, row, options) {
    return loadAndCleanSprite('skill_icons.png', Object.assign({ rows: 18, cols: 14, row, col, trim: false, tolerance: 35, mode: 'white' }, options));
  }

  function getClanBadge(col, row, options) {
    return loadAndCleanSprite('clan_badges.png', Object.assign({ rows: 2, cols: 5, row, col, trim: true, tolerance: 35, mode: 'white' }, options));
  }

  function getElementBadge(col, row, options) {
    return loadAndCleanSprite('ninja_elements.png', Object.assign({ rows: 2, cols: 5, row, col, trim: true, tolerance: 35, mode: 'white' }, options));
  }

  function getEyeSprite(col, row, options) {
    return loadAndCleanSprite('eyes_grid.png', Object.assign({ rows: 8, cols: 5, row, col, trim: true, tolerance: 35, mode: 'white' }, options));
  }

  function getHaloSprite(idOrIndex, options) {
    if (idOrIndex === 'HALO_CRIMSON_SUN' || idOrIndex === 'crimson_sun' || idOrIndex === 0) {
      return loadAndCleanSprite('halo_crimson_sun.png', Object.assign({ tolerance: 35, mode: 'black' }, options));
    }
    const idx = typeof idOrIndex === 'number' ? idOrIndex - 1 : parseInt(String(idOrIndex).replace(/[^0-9]/g, ''), 10) - 1 || 0;
    const col = Math.max(0, idx % 3);
    const row = Math.max(0, Math.min(3, Math.floor(idx / 3)));
    return loadAndCleanSprite('halos_grid.png', Object.assign({ rows: 4, cols: 3, row, col, tolerance: 35, mode: 'black' }, options));
  }

  function getWingsSprite(idOrIndex, options) {
    const isGolden = idOrIndex === 'WINGS_GOLDEN_DAWN' || idOrIndex === 1 || idOrIndex === 'golden';
    const row = isGolden ? 1 : 0;
    return loadAndCleanSprite('wings_pair.png', Object.assign({ rows: 2, cols: 1, row, col: 0, tolerance: 35, mode: 'black' }, options));
  }

  const AVATAR_FILES = {
    AVATAR_URANOS: 'skin_uranos.png',
    AVATAR_COSMIC: 'skin_cosmic.png',
    AVATAR_PRISM: 'skin_prism.png',
    AVATAR_WATER_DRAGON: 'skin_water_dragon.png',
    AVATAR_WHITE_PURPLE: 'skin_white_purple.png',
    AVATAR_CHAOS_TRINITY: 'skin_chaos_trinity.png',
    AVATAR_RIKAMU: 'skin_rikami.png',
    AVATAR_NETHER_EMPRESS: 'skin_nether_empress.png',
    AVATAR_WINGED_SERAPH: 'skin_winged_seraph.png'
  };

  function getAvatarSprite(avatarId, options) {
    const file = AVATAR_FILES[avatarId] || (avatarId && (avatarId.endsWith('.png') || avatarId.endsWith('.jpg')) ? avatarId : 'skin_uranos.png');
    return loadAndCleanSprite(file, Object.assign({ tolerance: 30, mode: 'black' }, options));
  }

  const MONSTER_FILES = {
    CUU_VI_THIEN_HO: 'boss_fox.png',
    LOI_DINH_CU_SA: 'boss_shark.png',
    HAC_AM_CU_HUNG: 'boss_bear.png',
    HAN_BANG_CU_MA: 'boss_golem.png',
    HU_KHONG_AM_LONG: 'boss_void_dragon.png',
    HAC_ANH_TU_THAN: 'shadow_reaper.png',
    HAC_ANH_KIEM_SI: 'shadow_swordsman.png',
    BACH_COT_THICH_KHACH: 'shadow_assassin.png',
    HU_KHONG_U_HON: 'shadow_wraith.png',
    TOA_LIEM_MA_QUAN: 'shadow_chain_lord.png',
    HAC_DA_THONG_SOAI: 'boss_shadow_general.png',
    MONSTER_SCORPION: 'monster_scorpion.png',
    NHAT_THUC_THAN_CAM: 'boss_solar_eclipse.png',
    BANG_LINH_THAN_THU: 'boss_ice_phoenix.png',
    KIM_SUNG_THIEN_LONG: 'boss_nether_dragon.png',
    MONSTER_LIGHTNING: 'monster_lightning_frost.png',
    MONSTER_FLAME: 'monster_flame_spikes.png'
  };

  function getMonsterSprite(monsterId, options) {
    const file = MONSTER_FILES[monsterId] || (monsterId && (monsterId.endsWith('.jpg') || monsterId.endsWith('.png')) ? monsterId : null);
    if (!file) return null;
    return loadAndCleanSprite(file, Object.assign({ tolerance: 35, mode: 'black' }, options));
  }

  function drawHalo(ctx, x, y, radius, t, haloId, color) {
    const sp = getHaloSprite(haloId || 'HALO_CRIMSON_SUN');
    if (!sp || !sp.canvas) return false;
    const def = ((TT.DATA && TT.DATA.halos) || []).find(h => h.id === haloId);
    // mặc định thần luân đứng yên (chỉ phập phồng, rực sáng); muốn xoay thì đặt spin > 0 trong D.halos
    const spin = def && typeof def.spin === 'number' ? def.spin : 0;
    ctx.save();
    ctx.translate(x, y);
    if (spin) ctx.rotate(t * spin);
    const pulse = 1 + Math.sin(t * 3.2) * 0.05;
    ctx.scale(pulse, pulse);
    const size = radius * 2.2;
    if (color && Art.glow) {
      Art.glow(ctx, 0, 0, radius * 1.2, color, 0.35 + Math.sin(t * 4) * 0.1);
    }
    ctx.drawImage(sp.canvas, -size / 2, -size / 2, size, size);
    ctx.restore();
    return true;
  }

  // Ảnh cánh đã tách nền sẵn (không qua bộ lọc nền lúc chạy, vì lọc 'black' ăn mất lông vũ tối màu).
  const plainImages = {};
  function plainImage(src) {
    if (plainImages[src]) return plainImages[src];
    const rec = { img: null, ready: false };
    plainImages[src] = rec;
    if (typeof Image === 'undefined') return rec;
    const candidates = ['assets/' + src, 'src/tutien/assets/' + src, '../assets/' + src, src];
    let idx = 0;
    const img = new Image();
    img.onload = () => { rec.img = img; rec.ready = true; };
    img.onerror = () => { if (++idx < candidates.length) img.src = candidates[idx]; };
    img.src = candidates[0];
    return rec;
  }

  /**
   * Cặp cánh sau lưng, cùng chỗ với thần luân (tâm ~ (x, y)).
   * Mỗi cánh xoay quanh gốc ở giữa lưng để đập cánh; di chuyển/lướt thì đập nhanh và mạnh hơn.
   * opts: { dir: 'down'|'up'|'side', flip: 1|-1, moving, dash, color }
   *  - 'down' (nhìn thẳng): cánh xoè hai bên, vẽ trước thân (người gọi vẽ thân đè lên).
   *  - 'up'   (quay lưng):  cánh phủ lên lưng (người gọi vẽ sau thân).
   *  - 'side' (nhìn nghiêng): cánh thu hẹp, lệch về phía sau lưng.
   */
  function drawWings(ctx, x, y, width, t, wingId, opts) {
    opts = opts || {};
    const list = (TT.DATA && TT.DATA.wings) || [];
    const def = list.find(w => w.id === wingId) || list[0];
    if (!def || !def.file) return false;
    const rec = plainImage(def.file);
    if (!rec.ready) return false;
    const img = rec.img, iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    const half = Math.floor(iw / 2);
    const h = width * ih / iw, hw = width / 2;
    const rootY = (def.rootY || 0.5) * h;
    const speed = opts.dash ? 9 : opts.moving ? 6 : 3;
    const amp = opts.dash ? 0.05 : opts.moving ? 0.16 : 0.1;
    const flap = Math.sin(t * speed) * amp;
    const dir = opts.dir || 'down';

    ctx.save();
    ctx.translate(x, y);
    if (def.color) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      Art.glow(ctx, 0, 0, width * 0.45, def.color, 0.16 + Math.sin(t * 2.4) * 0.05);
      ctx.restore();
    }
    if (dir === 'side') {
      // góc ngang là thế 3/4: cánh vẫn xoè hai bên, ép nhẹ và lệch về phía sau lưng
      ctx.translate(-(opts.flip || 1) * width * 0.06, 0);
      ctx.scale((opts.flip || 1) * 0.8, 1);
    }
    // dash: cánh khép về sau
    const fold = opts.dash ? 0.25 : 0;
    // cánh trái (nửa trái ảnh), gốc ở mép phải của nửa
    ctx.save();
    ctx.rotate(-flap - fold);
    ctx.drawImage(img, 0, 0, half, ih, -hw, -rootY, hw, h);
    ctx.restore();
    // cánh phải
    ctx.save();
    ctx.rotate(flap + fold);
    ctx.drawImage(img, half, 0, iw - half, ih, 0, -rootY, hw, h);
    ctx.restore();
    ctx.restore();
    return true;
  }

  function drawAvatar(ctx, x, y, width, height, avatarId, t, flip) {
    const sp = getAvatarSprite(avatarId);
    if (!sp || !sp.canvas) return false;
    ctx.save();
    ctx.translate(x, y);
    if (flip) ctx.scale(-1, 1);
    const bob = Math.sin(t * 2.5) * 2.5;
    ctx.drawImage(sp.canvas, -width / 2, -height + 14 + bob, width, height);
    ctx.restore();
    return true;
  }

  function drawEyes(ctx, x, y, width, height, eyeId, t, flip) {
    let col = 0, row = 0;
    if (typeof eyeId === 'object' && eyeId !== null) {
      col = eyeId.col || 0; row = eyeId.row || 0;
    } else if (typeof eyeId === 'number') {
      col = eyeId % 5; row = Math.floor(eyeId / 5);
    } else if (typeof eyeId === 'string') {
      const num = parseInt(eyeId.replace(/[^0-9]/g, ''), 10) || 0;
      col = num % 5; row = Math.floor(num / 5);
    }
    const sp = getEyeSprite(col, row);
    if (!sp || !sp.canvas) return false;
    ctx.save();
    ctx.translate(x, y);
    if (flip) ctx.scale(-1, 1);
    ctx.drawImage(sp.canvas, -width / 2, -height / 2, width, height);
    ctx.restore();
    return true;
  }

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
    drawSword(ctx, x, y, angle, len, color, alpha, skin, t, moveState) {
      const isSpriteSword = skin && (skin.sheet || skin.sprite || skin.customImg || skin.shape === 'crystal_sword' || skin.id === 'BANG_TINH' || skin.shape === 'sprite');
      if (isSpriteSword) {
        let bob = 0;
        if (t !== undefined) {
          const isWalk = moveState === 'walk' || moveState === true;
          const freq = isWalk ? 10 : 3.5;
          const amp = isWalk ? 2.5 : 1.2;
          bob = Math.sin(t * freq) * amp;
        }
        const bx = -Math.sin(angle) * bob;
        const by = Math.cos(angle) * bob;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const glowCol = skin.glowColor || (skin.pal && (skin.pal.gem || skin.pal.gold)) || color || '#7fe3ff';
        Art.glow(ctx, x + bx + Math.cos(angle) * len * 0.45, y + by + Math.sin(angle) * len * 0.45, len * 0.75, glowCol, 0.35);
        ctx.globalCompositeOperation = 'source-over';
        const drawn = renderSwordSprite(ctx, skin, x + bx, y + by, angle, len, alpha);
        ctx.restore();
        if (drawn) return;
      }
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

  Art.crystalSwordImg = loadedRawImages.crystal_sword;
  Art.drawSectAura = drawSectAura;
  Art.loadedRawImages = loadedRawImages;
  Art.cleanedSheetCanvases = cleanedSheetCanvases;
  Art.weaponTrimmedSprites = weaponTrimmedSprites;
  Art.cleanImageBackground = cleanImageBackground;
  Art.cleanImageBackgroundAdvanced = cleanImageBackgroundAdvanced;
  Art.getWeaponSprite = getWeaponSprite;
  Art.renderSwordSprite = renderSwordSprite;
  Art.renderCrystalSwordSprite = renderCrystalSwordSprite;
  Art.CRYSTAL_SWORD_BASE_ANGLE = CRYSTAL_SWORD_BASE_ANGLE;
  Art.CRYSTAL_SWORD_PIVOT_X = CRYSTAL_SWORD_PIVOT_X;
  Art.CRYSTAL_SWORD_PIVOT_Y = CRYSTAL_SWORD_PIVOT_Y;
  Art.CRYSTAL_SWORD_BLADE_LEN = CRYSTAL_SWORD_BLADE_LEN;

  Art.loadAndCleanSprite = loadAndCleanSprite;
  Art.getGridSprite = getGridSprite;
  Art.getSkillIcon = getSkillIcon;
  Art.getClanBadge = getClanBadge;
  Art.getElementBadge = getElementBadge;
  Art.getEyeSprite = getEyeSprite;
  Art.getHaloSprite = getHaloSprite;
  Art.getWingsSprite = getWingsSprite;
  Art.getAvatarSprite = getAvatarSprite;
  Art.getMonsterSprite = getMonsterSprite;
  Art.drawHalo = drawHalo;
  Art.drawWings = drawWings;
  Art.drawAvatar = drawAvatar;
  Art.drawEyes = drawEyes;

  TT.Art = Art;
})(window.TT);
