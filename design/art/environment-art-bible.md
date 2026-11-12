# Art Bible — Môi trường, Tông Môn, Bí Cảnh, Vật phẩm, Y phục

Tài liệu đi kèm `tailieugame.md`. Mọi mục dưới đây đã có bản vẽ thủ tục trong game
(`src/tutien/js/environment.js`, `character.js`), số liệu bố cục nằm trong `src/tutien/js/data.js`.
Họa sĩ có thể dùng tài liệu này làm brief để vẽ lại bằng tay và thay thế từng sprite.

## 1. Ngôn ngữ hình ảnh chung

| Hạng mục | Quy tắc |
| --- | --- |
| Nét | Viền mực mảnh màu `#16201F` (không dùng đen tuyền), dày 1.5–2px ở tỷ lệ game. Chi tiết nhỏ (hoa văn, ngói) dùng nét 1px không viền. |
| Tô màu | Chuyển sắc tuyến tính 3 nấc: sáng (trên-trái) → trung → tối (dưới-phải). Nguồn sáng chính luôn từ trên-trái. |
| Điểm nhấn | Vàng chạm `#E9B44C` / sáng `#FFE39A` / tối `#9A6A1E`; ngọc bích `#4FAE94` / `#22705D`; đỏ son cột `#DC4A3E` → `#5A1010`. |
| Phối cảnh | Top-down chếch 3/4: mặt trước công trình nhìn thẳng, mặt đất trải phẳng. Gốc mọi sprite = giữa chân, sắp lớp theo y. |
| Bóng | Elip mờ `rgba(0,0,0,.35)` dưới chân, rộng ≈ 1/3 bề ngang sprite. |
| Ánh sáng động | Đèn, tinh thể, dung nham "khoét" lớp tối (light map) và cộng sáng (additive) màu riêng. |
| Tỷ lệ | 1m = 32px. Nhân vật cao ≈ 2m (64px). Chính Điện rộng 13m, cao 10m. |

### Bảng màu theo không gian

| Không gian | Nền | Phụ | Nhấn | Sương | Độ tối |
| --- | --- | --- | --- | --- | --- |
| Tông Môn (ban ngày) | Cỏ `#2B4636` | Đá lát `#8C9A90` | Vàng chạm, đỏ son, ngọc | `#2A4A40` | 0.16 |
| Linh Mộc Lâm | Rêu `#1F3328` | Lá mục `#8C5A28` | Lam ngọc phát quang `#4FE0C8` | `#16343A` | 0.36 |
| Hỏa Diệm Cốc | Đá bazan `#3A2A26` | Tro `#8C8282` | Dung nham `#FF6A1A` → `#FFD27A` | `#3A1A10` | 0.32 |
| Huyền Băng Động | Băng `#6F8AA0` | Tuyết `#FFFFFF` | Lam băng `#9FE0FF` | `#4A6A8A` | 0.30 |
| Lôi Đài (Độ Kiếp) | Đá tím `#2A2940` | Phù văn `#B48CFF` | Sét `#C9A4FF` | `#3A2A6A` | 0.36 |

## 2. Tông Môn — Thiên Kiếm Tông (bản đồ chính 66×66m)

Bố cục đối xứng theo trục Bắc–Nam, đúng phong thủy "tọa Bắc hướng Nam":
Sơn Môn (Nam) → đường thần đạo có thạch đăng → quảng trường luyện võ → Chính Điện (Bắc).
Hai cánh Đông–Tây là Tàng Kinh Các / Đan Phòng (hàng trên) và Kiếm Các / Lôi Đài (hàng dưới).
Vành ngoài là rừng tùng xen trúc, che mép bản đồ.

