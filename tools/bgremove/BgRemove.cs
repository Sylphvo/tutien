using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Runtime.InteropServices;

/// Tách nền ảnh có nền phẳng (một màu hoặc gần một màu) bằng loang màu từ viền ảnh.
/// - Màu nền = trung vị màu các điểm ở viền.
/// - Vùng nền = các điểm nối liền với viền có khoảng cách màu tới nền < tol,
///   cộng các "lỗ" kín bên trong (vd. giữa các vòng hào quang) đủ lớn và đủ gần màu nền.
/// - Mép mềm: điểm trong dải [tol, tol+feather] sát vùng nền được tách màu nền ra (unmix),
///   nên hiệu ứng phát sáng trên nền tối giữ được quầng mờ thay vì bị cắt cứng.
public static class BgRemove
{
    public static string Analyze(string path)
    {
        using (var bmp = Load(path))
        {
            int w = bmp.Width, h = bmp.Height;
            byte[] px = Bytes(bmp);
            var border = BorderPixels(px, w, h);
            int[] med = Median(border);
            double sd = 0;
            foreach (var c in border) sd += Dist(c, med);
            sd /= border.Count;
            return string.Format("{0}x{1} bg=#{2:x2}{3:x2}{4:x2} borderMeanDist={5:F1} hasAlpha={6}",
                w, h, med[0], med[1], med[2], sd, HasAlpha(px));
        }
    }

    /// Màu trung vị của 4 cạnh và 4 góc, để phân biệt nền gradient với nền cảnh vật.
    public static string EdgeStats(string path)
    {
        using (var bmp = Load(path))
        {
            int w = bmp.Width, h = bmp.Height;
            byte[] px = Bytes(bmp);
            Func<int, int, int, int, string> med = (x0, y0, x1, y1) =>
            {
                var l = new List<int[]>();
                for (int y = y0; y < y1; y++) for (int x = x0; x < x1; x++) { int o = (y * w + x) * 4; l.Add(new int[] { px[o + 2], px[o + 1], px[o] }); }
                int[] m = Median(l); double s = 0; foreach (var c in l) s += Dist(c, m);
                return string.Format("#{0:x2}{1:x2}{2:x2}~{3:F0}", m[0], m[1], m[2], s / l.Count);
            };
            int k = 4, c8 = Math.Min(w, h) / 12;
            return "T " + med(0, 0, w, k) + " B " + med(0, h - k, w, h) + " L " + med(0, 0, k, h) + " R " + med(w - k, 0, w, h)
                + " | TL " + med(0, 0, c8, c8) + " TR " + med(w - c8, 0, w, c8) + " BL " + med(0, h - c8, c8, h) + " BR " + med(w - c8, h - c8, w, h);
        }
    }

