@echo off
chcp 65001 > nul
title HỆ THỐNG QUẢN LÝ SÂN CẦU LÔNG (SÂN 1 - SÂN 4) - REALTIME SERVER
color 0A

echo ======================================================================
echo     🏸 HỆ THỐNG QUẢN LÝ SÂN CẦU LÔNG (SÂN 1 - SÂN 4) PRO
echo     ĐỒNG BỘ DỮ LIỆU ĐA THIẾT BỊ THỜI GIAN THỰC (REAL-TIME ONLINE)
echo ======================================================================
echo.

:: Kiểm tra Node.js đã cài chưa
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [CẢNH BÁO] Máy tính của bạn chưa cài Node.js!
    echo Đang mở trực tiếp giao diện ứng dụng trên trình duyệt web...
    start "" "index.html"
    pause
    exit /b
)

:: Kiểm tra thư mục node_modules
if not exist "node_modules\" (
    echo [1/2] Đang cài đặt thư viện cần thiết (Chỉ chạy lần đầu tiên)...
    call npm install
)

echo.
echo [2/2] Đang khởi động Máy Chủ Real-time WebSocket...
start "" "http://localhost:3000"
node server.js

pause
