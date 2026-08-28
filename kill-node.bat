@echo off
echo Mematikan semua proses Node.js yang sedang berjalan...
taskkill /F /IM node.exe /T 2>nul
if %errorlevel% equ 0 (
    echo ✓ Semua proses Node.js berhasil dihentikan
) else (
    echo ! Tidak ada proses Node.js yang berjalan
)
pause