```
                 [đào]  ═══ THIÊN KIẾM ĐIỆN ═══  [đào]          ao sen
   trúc          cờ "劍"   sư tử  lư hương  sư tử   cờ "道"
 TÀNG KINH CÁC  ══════════════ đường ngang ══════════════  ĐAN PHÒNG
   thạch đăng                (  quảng trường  )                thạch đăng
 [đào]                       ( trận pháp vàng )                     [đào]
 KIẾM CÁC ════                     ║                    ════ LÔI ĐÀI
     đá rêu      thạch đăng ×4     ║     thạch đăng ×4      đá rêu
 ao sen   lan can đỏ               ║               lan can đỏ
          cờ "天"  sư tử  ══ SƠN MÔN 天劍宗 ══  sư tử  cờ "宗"
                 (vành rừng tùng – trúc bao quanh)
```

### 2.1 Công trình

| Công trình | Kích thước | Chi tiết tạo hình | Chức năng (E) |
| --- | --- | --- | --- |
| **Thiên Kiếm Điện** (Chính Điện) | 13 × 10m | Bệ đá ngọc 2 bậc có bậc thềm giữa; 5 gian, gian giữa là cửa gỗ mun đóng đinh vàng 4 hàng + 2 vòng cửa; 4 gian bên là song cửa ô trám màu gỗ hương; 6 cột son đầu cột thếp vàng; xà thải hoạ lam ngọc–vàng; **mái lưu ly vàng 2 tầng (trùng thiềm)** đầu đao vểnh, bờ nóc có si vẫn hai đầu và ngọc minh châu lửa ở giữa; biển "天劍殿" nền lam viền vàng. | Động Phủ: tu vi, lưu, chơi lại |
| **Tàng Kinh Các** | 5 × 10m | Tháp 3 tầng thu nhỏ dần, mỗi tầng 3 ô cửa vòm song gỗ, cột son 2 góc, xà thải hoạ, mái ngói lam ngọc; chóp tháp là trụ vàng 5 vòng tròn + ngọc đỉnh; biển "藏經閣". | Mở Đạo Pháp (trợ giúp) |
| **Đan Phòng** | 7 × 7m | Điện 3 gian mái ngói **đá xám lam** (khác màu để dễ nhận), ống khói gạch nung bên phải mái **liên tục nhả khói** trắng xám; biển "丹房". | Luyện Đan |
| **Kiếm Các** | 6 × 6.5m | Đình mở, lòng đình tối; giữa đình là giá đá cắm 5 thanh kiếm thép sáng (chuôi đỏ, cán vàng) cao thấp xen kẽ, **phát quang lam**; mái lam ngọc; biển "劍閣". | Y Phục (skin) |
| **Lôi Đài** | 6.5 × 4.5m | Bệ đá tím 3 tầng hình elip; mặt đài khắc vòng phù văn và chữ "雷" phát sáng tím; 4 cột thu lôi đồng, đầu cột là tia sét vàng xoắn. | Chuẩn bị Độ Kiếp |
| **Sơn Môn** | 12 × 8m | Bài lâu 3 gian 4 cột: 2 cột chính cao, 2 cột phụ thấp, chân cột đá; xà đôi thải hoạ; biển lớn "天劍宗"; mái chính lam ngọc + 2 mái phụ hai bên. Đi xuyên qua được giữa 2 cột chính. | Chọn Bí Cảnh |

### 2.2 Đạo cụ trang trí

