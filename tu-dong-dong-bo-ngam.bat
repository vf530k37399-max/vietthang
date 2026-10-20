@echo off
chcp 65001 >nul
title TIEN TRINH TU DONG DONG BO GITHUB (CHAY NGAM)
color 0B

echo ========================================================
echo       DICH VU TU DONG DONG BO CODE LEN GITHUB
echo       Trang thai: Dang chay kiem tra moi 5 phut...
echo       (De cua so nay thu nho xuong thanh Taskbar)
echo ========================================================

cd /d D:\viet thang

:loop
echo [%date% %time%] Dang kiem tra thay doi...

REM Kiem tra xem co file nao thay doi khong
git status --porcelain > %temp%\git_status.tmp
set /p STATUS=<%temp%\git_status.tmp

if not %STATUS%==" (
 echo Phat hien co thay doi moi! Dang tu dong day len GitHub...
 if exist index.html (
 copy /y index.html public\index.html >nul
 )
 git add -A
 git commit -m "Tu dong cap nhat tinh nang ke toan va tai khoan chu san" >nul 2>&1
 git push origin main >nul 2>&1
 echo Da day len GitHub luc %time%!
) else (
 echo Khong co thay doi nao moi.
)

REM Doi 300 giay (5 phut)
timeout /t 300 /nobreak >nul
goto loop