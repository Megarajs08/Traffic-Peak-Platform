$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

pnpm --dir artifacts/api-server run build | Out-Null

npx pm2 resurrect | Out-Null

function Test-Pm2ProcessRunning {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Name
  )

  $pidValue = (npx pm2 pid $Name).Trim()
  return ($pidValue -match "^[1-9][0-9]*$")
}

if (-not (Test-Pm2ProcessRunning -Name "traffic-peak-api")) {
  npx pm2 start ecosystem.config.cjs --only traffic-peak-api --update-env | Out-Null
} else {
  npx pm2 restart traffic-peak-api --update-env | Out-Null
}

if (-not (Test-Pm2ProcessRunning -Name "traffic-peak-frontend")) {
  npx pm2 start ecosystem.config.cjs --only traffic-peak-frontend --update-env | Out-Null
} else {
  npx pm2 restart traffic-peak-frontend --update-env | Out-Null
}

npx pm2 save | Out-Null

Write-Host "Local stack ready:"
Write-Host "- Frontend: http://localhost:3000"
Write-Host "- API: http://localhost:4000"