| Đạo cụ | Mô tả | Hiệu ứng động |
| --- | --- | --- |
| Thạch đăng | Đèn đá 5 khối: đế – trụ – khay – hộp đèn – mái đá – núm; rêu đọng trên mái. | Lửa trong hộp đèn chập chờn (2 tần số), toả sáng ấm `#FFB347` bán kính 2.8m. |
| Thạch sư | Sư tử đá ngồi trên đế, bờm 11 lọn xoăn, chân trước đè cầu, rêu loang. Đặt thành cặp đối xứng (bản lật). | — |
| Lư hương | Đỉnh đồng 3 chân, thân bầu có dải vàng chấm hạt, 2 tai, 3 nén hương. | Khói hương mảnh bay lên, nở dần rồi tan. |
| Tùng | Thân xoắn vỏ nâu sẫm, 6 tán lá dạng "mây" (3 lớp đậm → nhạt, sáng phía trên-trái). 3 biến thể. | — |
| Đào hoa | Thân nâu tía, tán hồng phấn – trắng ngà xen lá xanh. 3 biến thể. | Cánh đào rơi xoay theo gió. |
| Trúc | Cụm 6 cây, đốt sẫm, lá nhọn từng chùm ở ngọn. 3 biến thể. | — |
| Đá rêu | Tảng đá ngọc lục góc cạnh, mảng rêu trên đỉnh. | — |
| Lan can | Lan can son 3 trụ, đầu trụ cầu vàng, song tiện thưa. | — |
| Cờ phướn | Cột gỗ, đầu cầu vàng, cờ đỏ son viền vàng in chữ "劍/道/天/宗". | Vải cờ uốn sóng theo gió, biên độ tăng dần về đuôi. |
| Ao sen | Bờ đá ngọc elip, nước lam ngọc sâu dần ra mép, lá sen có khía, sen hồng nhụy vàng. | Gợn nước lan tròn. |
| Bụi hoa | Bụi lá xanh điểm hoa hồng, vàng, tím, cam. 4 biến thể. | — |
| Quảng trường | Lát đá vòng đồng tâm, viền vàng; trận pháp ngũ giác vàng xoay chậm ở giữa. | Phù văn xoay. |
| Đường lát | Đá phiến so le 30×22px, mỗi phiến sáng tối khác nhau, rêu mọc kẽ, viền đường tối. | — |

## 3. Bí Cảnh — 3 vùng (70×70m, sinh ngẫu nhiên mỗi lần vào)

Mỗi vùng có nền riêng, bộ đạo cụ riêng, hạt môi trường riêng, tỷ lệ yêu thú riêng,
và rơi trang bị theo hệ Ngũ Hành của vùng (giúp ghép Cộng Hưởng).

### 3.1 Linh Mộc Lâm (hệ Mộc)
- **Cảm giác:** rừng nguyên sinh vạn năm, âm u mát lạnh, ánh lam ngọc lấp lánh như đom đóm.
- **Nền:** rêu xanh thẫm loang lổ, lá mục cam nâu rải rác, rễ cây bò ngang, chấm rêu phát quang.
- **Đạo cụ:**
  - *Cổ thụ vạn năm* (cao 10m): rễ bạnh 4 hướng, thân to vỏ sần, 6 tán lá khổng lồ, dây leo rủ xuống, chấm sáng trong tán; nhả **bào tử phát quang**.
  - *Nấm linh*: cụm 3 nấm mũ lam ngọc chấm trắng, **tự phát sáng** — nguồn sáng chính của rừng.
  - *Dương xỉ*: 7 tàu lá xòe hình quạt.
  - *Trụ phế tích*: cột đá ngọc gãy, khía dọc, chữ "靈" mờ, rêu và dây leo quấn.
  - *Bia đá cổ*: bia đầu tròn, khắc chữ dọc, vết nứt chạy chéo.
  - *Đá rêu*.
- **Hạt môi trường:** đom đóm lam ngọc bay lên chậm.
- **Yêu thú ưu tiên:** Độc Trùng (45%).

### 3.2 Hỏa Diệm Cốc (hệ Hỏa)
- **Cảm giác:** thung lũng núi lửa ngột ngạt, mặt đất nứt toác rỉ dung nham, trời đầy tàn lửa.
- **Nền:** bazan nâu đen, tro xám lấm tấm, **khe dung nham** 3 lớp (quầng đỏ mờ – lõi cam – tim vàng), mỗi khe là một nguồn sáng.
- **Đạo cụ:**
  - *Gai hắc diệu thạch*: 5 mũi đá đen bóng nghiêng, mép phải viền sáng cam do dung nham hắt lên.
  - *Hỏa tinh*: cụm tinh thể đỏ cam lõi trắng, sáng mạnh.
  - *Cây cháy*: thân than đen, cành khẳng khiu, đốm than hồng.
  - *Hồ dung nham*: bờ đá nguội, lòng dung nham chuyển vàng → cam → đỏ, vảy nguội trôi; **bong bóng sôi** và quầng sáng thở.
  - *Khe phun lửa*: miệng nứt nhả **tàn lửa** bay vọt lên.
