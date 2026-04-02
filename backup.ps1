# ==========================================
# お酒検索システム 自動バックアップスクリプト
# ==========================================

$ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackupRoot  = Join-Path $ProjectDir "backups"
$Timestamp   = Get-Date -Format "yyyy-MM-dd_HH-mm"
$BackupDir   = Join-Path $BackupRoot $Timestamp

$Targets = @("index.html", "products.js", "gen_products.js")

New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null

$Copied = 0
foreach ($File in $Targets) {
    $Src = Join-Path $ProjectDir $File
    if (Test-Path $Src) {
        Copy-Item -Path $Src -Destination (Join-Path $BackupDir $File)
        $Copied++
    }
}

# 直近30件を残して古いものを削除
$AllBackups = Get-ChildItem -Path $BackupRoot -Directory | Sort-Object Name -Descending
if ($AllBackups.Count -gt 30) {
    $AllBackups | Select-Object -Skip 30 | ForEach-Object {
        Remove-Item -Path $_.FullName -Recurse -Force
    }
}

$Total = [Math]::Min($AllBackups.Count, 30)
Write-Output "[$Timestamp] バックアップ完了: $Copied ファイル保存"
Write-Output "保存済み: $Total / 30 世代"
