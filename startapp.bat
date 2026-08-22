@echo off
set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

echo ===================================================
echo             NLTASK DESKTOP APPLICATION
echo ===================================================
echo.

echo [1/2] Khoi dong Backend Server (Port 4000)...
start "NLTASK Backend" /min cmd /c "cd /d %ROOT_DIR%backend && npm start"

echo [2/2] Khoi dong NLTASK Desktop App...
if exist "%ROOT_DIR%desktop\src-tauri\target\release\nltask.exe" (
    echo    -> Mo ban Release: nltask.exe
    start "" "%ROOT_DIR%desktop\src-tauri\target\release\nltask.exe"
) else (
    echo    -> Mo che do Dev: npm run tauri dev
    start "NLTASK Desktop" cmd /c "cd /d %ROOT_DIR%desktop && npm run tauri dev"
)

echo.
echo ===================================================
echo Khoi dong thanh cong!
echo ===================================================
ping -n 3 127.0.0.1 > nul
