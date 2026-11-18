@echo off
chcp 65001 >nul
title DONG BO DU LIEU LEN SAN VIET THANG & GITHUB
color 0A

echo ========================================================
echo       HE THONG DONG BO TU DONG SAN VIET THANG
echo       Web 1: https://sanvietthang.web.app
echo       Web 2: https://vf530k37399-max.github.io/vietthang/
echo ========================================================
echo.

cd /d "D:\viet thang"

echo [1/3] Dong bo giao dien thu muc public...
copy /y index.html public\index.html >nul
copy /y vietthang-cloud-config.json public\vietthang-cloud-config.json >nul

echo [2/3] Day code len Google Firebase Hosting (sanvietthang.web.app)...
cmd /c "npx firebase-tools deploy --project sanvietthang --only hosting --account o936315009@gmail.com"

echo [3/3] Day code luu tru len GitHub...
git add -A
git commit -m "Cap nhat he thong sanvietthang.web.app"
git push origin main

echo.
echo ========================================================
echo   [HOAN TAT] Trang web da hoat dong truc tuyen 100% tai:
echo   👉 https://sanvietthang.web.app
echo ========================================================
echo.
pause
