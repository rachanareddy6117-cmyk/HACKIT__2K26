# EchoSign Unified Full-Stack Platform Runner
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  EchoSign: Multi-Modal Sign Language & AAC Platform" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# Check Node
$nodeVer = node -v 2>$null
if (-not $nodeVer) {
    Write-Host "[ERROR] Node.js is not found on PATH." -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Node.js detected: $nodeVer" -ForegroundColor Green
Write-Host "[INFO] Starting Backend (Port 5001) and Frontend (Port 5173)..." -ForegroundColor Yellow
Write-Host ""

npm run dev
