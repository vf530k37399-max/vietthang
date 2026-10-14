@echo off
chcp 65001 > nul
title HỆ THỐNG ĐƯA ỨNG DỤNG LÊN MẠNG INTERNET (PUBLIC HTTPS)
color 0B

echo ======================================================================
echo     🏸 HỆ THỐNG QUẢN LÝ SÂN CẦU LÔNG (SÂN 1 - SÂN 4)
echo     ĐƯA ỨNG DỤNG LÊN MẠNG INTERNET ĐỂ TRUY CẬP TỪ MỌI NƠI QUA 4G/WIFI
echo ======================================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [CẢNH BÁO] Máy tính chưa cài đặt Node.js! Vui lòng cài Node.js tại https://nodejs.org
    pause
    exit /b
)

:: Khởi động server trong cửa sổ riêng nếu chưa chạy
echo [1/2] Đang khởi động máy chủ Socket.IO trên máy của bạn...
start "Badminton Server" cmd /c "node server.js"

timeout /t 3 /nobreak > nul

echo.
echo [2/2] Đang tạo đường dẫn Public HTTPS trực tuyến trên Internet...
echo.
echo ======================================================================
echo  👉 ĐƯỜNG LINK ONLINE CỦA BẠN SẼ XUẤT HIỆN Ở BÊN DƯỚI:
echo  (Bạn có thể gửi link này cho nhân viên hoặc khách hàng truy cập bất kỳ đâu)
echo ======================================================================
echo.

npx --yes localtunnel --port 3000

pause