- **Hạt môi trường:** tàn lửa cam bốc nhanh.
- **Yêu thú ưu tiên:** Quỷ Hỏa (45%).

### 3.3 Huyền Băng Động (hệ Thủy)
- **Cảm giác:** hang băng tĩnh lặng, ánh sáng lạnh khuếch tán, tuyết rơi lất phất.
- **Nền:** băng lam xám, vân băng trắng phân nhánh, tuyết rắc.
- **Đạo cụ:**
  - *Băng tinh*: cụm 4 tinh thể lam nhạt viền trắng, sáng nhẹ.
  - *Trụ đá đóng băng*: cột đá xám bọc khối băng trong suốt, cột băng nhỏ rủ từ đỉnh.
  - *Đống tuyết*: gò tuyết trắng ngả lam.
  - **Cổ kiếm phong ấn** (điểm nhấn hiếm, cao 6.5m): khối băng trong suốt, bên trong là thanh cự kiếm lưỡi bạc, kiếm cách vàng cong, chuôi đỏ quấn chỉ vàng nhô khỏi đỉnh băng.
- **Hạt môi trường:** tuyết trắng rơi xuống.
- **Yêu thú ưu tiên:** Hắc Lang và Thạch Ma (35% mỗi loại).

## 4. Vật phẩm Bí Cảnh (thu thập bằng E)

| Vật phẩm | Tạo hình | Biến thể theo vùng | Phần thưởng |
| --- | --- | --- | --- |
| **Linh thảo** | 6 lá xòe, hoa 5 cánh nhụy vàng, lấp lánh hạt sáng bay lên. | Linh Mộc: lá xanh hoa trắng · Huyền Băng: Băng Tâm Hoa lam trắng · Hỏa Diệm: Hỏa Linh Chi (nấm linh chi đỏ cam). | Linh Thảo / Băng Tâm Hoa / Yêu Đan |
| **Khoáng mạch** | Tảng đá xám có cụm tinh thể và vân sáng. | Lục (Mộc) · Cam (Hỏa) · Lam (Băng). | Huyền Thiết, Tẩy Luyện Thạch, Định Hồn Châu |
| **Bảo rương** | Rương gỗ son, 2 đai vàng, khóa vàng, nắp vòm. Mở xong: nắp bật ngửa, lòng rương sáng vàng. | — | 1 trang bị (Linh Khí–Thần Khí) **hệ của vùng**, Linh Thạch, 25% Định Hồn Châu |
| **Linh Tuyền** | Giếng đá ngọc viền 6 viên đá, nước lam ngọc phát sáng, gợn tròn. Dùng xong: nước cạn xám. | — | Hồi đầy HP/MP, Đan độc −10 |

## 5. Nhân vật chính & Y phục (skin) — mua tại Kiếm Các

**Phong cách nhân vật (áp dụng cho kiếm tu và mọi NPC):** anime chibi, đầu to ≈ 45% chiều cao, mắt to có
2 chấm sáng và mi trên đậm, tóc dài bồng bềnh xẻ nhiều lọn nhọn bay theo gió, một lọn tóc dựng trên đỉnh,
mái xéo che một phần mắt phải. Áo khoác dài mở vạt, cổ lông trắng xù, áo trong trắng, nơ ở ngực,
2 dải ruy băng bay sau eo, tất trắng và bốt đen. Kiếm tu cầm trường kiếm chéo xuống; khi phóng kiếm thì giơ
kiếm lên trời. Tô màu cel-shading, viền mực tím than mảnh `#262030`.
Sprite sheet 5 hoạt cảnh × 3 hướng; skin thay bảng màu áo, viền, tóc, mắt. Lớp linh khí theo hệ Pháp Bảo.

