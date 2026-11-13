using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

/// Đo độ tròn của hình thần luân trong từng ô lưới.
/// Với mỗi ô: tìm tâm (trọng tâm theo alpha), bắn 120 tia từ tâm ra, ghi bán kính mép ngoài
/// (điểm xa nhất còn alpha > ngưỡng). Hình tròn → bán kính gần như bằng nhau ở mọi hướng (cv nhỏ).
public static class HaloShape
{
    public static string Measure(string path, int rows, int cols)
    {
        using (var img = Image.FromFile(path))
        using (var bmp = new Bitmap(img.Width, img.Height, PixelFormat.Format32bppArgb))
        {
            using (var g = Graphics.FromImage(bmp)) g.DrawImage(img, 0, 0, img.Width, img.Height);
            int W = bmp.Width, H = bmp.Height;
            var data = bmp.LockBits(new Rectangle(0, 0, W, H), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
            byte[] px = new byte[W * H * 4];
            Marshal.Copy(data.Scan0, px, 0, px.Length);
            bmp.UnlockBits(data);
            bool hasAlpha = false;
            for (int i = 3; i < px.Length; i += 4) if (px[i] < 250) { hasAlpha = true; break; }

            var sb = new System.Text.StringBuilder();
            for (int r = 0; r < rows; r++)
                for (int c = 0; c < cols; c++)
                {
                    int x0 = c * W / cols, y0 = r * H / rows, x1 = (c + 1) * W / cols, y1 = (r + 1) * H / rows;
                    Func<int, int, double> A = (x, y) =>
                    {
                        int o = (y * W + x) * 4;
                        if (hasAlpha) return px[o + 3] / 255.0;
                        int mx = Math.Max(px[o], Math.Max(px[o + 1], px[o + 2]));
                        return Math.Max(0, Math.Min(1, (mx - 40) / 60.0)); // ảnh không alpha: nền tối
                    };
                    double sw = 0, sx = 0, sy = 0;
                    for (int y = y0; y < y1; y++) for (int x = x0; x < x1; x++) { double a = A(x, y); if (a > 0.3) { sw += a; sx += a * x; sy += a * y; } }
                    if (sw < 50) { sb.AppendFormat("row={0} col={1} EMPTY\n", r, c); continue; }
                    double cx = sx / sw, cy = sy / sw;
                    int N = 120; var radii = new List<double>();
                    double maxR = Math.Min(x1 - x0, y1 - y0) * 0.75;
                    for (int k = 0; k < N; k++)
                    {
                        double ang = k * 2 * Math.PI / N, dx = Math.Cos(ang), dy = Math.Sin(ang), outer = 0;
                        for (double d = 0; d < maxR; d += 0.75)
                        {
                            int x = (int)(cx + dx * d), y = (int)(cy + dy * d);
                            if (x < x0 || y < y0 || x >= x1 || y >= y1) break;
                            if (A(x, y) > 0.3) outer = d;
                        }
                        radii.Add(outer);
                    }
                    double mean = 0; foreach (var v in radii) mean += v; mean /= N;
                    double var_ = 0; foreach (var v in radii) var_ += (v - mean) * (v - mean);
                    double cv = Math.Sqrt(var_ / N) / Math.Max(1, mean);
                    // độ lệch tâm: tâm hình so với tâm ô
                    double offc = Math.Sqrt(Math.Pow(cx - (x0 + x1) / 2.0, 2) + Math.Pow(cy - (y0 + y1) / 2.0, 2)) / Math.Max(1, mean);
                    sb.AppendFormat("row={0} col={1} meanR={2:F1} cv={3:F3} centerOff={4:F2}\n", r, c, mean, cv, offc);
                }
            return sb.ToString();
        }
    }
}
