@echo off
chcp 65001 >nul
title DEPLOY LEN SANVIETTHANG.WEB.APP
color 0A

echo ========================================================
echo       DONG BO LEN GOOGLE FIREBASE HOSTING
echo       Web: https://sanvietthang.web.app
echo ========================================================
echo.

cd /d "D:\viet thang"

echo [1/2] Dong bo index.html sang thu muc public...
copy /y index.html public\index.html >nul
copy /y vietthang-cloud-config.json public\vietthang-cloud-config.json >nul

echo [2/2] Dang tai len Google Firebase Hosting (sanvietthang.web.app)...
cmd /c "npx firebase-tools deploy --project sanvietthang --only hosting --account o936315009@gmail.com"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo   [THANH CONG] Da cap nhat web thanh cong tai:
    echo   👉 https://sanvietthang.web.app
    echo ========================================================
) else (
    echo.
    echo [LOI] Co loi khi tai len. Vui long kiem tra ket noi mang.
)

pause
