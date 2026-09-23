# Uso: .\scripts\backup.ps1  (genera backups/cmms_YYYY-MM-DD_HHmm.sql)
$ErrorActionPreference = "Stop"
$ts = Get-Date -Format "yyyy-MM-dd_HHmm"
$dir = Join-Path $PSScriptRoot "..\backups"
New-Item -ItemType Directory -Force -Path $dir | Out-Null
$out = Join-Path $dir "cmms_${ts}.sql"
Write-Host "-> pg_dump a $out ..."
docker exec cmms-postgres pg_dump -U postgres cmms | Set-Content -Path $out -Encoding utf8
# rotación simple: conserva últimos 14
Get-ChildItem $dir -Filter "cmms_*.sql" | Sort-Object LastWriteTime -Descending | Select-Object -Skip 14 | Remove-Item -Force
Write-Host "OK: $out ($((Get-Item $out).Length/1KB) KB)"
