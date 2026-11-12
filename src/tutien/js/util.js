window.TT = window.TT || {};

/**
 * TT.util — hàm tiện ích dùng chung (random, toán học, định dạng số).
 */
(function (TT) {
  'use strict';
  let uidCounter = 0;

  TT.util = {
    /** Số thực ngẫu nhiên trong [a, b). */
    rand(a, b) { return a + Math.random() * (b - a); },
    /** Số nguyên ngẫu nhiên trong [a, b] (bao gồm 2 đầu). */
    randInt(a, b) { return Math.floor(a + Math.random() * (b - a + 1)); },
    /** Chọn ngẫu nhiên 1 phần tử. */
    pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
    /** Chọn theo trọng số. weightFn(item) trả về trọng số >= 0. */
    weighted(list, weightFn) {
      let total = 0;
      for (const x of list) total += weightFn(x);
      let r = Math.random() * total;
      for (const x of list) { r -= weightFn(x); if (r < 0) return x; }
      return list[list.length - 1];
    },
    clamp(v, a, b) { return v < a ? a : v > b ? b : v; },
    lerp(a, b, t) { return a + (b - a) * t; },
    dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); },
    /** Định dạng số nguyên kiểu Việt Nam (1.200). */
    fmt(n) { return Math.round(n).toLocaleString('vi-VN'); },
    /** Làm tròn 1 chữ số thập phân. */
    fmt1(n) { return String(Math.round(n * 10) / 10); },
    /** Sinh ID duy nhất cho vật phẩm. */
    uid() { return 'u' + Date.now().toString(36) + (uidCounter++).toString(36) + Math.floor(Math.random() * 1e6).toString(36); },
    /** RNG có seed (LCG) để sinh bản đồ cố định. */
    seeded(seed) {
      let s = seed >>> 0;
      return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
    },
    /** Escape chuỗi trước khi chèn vào innerHTML. */
    esc(s) {
      return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }
  };
})(window.TT);