    /// Trả về chuỗi thống kê. tol: ngưỡng màu nền; feather: độ rộng dải mép mềm; holeMinFrac: diện tích tối thiểu của lỗ kín (tỉ lệ ảnh).
    public static string Process(string src, string dst, double tol, double feather, double holeMinFrac)
    {
        using (var bmp = Load(src))
        {
            int w = bmp.Width, h = bmp.Height, n = w * h;
            byte[] px = Bytes(bmp); // BGRA
            var border = BorderPixels(px, w, h);
            var modes = Modes(border, 0.15);   // 1-2 màu nền chủ đạo ở viền (nền 2 tông)
            int[] bg = modes[0];

            // màu nền tham chiếu cục bộ cho từng điểm (theo dõi được nền gradient)
            float[] rR = new float[n], rG = new float[n], rB = new float[n];
            bool[] isBg = new bool[n];
            var q = new Queue<int>();
            Func<int, float, float, float, double> distTo = (i, r, g, b) =>
            {
                int o = i * 4; double dr = px[o + 2] - r, dg = px[o + 1] - g, db = px[o] - b;
                return Math.Sqrt(dr * dr + dg * dg + db * db);
            };
            Action<int, float, float, float> mark = (i, r, g, b) => { isBg[i] = true; rR[i] = r; rG[i] = g; rB[i] = b; q.Enqueue(i); };

            // hạt giống: điểm viền trong suốt sẵn hoặc gần một màu nền chủ đạo
            for (int i = 0; i < n; i++)
            {
                int x = i % w, y = i / w;
                if (x != 0 && y != 0 && x != w - 1 && y != h - 1) continue;
                if (px[i * 4 + 3] < 8) { mark(i, bg[0], bg[1], bg[2]); continue; }
                foreach (var m in modes) if (distTo(i, m[0], m[1], m[2]) < tol) { mark(i, m[0], m[1], m[2]); break; }
            }
            // loang: nhận điểm kề nếu gần màu tham chiếu và không có bước nhảy màu gắt (mép vật thể)
            const float RATE = 0.04f;           // tốc độ màu tham chiếu đi theo gradient nền
            double stepTol = Math.Max(8, tol * 0.45);
            int[] nb = new int[4];
            while (q.Count > 0)
            {
                int p = q.Dequeue(), x = p % w, y = p / w, po = p * 4;
                nb[0] = x > 0 ? p - 1 : -1; nb[1] = x < w - 1 ? p + 1 : -1; nb[2] = y > 0 ? p - w : -1; nb[3] = y < h - 1 ? p + w : -1;
                foreach (int k in nb)
                {
                    if (k < 0 || isBg[k]) continue;
                    int o = k * 4;
                    if (px[o + 3] < 8) { mark(k, rR[p], rG[p], rB[p]); continue; }
                    if (px[po + 3] >= 8 && distTo(k, px[po + 2], px[po + 1], px[po]) >= stepTol) continue;
                    if (distTo(k, rR[p], rG[p], rB[p]) >= tol) continue;
                    mark(k, rR[p] + RATE * (px[o + 2] - rR[p]), rG[p] + RATE * (px[o + 1] - rG[p]), rB[p] + RATE * (px[o] - rB[p]));
                }
            }

            // lỗ kín bên trong (vd. lòng vòng hào quang): vùng liên thông gần màu nền chủ đạo, đủ lớn
            int minHole = Math.Max(16, (int)(n * holeMinFrac));
            bool[] seen = new bool[n];
            var stack = new Stack<int>();
            var comp = new List<int>();
            foreach (var m in modes)
                for (int s = 0; s < n; s++)
                {
                    if (seen[s] || isBg[s] || distTo(s, m[0], m[1], m[2]) >= tol * 0.75) continue;
                    comp.Clear(); seen[s] = true; stack.Push(s);
                    while (stack.Count > 0)
                    {
                        int p = stack.Pop(); comp.Add(p);
                        int x = p % w, y = p / w;
                        nb[0] = x > 0 ? p - 1 : -1; nb[1] = x < w - 1 ? p + 1 : -1; nb[2] = y > 0 ? p - w : -1; nb[3] = y < h - 1 ? p + w : -1;
                        foreach (int k in nb)
                            if (k >= 0 && !seen[k] && !isBg[k] && distTo(k, m[0], m[1], m[2]) < tol * 0.75) { seen[k] = true; stack.Push(k); }
                    }
                    if (comp.Count >= minHole) foreach (int p in comp) { isBg[p] = true; rR[p] = m[0]; rG[p] = m[1]; rB[p] = m[2]; }
                }
            int bgCount = 0;
            for (int i = 0; i < n; i++) if (isBg[i]) bgCount++;

            // dải mép mềm quanh vùng nền (BAND bước), mang theo màu tham chiếu của điểm nền gần nhất
            const int BAND = 3;
            int[] step = new int[n];
            for (int i = 0; i < n; i++) { step[i] = isBg[i] ? 0 : int.MaxValue; if (isBg[i]) q.Enqueue(i); }
            while (q.Count > 0)
            {
                int p = q.Dequeue();
                if (step[p] >= BAND) continue;
                int x = p % w, y = p / w;
                nb[0] = x > 0 ? p - 1 : -1; nb[1] = x < w - 1 ? p + 1 : -1; nb[2] = y > 0 ? p - w : -1; nb[3] = y < h - 1 ? p + w : -1;
                foreach (int k in nb)
                {
                    if (k < 0 || step[k] != int.MaxValue) continue;
                    if (distTo(k, rR[p], rG[p], rB[p]) >= tol + feather) continue;
                    step[k] = step[p] + 1; rR[k] = rR[p]; rG[k] = rG[p]; rB[k] = rB[p]; q.Enqueue(k);
                }
            }

            // alpha + tách màu nền (unmix) ở mép
            int[] refc = new int[3];
            for (int i = 0; i < n; i++)
            {
                if (step[i] == int.MaxValue) continue; // tiền cảnh: giữ nguyên
                int o = i * 4;
                refc[0] = (int)Math.Round(rR[i]); refc[1] = (int)Math.Round(rG[i]); refc[2] = (int)Math.Round(rB[i]);
                double a = Unmix(px, o, refc);
                if (isBg[i]) a *= Math.Max(0, (distTo(i, rR[i], rG[i], rB[i]) - tol * 0.5) / (tol * 0.5));
                a = Math.Min(a, px[o + 3] / 255.0);
                if (a < 0.02) { px[o] = px[o + 1] = px[o + 2] = 0; px[o + 3] = 0; continue; }
                for (int c = 0; c < 3; c++)
                {
                    double v = (px[o + c] - (1 - a) * refc[2 - c]) / a; // BGRA: c=0 là B
                    px[o + c] = (byte)Math.Max(0, Math.Min(255, Math.Round(v)));
                }
                px[o + 3] = (byte)Math.Round(a * 255);
            }

            Directory.CreateDirectory(Path.GetDirectoryName(dst));
            using (var outBmp = new Bitmap(w, h, PixelFormat.Format32bppArgb))
            {
                var data = outBmp.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
                Marshal.Copy(px, 0, data.Scan0, px.Length);
                outBmp.UnlockBits(data);
                outBmp.Save(dst, ImageFormat.Png);
            }
            return string.Format("bg=#{0:x2}{1:x2}{2:x2} removed={3:F1}%", bg[0], bg[1], bg[2], 100.0 * bgCount / n);
        }
    }

