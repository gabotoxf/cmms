param([Parameter(Mandatory=$true)][string]$File)
# Uso: .\scripts\restore.ps1 .\backups\cmms_2026-09-22_1200.sql
$ErrorActionPreference = "Stop"
if (!(Test-Path $File)) { throw "No existe: $File" }
Write-Host "-> Restaurando $File a cmms-postgres (se reemplazará la BD)..."
Get-Content $File -Raw | docker exec -i cmms-postgres psql -U postgres -d cmms
Write-Host "OK: restaurado"
