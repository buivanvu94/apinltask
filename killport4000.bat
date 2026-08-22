@echo off
title NLTASK - Kill Port 4000

echo ===================================================
echo             KILL PROCESS ON PORT 4000
echo ===================================================
echo.

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :4000 ^| findstr LISTENING') do (
    echo Dang dung process PID: %%a...
    taskkill /F /PID %%a > nul 2>&1
)

echo Da giai phong port 4000 thanh cong!
ping -n 3 127.0.0.1 > nul
