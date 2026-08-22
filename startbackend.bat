@echo off
set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%backend"
title NLTASK Backend Server (Port 4000)

echo ===================================================
echo             NLTASK BACKEND SERVER
echo ===================================================
echo.

echo Dang khoi dong Backend Server tai http://localhost:4000...
echo Bam Ctrl+C de dung server.
echo.

npm run dev