    // alpha nhỏ nhất sao cho px = a*fg + (1-a)*bg với fg trong [0,255]
    static double Unmix(byte[] px, int o, int[] bg)
    {
        double a = 0;
        for (int c = 0; c < 3; c++)
        {
            int v = px[o + 2 - c], b = bg[c];
            double k = v > b ? (v - b) / (double)(255 - b == 0 ? 1 : 255 - b) : (b - v) / (double)(b == 0 ? 1 : b);
            if (k > a) a = k;
        }
        return Math.Min(1, a);
    }

    /// Màu chủ đạo ở viền: histogram 5 bit/kênh, lấy tối đa 2 ô nhiều nhất có tỉ lệ >= minShare
    /// (ô đầu luôn lấy). Màu trả về = trung bình các điểm trong ô đó.
    static List<int[]> Modes(List<int[]> cs, double minShare)
    {
        var cnt = new Dictionary<int, int>();
        var sum = new Dictionary<int, long[]>();
        foreach (var c in cs)
        {
            int key = ((c[0] >> 3) << 10) | ((c[1] >> 3) << 5) | (c[2] >> 3);
            int v; cnt.TryGetValue(key, out v); cnt[key] = v + 1;
            long[] s; if (!sum.TryGetValue(key, out s)) sum[key] = s = new long[3];
            s[0] += c[0]; s[1] += c[1]; s[2] += c[2];
        }
        var keys = new List<int>(cnt.Keys);
        keys.Sort((a, b) => cnt[b].CompareTo(cnt[a]));
        var res = new List<int[]>();
        foreach (int k in keys)
        {
            if (res.Count >= 2 || (res.Count > 0 && cnt[k] < cs.Count * minShare)) break;
            long[] s = sum[k]; int m = cnt[k];
            var col = new int[] { (int)(s[0] / m), (int)(s[1] / m), (int)(s[2] / m) };
            if (res.Count == 1 && Dist(res[0], col) < 24) continue; // ô kề nhau = cùng một màu
            res.Add(col);
        }
        return res;
    }

    static Bitmap Load(string path)
    {
        using (var img = Image.FromFile(path))
        {
            var bmp = new Bitmap(img.Width, img.Height, PixelFormat.Format32bppArgb);
            using (var g = Graphics.FromImage(bmp)) g.DrawImage(img, 0, 0, img.Width, img.Height);
            return bmp;
        }
    }

    static byte[] Bytes(Bitmap bmp)
    {
        var data = bmp.LockBits(new Rectangle(0, 0, bmp.Width, bmp.Height), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
        byte[] px = new byte[bmp.Width * bmp.Height * 4];
        Marshal.Copy(data.Scan0, px, 0, px.Length);
        bmp.UnlockBits(data);
        return px;
    }

    static bool HasAlpha(byte[] px)
    {
        for (int i = 3; i < px.Length; i += 4) if (px[i] < 250) return true;
        return false;
    }

    static List<int[]> BorderPixels(byte[] px, int w, int h)
    {
        var list = new List<int[]>();
        Action<int, int> add = (x, y) => { int o = (y * w + x) * 4; if (px[o + 3] >= 8) list.Add(new int[] { px[o + 2], px[o + 1], px[o] }); };
        for (int x = 0; x < w; x++) { add(x, 0); add(x, h - 1); }
        for (int y = 1; y < h - 1; y++) { add(0, y); add(w - 1, y); }
        if (list.Count == 0) list.Add(new int[] { 0, 0, 0 });
        return list;
    }

    static int[] Median(List<int[]> cs)
    {
        int[] m = new int[3];
        for (int c = 0; c < 3; c++)
        {
            var v = new List<int>(cs.Count);
            foreach (var x in cs) v.Add(x[c]);
            v.Sort(); m[c] = v[v.Count / 2];
        }
        return m;
    }

    static double Dist(int[] a, int[] b)
    {
        double dr = a[0] - b[0], dg = a[1] - b[1], db = a[2] - b[2];
        return Math.Sqrt(dr * dr + dg * dg + db * db);
    }
}
