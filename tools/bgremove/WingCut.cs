using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Runtime.InteropServices;

/// Cắt cánh từ ảnh có nền caro tối + hạt sao (ảnh chụp màn hình "nền trong suốt giả").
/// Nền = điểm tối và gần xám (độ bão hoà thấp). Hạt sao / chữ ký = thành phần liên thông nhỏ, bị loại.
public static class WingCut
{
    // alpha theo "độ khác nền": sáng hoặc có màu thì là cánh
    static double Score(int r, int g, int b)
    {
        int mx = Math.Max(r, Math.Max(g, b)), mn = Math.Min(r, Math.Min(g, b));
        double chroma = mx - mn;
        double s1 = (mx - 55) / 45.0;      // độ sáng: 55 → 0, 100 → 1
        double s2 = (chroma - 14) / 26.0;  // màu: 14 → 0, 40 → 1
        return Math.Max(0, Math.Min(1, Math.Max(s1, s2)));
    }

    public static string Analyze(string path, int minArea)
    {
        using (var bmp = Load(path))
        {
            int w = bmp.Width, h = bmp.Height;
            byte[] px = Bytes(bmp);
            var comps = Components(px, w, h, 0.35);
            var sb = new System.Text.StringBuilder();
            sb.AppendFormat("{0}x{1}\n", w, h);
            foreach (var c in comps) if (c[0] >= minArea) sb.AppendFormat("area={0} box=({1},{2})-({3},{4})\n", c[0], c[1], c[2], c[3], c[4]);
            return sb.ToString();
        }
    }

    /// Cắt vùng (x0,y0,x1,y1), giữ thành phần liên thông có diện tích >= minArea, ghi PNG nền trong suốt.
    public static string Cut(string path, string dst, int x0, int y0, int x1, int y1, int minArea)
    {
        using (var bmp = Load(path))
        {
            int W = bmp.Width;
            byte[] all = Bytes(bmp);
            int w = x1 - x0, h = y1 - y0;
            byte[] px = new byte[w * h * 4];
            for (int y = 0; y < h; y++) Buffer.BlockCopy(all, ((y + y0) * W + x0) * 4, px, y * w * 4, w * 4);

            int n = w * h;
            double[] a = new double[n];
            for (int i = 0; i < n; i++) a[i] = Score(px[i * 4 + 2], px[i * 4 + 1], px[i * 4]);
            // thành phần liên thông trên ngưỡng thấp; bỏ cái nhỏ (sao, bụi)
            int[] lab = new int[n]; for (int i = 0; i < n; i++) lab[i] = -1;
            var keep = new List<bool>(); var st = new Stack<int>();
            for (int s = 0; s < n; s++)
            {
                if (lab[s] != -1 || a[s] < 0.08) continue;
                int id = keep.Count, area = 0; lab[s] = id; st.Push(s);
                while (st.Count > 0)
                {
                    int p = st.Pop(); area++;
                    int x = p % w, y = p / w;
                    for (int dy = -1; dy <= 1; dy++) for (int dx = -1; dx <= 1; dx++)
                    {
                        int xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
                        int k = yy * w + xx; if (lab[k] == -1 && a[k] >= 0.08) { lab[k] = id; st.Push(k); }
                    }
                }
                keep.Add(area >= minArea);
            }
            int kept = 0;
            for (int i = 0; i < n; i++)
            {
                int o = i * 4;
                bool k = lab[i] >= 0 && keep[lab[i]];
                if (!k) { px[o] = px[o + 1] = px[o + 2] = px[o + 3] = 0; continue; }
                kept++;
                double al = a[i];
                // tách nền tối (≈ #1e1e1e) ra khỏi màu mép
                const int BG = 30;
                for (int c = 0; c < 3; c++)
                {
                    double v = al > 0.02 ? (px[o + c] - (1 - al) * BG) / al : px[o + c];
                    px[o + c] = (byte)Math.Max(0, Math.Min(255, Math.Round(v)));
                }
                px[o + 3] = (byte)Math.Round(al * 255);
            }
            Directory.CreateDirectory(Path.GetDirectoryName(dst));
            using (var outBmp = new Bitmap(w, h, PixelFormat.Format32bppArgb))
            {
                var data = outBmp.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
                Marshal.Copy(px, 0, data.Scan0, px.Length);
                outBmp.UnlockBits(data);
                outBmp.Save(dst, ImageFormat.Png);
            }
            return string.Format("{0}x{1} kept={2:F1}%", w, h, 100.0 * kept / n);
        }
    }

    static List<int[]> Components(byte[] px, int w, int h, double thr)
    {
        int n = w * h; bool[] fg = new bool[n];
        for (int i = 0; i < n; i++) fg[i] = Score(px[i * 4 + 2], px[i * 4 + 1], px[i * 4]) >= thr;
        int[] seen = new int[n]; var res = new List<int[]>(); var st = new Stack<int>();
        for (int s = 0; s < n; s++)
        {
            if (!fg[s] || seen[s] != 0) continue;
            int area = 0, mx0 = w, my0 = h, mx1 = 0, my1 = 0; seen[s] = 1; st.Push(s);
            while (st.Count > 0)
            {
                int p = st.Pop(); area++; int x = p % w, y = p / w;
                if (x < mx0) mx0 = x; if (x > mx1) mx1 = x; if (y < my0) my0 = y; if (y > my1) my1 = y;
                for (int dy = -1; dy <= 1; dy++) for (int dx = -1; dx <= 1; dx++)
                {
                    int xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
                    int k = yy * w + xx; if (fg[k] && seen[k] == 0) { seen[k] = 1; st.Push(k); }
                }
            }
            res.Add(new[] { area, mx0, my0, mx1, my1 });
        }
        res.Sort((a, b) => b[0].CompareTo(a[0]));
        return res;
    }

    static Bitmap Load(string path)
    {
        using (var img = Image.FromFile(path))
        {
            var bmp = new Bitmap(img.Width, img.Height, PixelFormat.Format32bppArgb);
            using (var g = Graphics.FromImage(bmp)) { g.Clear(Color.FromArgb(255, 30, 30, 30)); g.DrawImage(img, 0, 0, img.Width, img.Height); }
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
}
