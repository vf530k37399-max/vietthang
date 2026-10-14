@echo off
chcp 65001 > nul
title CÀI ĐẶT TỰ ĐỘNG CHẠY HỆ THỐNG KHI MỞ MÁY TÍNH
color 0A

echo ======================================================================
echo     🏸 CÀI ĐẶT TỰ ĐỘNG BẬT MÁY CHỦ SÂN CẦU LÔNG KHI MỞ MÁY TÍNH
echo ======================================================================
echo.

set SCRIPT_DIR=%~dp0
set VBS_FILE=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\badminton_autostart.vbs

echo Đang tạo cấu hình tự khởi động cùng Windows...

(
echo Set WshShell = CreateObject^("WScript.Shell"^)
echo WshShell.CurrentDirectory = "%SCRIPT_DIR%"
echo WshShell.Run "cmd /c ""%SCRIPT_DIR%online-tunnel.bat""", 0, False
) > "%VBS_FILE%"

if exist "%VBS_FILE%" (
    echo.
    echo ✅ THÀNH CÔNG! 
    echo Từ nay, mỗi khi bạn bật máy tính lên, hệ thống sẽ tự động chạy ngầm
    echo và sẵn sàng phục vụ online 24/24 mà bạn không cần phải làm gì thêm!
    echo.
) else (
    echo ❌ Có lỗi xảy ra khi tạo cấu hình.
)

pause
