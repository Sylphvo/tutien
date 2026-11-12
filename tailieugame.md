# TÀI LIỆU THIẾT KẾ HỆ THỐNG (GDD) - GAME TU TIÊN 2D TOP-DOWN ACTION
**Phiên bản:** 1.0  
**Thể loại:** 2D Sprite Top-down Action RPG / Roguelite Tu Tiên  
**Định hướng Kỹ thuật:** Data-Driven Design (JSON / C# ScriptableObject cho Unity hoặc Resource cho Godot)

---

## MỤC LỤC
1. [Hệ thống Kho Đồ & Túi Trữ Vật (Inventory & Spatial Storage)](#1-hệ-thống-kho-đồ--túi-trữ-vật-inventory--spatial-storage)
2. [Hệ thống Tẩy Luyện Từ Tố (Affix Reroll System)](#2-hệ-thống-tẩy-luyện-từ-tố-affix-reroll-system)
3. [Cơ chế Độ Kiếp Sét Đánh (Tribulation Lightning Mechanic)](#3-cơ-chế-độ-kiếp-sét-đánh-tribulation-lightning-mechanic)
4. [Cấu trúc Dữ liệu C# & JSON Mẫu (Data Schemas)](#4-cấu-trúc-dữ-liệu-c--json-mẫu-data-schemas)
5. [Thiết kế Giao diện UI/UX Wireframes & Luồng Tương tác](#5-thiết-kế-giao-diện-uiux-wireframes--luồng-tương-tác)

---

## 1. HỆ THỐNG KHO ĐỒ & TÚI TRỮ VẬT (INVENTORY & SPATIAL STORAGE)

### 1.1. Phân loại Vật phẩm (Item Categories)
Để dễ quản lý trong Database và UI Filter, toàn bộ vật phẩm được chia làm 6 nhóm chính:
* **Pháp Bảo (Weapon / Dharma Treasure):** Vũ khí bay quanh người hoặc điều khiển trực tiếp (Phi kiếm, Hồ lô, Ấn, Chuông). Không xếp chồng (`MaxStack = 1`).
* **Linh Giáp & Phụ Kiện (Armor & Accessories):** Đạo bào, Hộ tâm kính, Ngọc bội, Nhẫn trữ vật. Không xếp chồng (`MaxStack = 1`).
* **Đan Dược & Phù Lục (Consumables):** Gắn được vào thanh Quick-slot (`1, 2, 3, 4`) để dùng ngay trong trận. Xếp chồng (`MaxStack = 99`).
* **Linh Thảo & Khoáng Thạch (Materials):** Nguyên liệu Luyện đan, Luyện khí, Tẩy luyện. Xếp chồng (`MaxStack = 999`).
* **Linh Châu (Gems / Runes):** Vật phẩm khảm vào lỗ (Socket) của Pháp bảo.
* **Công Pháp / Bí Tịch (Skill Books):** Sách học kỹ năng Chủ động hoặc Tâm pháp Nội tại.

### 1.2. Cơ chế Nạp Giới (Expanding Storage & Elemental Resonance)
* **Mở rộng ô chứa:** Nhân vật khởi đầu chỉ có **Túi Vải Thô (12 ô)**. Khi trang bị **Túi Trữ Vật** hoặc **Nạp Giới (Nhẫn Không Gian)** phẩm chất cao hơn, số lượng ô túi đồ sẽ mở rộng thêm (`+12`, `+24`, `+48` ô).
* **Cơ chế Giám định (Thần Thức Quét):** Trang bị nhặt trong Bí cảnh có thuộc tính `IsIdentified = false`. Người chơi giữ chuột phải (tốn `50 Linh Lực` trong `1.0 giây`) để quét mở khóa các dòng Từ tố ẩn.
* **Cộng hưởng Ngũ Hành trong Ô Trang Bị (Equipment Resonance):**
  * Giao diện nhân vật có 5 vị trí trang bị xếp theo vòng tròn **Ngũ Hành Tương Sinh**: `Kim -> Thủy -> Mộc -> Hỏa -> Thổ`.
  * Nếu món đồ ở ô trước có hệ tương sinh với món đồ ở ô kế tiếp (Ví dụ: Ô 1 đeo Pháp bảo hệ **Mộc**, Ô 2 đeo Linh giáp hệ **Hỏa**), món đồ ở Ô 2 sẽ được kích hoạt dòng **Cộng Hưởng (+15% hiệu quả chỉ số gốc)**.

---

## 2. HỆ THỐNG TẨY LUYỆN TỪ TỐ (AFFIX REROLL SYSTEM)

### 2.1. Quy tắc Phân nhóm Từ Tố (Affix Pools)
Mỗi dòng Từ tố thuộc về 1 trong 3 nhóm để kiểm soát cân bằng game:
1. **Prefix (Tiền tố - Chỉ số cơ bản):** Cộng ATK, HP, DEF, Crit Rate, Crit Damage, Sát thương Ngũ Hành.
2. **Suffix (Hậu tố - Biến đổi hành vi 2D Action):** Cộng số lượng Phi kiếm (`ProjectileCount`), số lần Xuyên táo (`PierceCount`), tốc độ bay (`ProjectileSpeed`), bán kính nổ (`AoERadius`).
3. **Unique (Tiên thiên - Chỉ xuất hiện từ phẩm chất Tiên Khí trở lên):** Các hiệu ứng đặc biệt kích hoạt theo điều kiện (Hút máu khi chí mạng, gọi sét khi đâm trúng lần thứ $N$, tách kiếm khí...).

### 2.2. Bảng Phẩm Chất & Giới hạn Bậc Từ Tố (Rarity & Tier Cap)

| Phẩm chất | Mã màu Hex | Số dòng Từ tố | Giới hạn Tier | Mở khóa Nhóm Unique |
| :--- | :--- | :---: | :---: | :---: |
| **Pháp Khí** | `#FFFFFF` (Trắng) | 1 | Tier 1 - Tier 2 | Không |
| **Linh Khí** | `#2ECC71` (Lục) | 2 | Tier 1 - Tier 3 | Không |
| **Bảo Khí** | `#3498DB` (Lam) | 3 | Tier 1 - Tier 4 | Không |
| **Tiên Khí** | `#9B59B6` (Tím) | 4 | Tier 1 - Tier 5 | Có (Tối đa 1 dòng) |
| **Thần Khí** | `#F39C12` (Cam/Vàng) | 5 | Tier 2 - Tier 5 | Có (Tối đa 2 dòng) |

### 2.3. Công thức Chi phí & Tỷ lệ Quay (Reroll Math)

**Bảng Trọng số (Weight) khi quay Tier của 1 dòng Từ tố:**
* **Tier 1 (Hạ phẩm):** Weight = $500$ ($50\%$)
* **Tier 2 (Trung phẩm):** Weight = $300$ ($30\%$)
* **Tier 3 (Thượng phẩm):** Weight = $140$ ($14\%$)
* **Tier 4 (Cực phẩm):** Weight = $50$ ($5\%$)
* **Tier 5 (Tiên phẩm):** Weight = $10$ ($1\%$)

**Công thức Chi phí mỗi lần bấm "Tẩy Luyện":**
$$\text{Cost}_{\text{LinhThach}} = \text{BaseCost} \times (\text{ItemLevel} \times 1.5) \times 2^{L}$$
$$\text{Cost}_{\text{DinhHonChau}} = L$$
*(Trong đó $L$ là số lượng dòng đang bị khóa, điều kiện bắt buộc: $0 \le L \le \text{TotalAffixes} - 1$).*

**Cơ chế Bảo hiểm (Linh Vận Pity):**
* Mỗi lần tẩy luyện tăng $+1$ điểm `LinhVan`.
* Khi $\text{LinhVan} \ge 100$: Lần tẩy luyện kế tiếp ép buộc ít nhất 1 dòng chưa khóa đạt **Tier 5**, sau đó reset `LinhVan = 0`.

---

## 3. CƠ CHẾ ĐỘ KIẾP SÉT ĐÁNH (TRIBULATION LIGHTNING MECHANIC)

### 3.1. Thông số Lôi Kiếp theo Đại Cảnh Giới

| Cảnh giới Đột phá | Số Đạo Lôi Kiếp (Waves) | Bán kính Lôi Đài | Base Damage / Đạo | Kiểu Sét Xuất hiện |
| :--- | :---: | :---: | :---: | :--- |
| **Trúc Cơ Kiếp** | 3 Đạo | $12\text{m}$ | $150$ | Kiểu 1 (Truy kích) + Kiểu 3 (Đạo 3) |
| **Kim Đan Kiếp** | 6 Đạo | $14\text{m}$ | $600$ | Kiểu 1 + Kiểu 2 (Lưới điện) + Kiểu 3 (Đạo 6) |
| **Nguyên Anh Kiếp** | 9 Đạo | $16\text{m}$ | $2500$ | Kết hợp cả 3 kiểu dồn dập, để lại Lôi Hỏa |

### 3.2. Timeline Chi tiết của 1 Tia Sét trên Sân Đấu (0.0s -> 3.0s)
* **`0.0s - 0.5s` (Tracking Warning):** Vòng tròn cảnh báo màu đỏ (`Radius = 2.5m`) xuất hiện dưới chân Player và di chuyển bám theo Player với tốc độ chậm. Một vòng tròn lõi bên trong phóng to dần từ $0\%$ lên $100\%$ để báo thời gian đếm ngược.
* **`0.5s - 0.8s` (Locked Warning):** Vòng tròn đỏ đổi sang màu đỏ rực và **đứng yên tại chỗ**. Đây là cửa sổ $0.3\text{s}$ để Player bấm `Space` (Thân pháp Dash) thoát ra khỏi vùng nổ.
* **`0.8s - 0.95s` (Lightning Strike):** Sprite tia sét giáng thẳng từ rìa trên màn hình xuống tâm vòng tròn. Kích hoạt `CircleCollider2D` gây sát thương trong $0.1\text{s}$ đầu tiên + Rung camera (`Shake`).
* **`0.95s - 3.0s` (Scorched Ground):** Vùng đất vừa bị sét đánh rực lửa điện tím, gây sát thương đốt theo giây ($15\%$ `BaseDamage/s`) và làm chậm $30\%$ nếu Player dẫm vào.

### 3.3. Công thức Sát thương Lôi Kiếp & Đan Độc (Karma Penalty)
$$\text{Damage}_k = \text{BaseRealmDamage} \times (1 + 0.25 \times k) \times \left(1 + \frac{\text{DanDoc}}{200}\right) \times (1 - \text{FormationReduction})$$
* $k$: Thứ tự đạo sét hiện tại ($1 \dots N$).
* $\text{DanDoc}$: Điểm Đan Độc tích tụ trong người ($0 \dots 100$). Nếu $\text{DanDoc} = 100$, sát thương sét tăng thêm $50\%$.
* $\text{FormationReduction}$: Phần trăm giảm sát thương từ Trận Pháp/Vật phẩm hộ thân đặt vào trước khi Độ Kiếp (Tối đa giảm $60\%$).

---

## 4. CẤU TRÚC DỮ LIỆU C# & JSON MẪU (DATA SCHEMAS)

### 4.1. File JSON Cấu hình Danh sách Từ Tố (`affix_pool.json`)
Dùng để nạp vào bộ nhớ khi khởi động game, dễ dàng chỉnh sửa cân bằng mà không cần dịch lại code (Rebuild):

```json
{
  "TierWeights": [
    { "Tier": 1, "Weight": 500, "ColorHex": "#FFFFFF", "Name": "Hạ Phẩm" },
    { "Tier": 2, "Weight": 300, "ColorHex": "#2ECC71", "Name": "Trung Phẩm" },
    { "Tier": 3, "Weight": 140, "ColorHex": "#3498DB", "Name": "Thượng Phẩm" },
    { "Tier": 4, "Weight": 50,  "ColorHex": "#9B59B6", "Name": "Cực Phẩm" },
    { "Tier": 5, "Weight": 10,  "ColorHex": "#F39C12", "Name": "Tiên Phẩm" }
  ],
  "AffixDefinitions": [
    {
      "AffixId": "AFFIX_ATK_PERCENT",
      "Name": "Khung Thương",
      "Category": "Prefix",
      "ApplicableSlots": ["Weapon", "Accessory"],
      "StatType": "AttackPercent",
      "DescriptionTemplate": "Tăng {0}% Công kích cơ bản",
      "TierRanges": {
        "1": { "Min": 3.0,  "Max": 6.0,  "IsInteger": false },
        "2": { "Min": 6.5,  "Max": 10.0, "IsInteger": false },
        "3": { "Min": 10.5, "Max": 15.0, "IsInteger": false },
        "4": { "Min": 16.0, "Max": 22.0, "IsInteger": false },
        "5": { "Min": 25.0, "Max": 35.0, "IsInteger": false }
      }
    },
    {
      "AffixId": "AFFIX_SWORD_COUNT",
      "Name": "Phân Quang",
      "Category": "Suffix",
      "ApplicableSlots": ["Weapon"],
      "StatType": "ProjectileCount",
      "DescriptionTemplate": "Số lượng Phi Kiếm xuất trận +{0}",
      "TierRanges": {
        "1": { "Min": 1, "Max": 1, "IsInteger": true },
        "2": { "Min": 1, "Max": 1, "IsInteger": true },
        "3": { "Min": 1, "Max": 2, "IsInteger": true },
        "4": { "Min": 2, "Max": 2, "IsInteger": true },
        "5": { "Min": 2, "Max": 3, "IsInteger": true }
      }
    },
    {
      "AffixId": "AFFIX_PIERCE_COUNT",
      "Name": "Xuyên Vân",
      "Category": "Suffix",
      "ApplicableSlots": ["Weapon"],
      "StatType": "PierceCount",
      "DescriptionTemplate": "Phi Kiếm đâm xuyên thêm +{0} mục tiêu trước khi quay về",
      "TierRanges": {
        "1": { "Min": 1, "Max": 1, "IsInteger": true },
        "2": { "Min": 1, "Max": 2, "IsInteger": true },
        "3": { "Min": 2, "Max": 2, "IsInteger": true },
        "4": { "Min": 2, "Max": 3, "IsInteger": true },
        "5": { "Min": 3, "Max": 4, "IsInteger": true }
      }
    },
    {
      "AffixId": "AFFIX_UNIQUE_THUNDER_CHAIN",
      "Name": "Thiên Lôi Dẫn",
      "Category": "Unique",
      "ApplicableSlots": ["Weapon"],
      "StatType": "SpecialTrigger_ThunderOnHit",
      "DescriptionTemplate": "Mỗi đòn đâm thứ 5 giáng Cửu Thiên Lôi gây {0}% sát thương hệ Lôi",
      "TierRanges": {
        "4": { "Min": 60.0,  "Max": 90.0,  "IsInteger": false },
        "5": { "Min": 100.0, "Max": 150.0, "IsInteger": false }
      }
    }
  ]
}
```

### 4.2. C# ScriptableObject & Logic Tẩy Luyện (`AffixRerollManager.cs`)

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;

public enum AffixCategory { Prefix, Suffix, Unique }
public enum StatModifyType { FlatATK, AttackPercent, CritRate, ProjectileCount, PierceCount, MoveSpeed, SpecialTrigger_ThunderOnHit }

[Serializable]
public class TierValueRange
{
    public int Tier;
    public float Min;
    public float Max;
    public bool IsInteger;
}

[CreateAssetMenu(fileName = "NewAffixDef", menuName = "TuTien/Affix Definition")]
public class AffixDefinitionSO : ScriptableObject
{
    public string AffixId;
    public string AffixName;
    public AffixCategory Category;
    public StatModifyType StatType;
    [TextArea] public string DescriptionTemplate;
    public List<TierValueRange> TierRanges = new List<TierValueRange>();

    public TierValueRange GetRangeForTier(int tier)
    {
        return TierRanges.FirstOrDefault(r => r.Tier == tier) ?? TierRanges.Last();
    }
}

[Serializable]
public class RolledAffixInstance
{
    public string AffixId;
    public int Tier;
    public float RolledValue;
    public bool IsLocked;
}

public class AffixRerollService
{
    private readonly int[] _tierWeights = { 0, 500, 300, 140, 50, 10 }; // Index 1 -> 5

    public void RerollItemAffixes(
        List<RolledAffixInstance> currentAffixes,
        List<AffixDefinitionSO> availablePool,
        int maxTierCap,
        bool allowUnique,
        ref int pityCounter)
    {
        // 1. Giữ lại các ID đang bị khóa để chống trùng lặp
        HashSet<string> usedAffixIds = new HashSet<string>(
            currentAffixes.Where(a => a.IsLocked).Select(a => a.AffixId)
        );

        bool hasUniqueAlready = currentAffixes.Any(a =>
            a.IsLocked && availablePool.First(p => p.AffixId == a.AffixId).Category == AffixCategory.Unique);

        pityCounter++;
        bool forceTier5 = pityCounter >= 100;

        // 2. Quay mới từng dòng chưa khóa
        for (int i = 0; i < currentAffixes.Count; i++)
        {
            if (currentAffixes[i].IsLocked) continue;

            // Lọc danh sách các Affix khả dụng (Chưa trùng ID và hợp lệ Unique)
            var validCandidates = availablePool.Where(def =>
                !usedAffixIds.Contains(def.AffixId) &&
                (allowUnique || def.Category != AffixCategory.Unique) &&
                (!hasUniqueAlready || def.Category != AffixCategory.Unique)
            ).ToList();

            if (validCandidates.Count == 0) break;

            // Chọn ngẫu nhiên 1 Affix từ Pool
            AffixDefinitionSO pickedDef = validCandidates[UnityEngine.Random.Range(0, validCandidates.Count)];
            usedAffixIds.Add(pickedDef.AffixId);
            if (pickedDef.Category == AffixCategory.Unique) hasUniqueAlready = true;

            // Quay Tier dựa trên Trọng số hoặc Bảo hiểm Pity
            int rolledTier = (forceTier5 && maxTierCap >= 5) ? 5 : RollWeightedTier(maxTierCap);
            if (rolledTier == 5 && forceTier5)
            {
                forceTier5 = false;
                pityCounter = 0;
            }

            // Quay giá trị thực tế trong khoảng [Min, Max] của Tier
            TierValueRange range = pickedDef.GetRangeForTier(rolledTier);
            float finalValue = range.IsInteger
                ? UnityEngine.Random.Range((int)range.Min, (int)range.Max + 1)
                : (float)Math.Round(UnityEngine.Random.Range(range.Min, range.Max), 1);

            currentAffixes[i] = new RolledAffixInstance
            {
                AffixId = pickedDef.AffixId,
                Tier = rolledTier,
                RolledValue = finalValue,
                IsLocked = false
            };
        }
    }

    private int RollWeightedTier(int maxTierCap)
    {
        int totalWeight = 0;
        for (int t = 1; t <= maxTierCap; t++) totalWeight += _tierWeights[t];

        int randomPoint = UnityEngine.Random.Range(0, totalWeight);
        int currentSum = 0;

        for (int t = 1; t <= maxTierCap; t++)
        {
            currentSum += _tierWeights[t];
            if (randomPoint < currentSum) return t;
        }
        return 1;
    }
}
```

---

## 5. THIẾT KẾ GIAO DIỆN UI/UX WIREFRAMES & LUỒNG TƯƠNG TÁC

### 5.1. Giao diện Kho Đồ & Cộng Hưởng Ngũ Hành (Inventory & Equipment Modal)
* **Phím tắt mở:** `Tab` hoặc `I`.
* **Điểm nhấn UX:** Các mũi tên nối giữa 5 ô trang bị bên trái sẽ **phát sáng màu vàng kim** nếu người chơi lắp đúng chuỗi Ngũ Hành tương sinh.

```text
+===================================================================================+
|  [NHÂN VẬT & TRANG BỊ]        [TẨY LUYỆN]        [LUYỆN ĐAN]        [ĐỘNG PHỦ]  [X]|
+===================================================================================+
|                              |  TÚI TRỮ VẬT: [Nạp Giới Thượng Phẩm (36/48 Ô)]     |
|        [Ô 1: PHÁP BẢO]       |  Bộ lọc: [Tất cả] [Pháp Bảo] [Đan Dược] [Nguyên Liệu]|
|         (Hệ Kim - +9)        |  +------+ +------+ +------+ +------+ +------+      |
|          /         \         |  |Kiếm  | |Đan   | |Hỏa   | |Huyền | |Chưa  |      |
|         v           \        |  |Lôi   | |Trúc  | |Linh  | |Thiết | |Giám  |      |
|  [Ô 5: NGỌC BỘI]   [Ô 2: GIÁP]  |  |[Tím] | |Cơ x5 | |Châu  | |x128  | |Định? |      |
|   (Hệ Thổ)          (Hệ Thủy)|  +------+ +------+ +------+ +------+ +------+      |
|       ^                 |    |  +------+ +------+ +------+ +------+ +------+      |
|        \                v    |  |Phù   | |Linh  | |Trống | |Trống | |Trống |      |
|  [Ô 4: HÀI/GIÀY] <-- [Ô 3: NHẪN]|  |HộThân| |Thảo  | |      | |      | |      |      |
|   (Hệ Hỏa)          (Hệ Mộc) |  |x3    | |x45   | |      | |      | |      |      |
|                              |  +------+ +------+ +------+ +------+ +------+      |
|  [CỘNG HƯỞNG: 3/5 KÍCH HOẠT] |----------------------------------------------------|
|  +------------------------+  |  CHI TIẾT VẬT PHẨM ĐANG TRỎ CHUỘT (TOOLTIP):       |
|  | Cảnh giới: Trúc Cơ Hậu |  |  * Thanh Vân Phi Kiếm (+9) - [Tiên Khí - Hệ Phong] |
|  | Công kích: 480 (+120)  |  |  * Công kích gốc: 185 | Số kiếm: 3 | Xuyên thấu: 2 |
|  | Tốc độ kiếm: 18.5 m/s  |  |  * [T4] Phân Quang: Số lượng Phi Kiếm +2           |
|  | Đan độc: [|||.....] 30%|  |  * [T5] Thiên Lôi Dẫn: Đòn thứ 5 gọi sét (120%)    |
+===================================================================================+
```

---

### 5.2. Giao diện Đài Tẩy Luyện Từ Tố (Affix Reroll Modal)
* **Điểm nhấn UX:**
  * Mỗi dòng Từ tố có **Nút Khóa (Biểu tượng Ổ Khóa / Định Hồn Châu)** bên phải. Khi người chơi bấm Khóa, giá tiền ở dưới tự động nhảy số nhân đôi và đổi màu cảnh báo nếu vượt quá khả năng chi trả.
  * Khi roll ra dòng **Tier 5 (Cam)**, hộp thoại sẽ có hiệu ứng tia chớp vàng chạy ngang dòng chữ và tự động hỏi xác nhận nếu người chơi vô tình bấm Tẩy luyện đè lên dòng Tier 5 chưa khóa.

```text
+===================================================================================+
|                           LÒ TẨY LUYỆN LINH KHÍ                                [X]|
+===================================================================================+
|   CHỌN PHÁP BẢO               |   DANH SÁCH TỪ TỐ HIỆN TẠI (Khóa tối đa: 3/4)     |
|                               |                                                   |
|   +-----------------------+   |   1. [T5 - Cam] Số lượng Phi Kiếm +3       [KHÓA] |
|   |                       |   |   ----------------------------------------------- |
|   |     [ICON KIẾM]       |   |   2. [T4 - Tím] Công kích cơ bản +18.5%    [KHÓA] |
|   |   Thanh Vân Kiếm +9   |   |   ----------------------------------------------- |
|   |    (Phẩm: Tiên Khí)   |   |   3. [T1 - Trắng] Phòng ngự +12            [MỞ ]  |
|   |                       |   |   ----------------------------------------------- |
|   +-----------------------+   |   4. [T2 - Lục] Tốc độ di chuyển +4.5%     [MỞ ]  |
|                               |                                                   |
|   Linh Vận (Bảo Hiểm T5):     |   ----------------------------------------------- |
|   [||||||||||||......] 68/100 |   [!] Lưu ý: Các dòng [MỞ] sẽ bị thay thế ngẫu    |
|   (Đầy 100 chắc chắn ra T5)   |       nhiên khi bấm Tẩy Luyện!                    |
+-------------------------------+---------------------------------------------------+
|   NGUYÊN LIỆU TIÊU HAO:                                                           |
|   * Linh Thạch:      1,200 / 45,000  (Hệ số khóa x4)                              |
|   * Tẩy Luyện Thạch:     5 / 120                                                  |
|   * Định Hồn Châu:       2 / 8       (Tốn 2 viên do khóa 2 dòng)                  |
|                                                                                   |
|                       +-----------------------------------+                       |
|                       |     [ BẤM ĐỂ TẨY LUYỆN (R) ]      |                       |
|                       +-----------------------------------+                       |
+===================================================================================+
```

---

### 5.3. Giao diện Chuẩn Bị Độ Kiếp & HUD Chiến Đấu Lôi Đài
Gồm 2 giai đoạn: **Bảng chuẩn bị trước khi gọi sét** và **Màn hình HUD chiến đấu trực tiếp**.

#### A. Bảng Chuẩn Bị Trận Pháp Độ Kiếp (Pre-Tribulation Setup)
```text
+===================================================================================+
|                      CHUẨN BỊ ĐỘ KIẾP: TRÚC CƠ HẬU -> KIM ĐAN                  [X]|
+===================================================================================+
|  THÔNG TIN THIÊN KIẾP:                |  TRẬN PHÁP HỘ THÂN (Đặt vật phẩm trợ giúp)|
|  * Số đợt sét: 6 Đạo (Lục Cửu Kiếp)   |                                           |
|  * Sát thương dự kiến: 600 -> 1,350   |     [Ô PHÙ LỤC]         [Ô PHÁP BẢO ĐỠ]   |
|  * Đan độc hiện tại: 40/100           |    (Tị Lôi Phù)         (Huyền Quy Giáp)  |
|    (Cảnh báo: Sét mạnh thêm +20%!)    |    Đỡ 1 đạo sét         Giảm 25% ST Lôi   |
|                                       |                                           |
|  TỶ LỆ SỐNG SÓT ƯỚC TÍNH: 72%         |              [Ô ĐAN DƯỢC ĐỘT PHÁ]         |
|  Lời khuyên: Hãy uống Thanh Tâm Đan   |                 (Kết Đan Đan)             |
|  để giảm Đan Độc trước khi Độ Kiếp!   |              Hồi 30% HP sau mỗi đạo       |
+---------------------------------------+-------------------------------------------+
|                    +-----------------------------------------+                    |
|                    |   [ Triệu Hồi Lôi Kiếp - Bắt Đầu! ]     |                    |
|                    +-----------------------------------------+                    |
+===================================================================================+
```

#### B. Màn hình HUD Sân Đấu Độ Kiếp 2D Top-Down (In-Game Arena HUD)
```text
+===================================================================================+
|  [CẢNH BÁO THIÊN KIẾP] Đạo Thứ: 4 / 6          Thời gian chuẩn bị đạo kế: 02.4s   |
|  Tiến độ Độ Kiếp: [=================>............] 65%                            |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|                        . - ~ ~ ~ - . (Vòng Tròn Trận Pháp - R=14m)                |
|                    . '               ' .                                          |
|                  /    (Vùng Lôi Hỏa)     \                                        |
|                 |      [xxxx]             |                                       |
|                 |                         |                                       |
|                 |         \  |  /         |                                       |
|                 |      --- ( ĐỎ ) ---  <--|-- Vòng tròn cảnh báo đỏ (Còn 0.3s nổ) |
|                 |         /  |  \         |                                       |
|                 |            O  ------> [PLAYER] (Đang bấm Space lướt ra ngoài)   |
|                  \        (Phi Kiếm)     /                                        |
|                    .                   .                                          |
|                      ' - . _ _ _ . - '                                            |
|                                                                                   |
+-----------------------------------------------------------------------------------+
|  HP: [||||||||||||||....] 1,450/1,800    Đan Độc: [||||......] 40%                |
|  MP: [||||||||||||||||..] 800/900        Khiên Hộ Thể: [1 Lượt Đỡ (Tị Lôi Phù)]   |
|  Skills: [LMB: Ngự Kiếm] [Space: Lôi Độn (Sẵn sàng)] [RMB: Kiếm Thuẫn] [1: Đan Máu]|
+===================================================================================+
```