| Skin | Giá | Yêu cầu | Màu chủ đạo | Ý tưởng |
| --- | --- | --- | --- | --- |
| Thanh Vân Kiếm Khách | Miễn phí | — | Áo khoác lam đậm · tóc ngọc bích · ruy băng lam · vương miện vàng | Đồng phục đệ tử Thiên Kiếm Tông (theo hình mẫu). |
| Huyền Y Dạ Hành | 800 | — | Áo xám than viền đỏ thẫm · tóc đen | Ám vệ tông môn, hành tẩu đêm. |
| Xích Diễm Chiến Bào | 1.500 | Trúc Cơ | Đỏ son viền vàng kim · tóc đỏ lửa | Tơ Hỏa Tàm của Hỏa Diệm Cốc. |
| Băng Tâm Tiên Y | 2.500 | Trúc Cơ | Lam nhạt · **tóc bạch kim** · mắt lam | Truyền nhân Huyền Băng. |
| Tử Hà Thần Bào | 5.000 | Kim Đan | Tím sẫm · tóc tím oải hương · mắt tím | Thần bào phủ ráng chiều. |

## 6. Yêu thú (`src/tutien/js/monsters.js`)

Cùng nét vẽ tay với kiếm tu. Mỗi loài có dải 6 frame chuyển động, chớp trắng khi trúng đòn,
mắt phát sáng và hào quang vẽ lúc chạy.

| Loài | Tạo hình | Chuyển động | Ánh sáng |
| --- | --- | --- | --- |
| Hắc Lang | Sói lông xám than ánh lam, bờm gai dọc sống lưng, đuôi bông, mõm hé lộ nanh, mắt đỏ xếch có đồng tử dọc. | Phi 4 chân so le, đuôi vẫy, hàm khép mở. | Mắt đỏ `#FF3B3B`. |
| Độc Trùng | Rết 6 đốt vỏ lục bóng, mỗi đốt 2 đốm vàng chanh, đuôi 2 kim, càng hàm vàng ngà, 2 râu dài. | Thân uốn sóng, chân đạp lần lượt, râu rung. | Mắt vàng chanh. |
| Quỷ Hỏa | Ngọn lửa 3 lớp (đỏ thẫm – cam – vàng), lõi đầu lâu tím đen, hốc mắt cam, miệng răng cưa, 3 tàn lửa bay quanh. | Lơ lửng nhấp nhô, lưỡi lửa liếm thay hình. | Hào quang cam toả quanh thân. |
| Thạch Ma | Khối đá xếp chồng (thân, vai, đầu, 2 nắm đấm), vân linh khí lam chạy trên ngực và vòng ấn giữa ngực, rêu trên vai. | Bước nặng nề, nắm đấm đung đưa ngược nhịp chân. | Vân và mắt lam `#5FF0FF`. |
| Huyết Lang Vương | Thân sói khổng lồ lông đỏ máu, bờm gai xương trắng ngà, 2 cặp sừng cong, sẹo đỏ trên sườn, mắt vàng. | Như Hắc Lang; khi lao húc chạy nhanh gấp đôi. | Hào quang đỏ; trước khi húc có quầng đỏ nhấp nháy báo hiệu. |

### 6.1 Yêu thú theo vùng (bổ sung)

