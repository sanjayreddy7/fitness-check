Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "     AI FITNESS ADVENTURE - FULL STACK APPLICATION      " -ForegroundColor Magenta
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Launching Backend API (Port 5000) & Frontend (Port 5173)...`n" -ForegroundColor Green

Set-Location -Path $PSScriptRoot
& npm.cmd start
