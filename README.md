# HỆ THỐNG QUẢN LÝ SÂN CẦU LÔNG (SÂN 1 - SÂN 4) - REAL-TIME ONLINE

Ứng dụng Web Cloud-based điều hành trực quan toàn diện dành riêng cho mô hình 4 sân cầu lông, tích hợp **Đồng bộ Dữ liệu Trực Tuyến Thời Gian Thực (WebSocket Real-time)** giữa Nhân viên (Tablet/Phone), Khách hàng (Mobile Web) và Chủ sân (PC).

---

## 🚀 2 CÁCH KHỞI CHẠY ỨNG DỤNG

### Cách 1: Khởi Chạy Máy Chủ Real-time Đồng Bộ Đa Thiết Bị (Khuyên Dùng ⭐)
*Giúp iPad nhân viên tại sân, điện thoại của khách và máy tính của chủ sân cập nhật đồng bộ tức thì (< 20ms).*

1. Vào thư mục `d:\viet thang\`
2. **Nhấp đúp chuột vào file `start.bat`** (File sẽ tự động cài thư viện nếu chưa có, khởi động server và mở ngay trình duyệt).
3. Hoặc mở Terminal / CMD gõ:
   ```bash
   npm install
   npm start
   ```
4. **Truy cập:**
   - **Trên máy tính quầy lễ tân:** `http://localhost:3000`
   - **Trên iPad/Điện thoại nhân viên & Khách hàng trong cùng mạng WiFi:** Xem dòng địa chỉ IP hiển thị trên cửa sổ đen của Server (Ví dụ: `http://192.168.1.15:3000`).

---

### Cách 2: Mở Trực Tiếp Trên Trình Duyệt (Không Cần Cài Node.js)
- Chỉ cần nhấp đúp chuột vào file **`index.html`** để mở trên bất kỳ trình duyệt nào (Chrome, Edge, Cốc Cốc, Safari).
- Ứng dụng chạy mượt mà độc lập, đầy đủ tính năng tính giờ, tách bill, POS bán nước và in hóa đơn K80.

---

## ⚡ CƠ CHẾ ĐỒNG BỘ THỜI GIAN THỰC (REAL-TIME ONLINE)

1. **Đồng hồ đếm giờ chạy trên máy chủ (Server-side Tick):**
   - Bộ đếm giây của các sân đang chơi chạy tập trung trên máy chủ.
   - Dù nhân viên khóa màn hình iPad hay tắt trình duyệt mở lại, số phút và số tiền vẫn chính xác 100%.
2. **Khách cọc VietQR $\rightarrow$ Màn hình nhân viên nhảy Màu Vàng tức thì:**
   - Khi khách đặt lịch online và chuyển cọc, máy chủ tự động phát tín hiệu chuông *"Ting"* (âm thanh Web Audio) và chuyển Sân tương ứng sang **🟡 Màu Vàng (Chờ check-in)** trên toàn bộ thiết bị đang kết nối.
3. **Thao tác 1 chạm đổi sân, bán nước, trả sân:**
   - Nhân viên A bấm thêm 2 chai Revive trên iPad $\rightarrow$ Màn hình máy tính chủ sân lập tức cập nhật số lượng tồn kho giảm 2 và cộng tiền vào bill.
4. **Tính năng nhả sân khi khách quen hủy buổi lẻ:**
   - Nhân viên bấm "Hủy Buổi Lẻ" $\rightarrow$ Sân đổi ngay sang **🟢 Màu Xanh (Trống)** trên điện thoại của khách hàng trực tuyến để vợt khách mới ngay lập tức.
5. **Mã QR Cho Khách Quét Đặt Sân:**
   - Trên thanh tiêu đề có nút **"QR Cho Khách Quét"**: Bấm vào sẽ hiện mã QR dẫn thẳng đến giao diện đặt sân trên điện thoại của khách.

---

## 🧾 DANH SÁCH FILE TRONG DỰ ÁN

- **`server.js`**: Máy chủ Node.js + Express + Socket.IO xử lý thời gian thực, lưu trữ dữ liệu và nhận Webhook ngân hàng.
- **`public/index.html`**: Giao diện Web Client kết nối WebSocket tự động.
- **`index.html`**: Giao diện đa năng (chạy được cả qua server hoặc mở file trực tiếp).
- **`data.json`**: Cơ sở dữ liệu tự động lưu trạng thái sân, doanh thu, kho hàng và lịch đặt.
- **`start.bat`**: File chạy 1 chạm cho Windows.
- **`package.json`**: Cấu hình thư viện Node.js.
