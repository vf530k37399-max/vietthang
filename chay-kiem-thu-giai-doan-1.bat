@echo off
chcp 65001 >nul
title KIEM THU NGHEP VU TU DONG GIAI DOAN 1 - HE THONG 2.0
color 0B

echo ========================================================
echo   BO KIEM THU NGHEP VU HE THONG QUAN LY SAN CAU LONG 2.0
echo   GIAI DOAN 1: NEN TANG CSDL, CHONG TRUNG SAN VA MO RONG
echo ========================================================
echo.

cd /d "D:\viet thang"
copy /y "%~f0" "%USERPROFILE%\Desktop\CHAY-KIEM-THU-GIAI-DOAN-1.bat" >nul 2>&1

if not exist "node_modules" (
    echo [THONG BAO] Dang kiem tra moi truong Node.js...
)

echo Dang tien hanh chay bo kiem thu tu dong...
echo.

node test-suite-giai-doan-1.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo   [XAC NHAN] 100%% CAC BAI KIEM THU GIAI DOAN 1 DA DAT!
    echo   San sang nghiem thu va tien hanh Giai doan 2.
    echo ========================================================
) else (
    echo.
    echo ========================================================
    echo   [CANH BAO] Co loi trong qua trinh kiem thu.
    echo ========================================================
)

echo.
echo Nhan phim bat ky de thoat...
pause >nul
