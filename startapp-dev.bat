@echo off
set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

echo ===================================================
echo       NLTASK DESKTOP - DEVELOPMENT MODE
echo ===================================================
echo.

echo [1/2] Khoi dong Backend Server (Dev Mode)...
start "NLTASK Backend" cmd /k "cd /d %ROOT_DIR%backend && npm run dev"

echo [2/2] Khoi dong Tauri Desktop App (Hot Reload)...
cd /d "%ROOT_DIR%desktop"
npm run tauri dev
