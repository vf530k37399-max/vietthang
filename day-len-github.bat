@echo off
chcp 65001 >nul
title DONG BO DU LIEU LEN GITHUB - QUAN LY SAN CAU LONG
color 0A

echo ========================================================
echo       HE THONG DONG BO TU DONG LEN GITHUB PAGES
echo       Web: https://vf530k37399-max.github.io/vietthang/
echo ========================================================
echo.

cd /d D:\viet thang

echo [1/4] Dong bo giao dien cac thu muc...
if exist index.html (
    copy /y index.html public\index.html >nul
)

echo [2/4] Kiem tra cac thay doi moi nhat...
git add -A

echo [3/4] Ghi nhan thay doi...
git commit -m "Cap nhat tinh nang ke toan, ca sang va tai khoan chu san"

echo [4/4] Dang day du lieu len mang GitHub...
echo (Neu co cua so nho hien len hoi dang nhap, hay bam 'Sign in with your browser')
echo.

git push origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo   [THANH CONG] Du lieu da duoc day len GitHub thanh cong!
    echo   Trang web online se cap nhat sau khoang 30 giay tai:
    echo   https://vf530k37399-max.github.io/vietthang/
    echo ========================================================
) else (
    echo.
    echo ========================================================
    echo   [CHU Y] Co the can xac thuc tai khoan tren trinh duyet!
    echo   Vui long kiem tra cua so trinh duyet neu co thong bao.
    echo ========================================================
)

echo.
echo Nhan phim bat ky de thoat...
pause >nul