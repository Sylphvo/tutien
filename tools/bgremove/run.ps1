# Tách nền ảnh trong src/tutien/assets → src/tutien/assets/nobg/*.png (ảnh gốc giữ nguyên).
# Dùng:  powershell -NoProfile -File tools\bgremove\run.ps1 [-Mode stats|process] [-Only a.jpg,b.jpg] [-Tol 32] [-Feather 40]
param(
  [ValidateSet('stats', 'process')] [string]$Mode = 'process',
  [string[]]$Only = @(),
  [double]$Tol = 32,
  [double]$Feather = 40,
  [double]$HoleMinFrac = 0.0005
)
$ErrorActionPreference = 'Stop'
$Only = @($Only | ForEach-Object { $_ -split ',' } | Where-Object { $_ })  # -File truyền "a,b" thành 1 chuỗi
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Add-Type -Path (Join-Path $PSScriptRoot 'BgRemove.cs') -ReferencedAssemblies System.Drawing
$src = Join-Path $root 'src\tutien\assets'
$out = Join-Path $src 'nobg'
Get-ChildItem $src -File | Where-Object { $Only.Count -eq 0 -or $Only -contains $_.Name } | ForEach-Object {
  if ($Mode -eq 'stats') { $r = [BgRemove]::EdgeStats($_.FullName) }
  else { $r = [BgRemove]::Process($_.FullName, (Join-Path $out ($_.BaseName + '.png')), $Tol, $Feather, $HoleMinFrac) }
  '{0,-28} {1}' -f $_.Name, $r
}
