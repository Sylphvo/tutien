# Ngự Kiếm Độ Kiếp — Prototype HTML5

Bản chơi được của GDD `tailieugame.md`. Chạy trực tiếp trên trình duyệt, không cần cài engine.

## Chạy game
Mở `src/tutien/index.html` bằng Edge/Chrome (double-click là được). Tiến trình tự lưu vào `localStorage`.

## Cấu trúc
| File | Nội dung |
| --- | --- |
| `js/data.js` | Toàn bộ số liệu cân bằng: affix pool (GDD 4.1), phẩm chất, Tier weight, cảnh giới, Lôi Kiếp, yêu thú, công thức đan |
| `js/items.js` | Sinh trang bị, túi đồ xếp chồng, dịch vụ Tẩy Luyện (port `AffixRerollService`) |
| `js/state.js` | Tiến trình nhân vật, chỉ số, Cộng Hưởng Ngũ Hành, lưu/tải |
| `js/game.js` | Vòng lặp, Động Phủ / Bí Cảnh / Lôi Đài, Ngự Kiếm, AI, Độ Kiếp, ánh sáng |
| `js/art.js` | Đồ họa vẽ thủ tục (nền, yêu thú, phi kiếm, tia sét, icon) |
| `js/environment.js` | Công trình Tông Môn, đạo cụ 3 vùng Bí Cảnh, vật phẩm thu thập, nền đất. Art bible: `design/art/environment-art-bible.md` |
| `js/monsters.js` | 5 loài yêu thú vẽ tay, dải 6 frame mỗi loài. Xem tất cả nhân vật ở `gallery.html` |
| `js/character.js` | Nhân vật kiếm tu: sprite sheet 5 hoạt cảnh × 3 hướng + lớp linh khí. Xem trước và tải PNG ở `tests/tutien/sprite_preview.html` |
| `js/ui.js` | HUD và các màn hình theo wireframe GDD mục 5 |

## Khác biệt so với code mẫu trong GDD
- Thần Khí được phép 2 dòng Unique và Tier tối thiểu là 2 (code mẫu chỉ cho 1 Unique và không có Tier sàn).
- Tier được quay trước, rồi chỉ chọn từ tố có range cho Tier đó. Code mẫu fallback `TierRanges.Last()` khiến Unique ở Tier 1 nhận giá trị Tier 5.
- Linh Vận: lần tẩy luyện khi điểm đã đạt 100 sẽ ép T5 rồi reset về 0.

## Kiểm thử
`node tests/tutien/logic.test.js` kiểm tra sinh từ tố, khóa dòng, Linh Vận, chi phí, Cộng Hưởng, túi đồ, công thức sát thương Lôi Kiếp.
`tests/tutien/smoke.js` là kịch bản chơi tự động cho trình duyệt headless (chèn vào bản sao của `index.html`, gán `window.__game`).