| Loài | Vùng | Tạo hình | Lối đánh |
| --- | --- | --- | --- |
| Mộc Yêu | Linh Mộc Lâm | Thân cây non vỏ nâu, mặt là hốc cây (2 mắt lục phát sáng, miệng răng cưa), 4 rễ bò làm chân, tán lá trên đầu, cành gai làm tay. | Cận chiến, chậm, trâu. |
| Độc Chu | Linh Mộc Lâm | Nhện bụng tím đen có vân đầu lâu đỏ, 8 chân đốt, cụm 4 mắt đỏ, nanh vàng ngà. | Giữ 5m, phun tơ làm chậm 45%. |
| Hỏa Tích | Hỏa Diệm Cốc | Thằn lằn lửa thân đỏ cam sọc tối, bụng vàng, hàng gai lửa trên lưng, chóp đuôi bốc cháy. | Đi theo cặp, chạy rất nhanh. |
| Băng Hồ | Huyền Băng Động | Cáo tuyết trắng ánh lam, tai nhọn, vạch lam dưới mắt, băng tinh hình thoi trên trán. | Giữ 5.5m, bắn băng tiễn làm chậm 35%. |
| Tuyết Viên | Huyền Băng Động | Vượn tuyết lông trắng xù, mặt xám lam, tay dài chạm đất, nanh trắng. | Ngắm 0.6s (tia đỏ) rồi lao húc. |
| **Dung Nham Cự Ma** (Vương) | Hỏa Diệm Cốc | Khung Thạch Ma bằng bazan đen, vân dung nham cam lõi vàng, vai rỉ lửa. | Xả 12 khối dung nham, dậm lao tới. |
| **Cửu Vĩ Băng Hồ** (Vương) | Huyền Băng Động | Hồ ly trắng lớn, 9 đuôi xòe quạt chóp lam phát sáng, vạch vàng trên sườn, ngọc trán lam. | Xả 16 băng tiễn làm chậm, lướt chớp nhoáng. |

Huyết Lang Vương là Vương của Linh Mộc Lâm.

## 7. NPC Tông Môn

NPC dùng chung khung nhân vật kiếm tu (idle + walk, 3 hướng), khác nhau ở bảng màu và đặc điểm:
râu (dài / chòm dê / ria), mũ (đạo quan đen gắn ngọc / nón lá), búi tóc đôi cài hoa, mắt híp.
Trưởng lão có linh khí nhẹ theo màu riêng. Tên vàng = NPC có chức năng.

| NPC | Vị trí | Tạo hình | Chức năng |
| --- | --- | --- | --- |
| Chưởng Môn Thiên Kiếm Tử | Trước Thiên Kiếm Điện | Đạo bào trắng ngà viền vàng, tóc và râu dài bạc trắng, mũ đạo quan, mắt híp, linh khí vàng. | Nhận xét tiến độ tu luyện, mở Động Phủ. |
| Đan Sư Trưởng Lão Đan Trần | Trước Đan Phòng | Áo nâu đỏ cổ vàng, tóc muối tiêu, râu chòm dê, linh khí cam. | Luyện Đan. |
| Kiếm Các Lão Nhân Kiếm Si | Trước Kiếm Các | Áo xám lam cổ bạc, râu dài bạc, linh khí lam. | Y Phục. |
| Hộ Pháp Lôi Đài Lôi Hỏa | Cạnh Lôi Đài | Áo tím sẫm cổ tím nhạt, mũ đạo quan, râu chòm dê, linh khí tím. | Chuẩn bị Độ Kiếp. |
| Thương Nhân Vạn Bảo | Sạp "萬寶閣" cạnh Sơn Môn | Áo vàng đất cổ nâu đỏ, nón lá, ria mép. Sạp có mái vải lam viền vàng, chum, bình đan, cuộn trục, đèn lồng. | Cửa hàng Vạn Bảo Các. |
| Đại Sư Tỷ Tô Thanh Dao | Đi vòng quảng trường | Áo hồng phấn cổ hồng thẫm, búi tóc đôi buộc dây hồng, trâm hoa đào. | Mẹo về Bí Cảnh. |
| Đệ tử tuần tra ×2 | Đi dọc thần đạo và đường ngang | Đồng phục trắng xám cổ lam. | Lời đồn, mẹo đánh boss. |

## 8. Hướng dẫn thay bằng tranh vẽ tay

1. Mỗi đạo cụ có khung trong `TT.Env.DEFS` (`w, h, ax, ay`). Vẽ PNG đúng khung, gốc tại `(ax, ay)`.
2. Thay hàm `draw` của mục đó bằng `g.drawImage(img, -ax, -ay)`; va chạm (`col`), ánh sáng (`lights`), vùng làm mờ (`occl`) giữ nguyên.
3. Nhân vật: tải sprite sheet tại `tests/tutien/sprite_preview.html`, vẽ đè từng ô 128×168, giữ điểm neo (64, 160).
