# HƯỚNG DẪN CHI TIẾT TRIỂN KHAI ỨNG DỤNG LÊN MẠNG INTERNET (ONLINE 24/7)

Hệ thống quản lý sân cầu lông của bạn đã được đóng gói sẵn sàng để đưa lên mạng Internet. Bạn có thể chọn **1 trong 2 cách** dưới đây tùy theo nhu cầu sử dụng:

---

## 🚀 CÁCH 1: LÊN MẠNG NGAY TRONG 30 GIÂY (DÙNG THỬ TRÊN ĐIỆN THOẠI QUA 4G/WIFI)
> **Ưu điểm:** Cực nhanh, miễn phí 100%, không cần đăng ký tài khoản gì cả, dùng chính máy tính của bạn làm server.

1. Vào thư mục `d:\viet thang\`
2. **Nhấp đúp chuột vào file `online-tunnel.bat`**
3. Cửa sổ dòng lệnh sẽ tự động khởi động server và cấp cho bạn 1 đường link công khai dạng:
   ```text
   your url is: https://funny-lemon-42.loca.lt
   ```
4. **Mở trên điện thoại qua 4G/WiFi:**
   - Nhập đường link đó vào trình duyệt điện thoại (Safari hoặc Chrome).
   - Nếu màn hình hiện trang chào của Localtunnel yêu cầu xác nhận `Endpoint IP`, bạn chỉ cần nhấn nút **"Click to Submit"** (hoặc nhập địa chỉ IP mạng của bạn) là sẽ vào thẳng ứng dụng!
   - Bây giờ bạn có thể thao tác trên điện thoại và thấy màn hình máy tính nhảy dữ liệu tức thì!

---

## 🌐 CÁCH 2: TRIỂN KHAI LÊN CLOUD CHẠY 24/7 VĨNH VIỄN (KHUYÊN DÙNG ĐỂ KINH DOANH)
> **Ưu điểm:** Chạy trên máy chủ đám mây độc lập, tắt máy tính ở nhà app vẫn chạy bình thường, có link cố định riêng (Ví dụ: `https://san-cau-long-thang-pro.onrender.com`), hoàn toàn miễn phí trên **Render.com**.

Dự án đã có sẵn file cấu hình chuẩn [`render.yaml`](render.yaml). Các bước thực hiện:

### Bước 1: Đăng ký tài khoản GitHub & Render (Miễn phí)
1. Đăng ký tài khoản tại [github.com](https://github.com) (nếu chưa có).
2. Đăng nhập vào [render.com](https://render.com) bằng tài khoản GitHub vừa tạo.

### Bước 2: Đưa mã nguồn lên GitHub
1. Cài đặt phần mềm trực quan **GitHub Desktop** tại: [desktop.github.com](https://desktop.github.com)
2. Mở GitHub Desktop $\rightarrow$ Chọn **"Add Existing Repository"** $\rightarrow$ Trỏ vào thư mục `d:\viet thang`.
3. Nhập tên kho lưu trữ (Ví dụ: `quan-ly-san-cau-long`) và bấm **"Publish repository"** để đẩy code lên GitHub.

### Bước 3: Triển khai 1-Click trên Render.com
1. Đăng nhập vào [Dashboard Render](https://dashboard.render.com/)
2. Nhấn nút **"New +"** ở góc trên bên phải $\rightarrow$ Chọn **"Blueprint"** (hoặc Web Service).
3. Chọn kho lưu trữ `quan-ly-san-cau-long` bạn vừa đẩy lên từ Bước 2.
4. Render sẽ tự động đọc file `render.yaml` và cấu hình:
   - **Môi trường:** Node.js
   - **Lệnh cài đặt:** `npm install`
   - **Lệnh khởi động:** `node server.js`
   - **Gói:** Miễn phí (Free)
5. Nhấn **"Apply"** hoặc **"Create Web Service"**.
6. Đợi khoảng 1 - 2 phút để máy chủ khởi tạo. Sau khi hoàn tất, Render sẽ cấp cho bạn một đường link HTTPS chính thức:
   👉 `https://san-cau-long-thang-pro.onrender.com`

---

## 📲 GẮN TÊN MIỀN RIÊNG CỦA SÂN (TÙY CHỌN NÂNG CAO)
Nếu bạn muốn dùng tên miền thương hiệu riêng của sân (Ví dụ: `sancaulongthangpro.vn` hoặc `datsan.com`):
1. Mua tên miền tại PA Việt Nam, Mắt Bão, Hostinger hoặc Cloudflare (~150k - 300k/năm).
2. Trong phần cài đặt của dịch vụ trên Render, chọn **Custom Domains** $\rightarrow$ Nhập tên miền của bạn $\rightarrow$ Trỏ bản ghi CNAME theo hướng dẫn.
3. Hệ thống sẽ tự động cấp chứng chỉ bảo mật HTTPS (ổ khóa xanh) hoàn toàn miễn phí.
