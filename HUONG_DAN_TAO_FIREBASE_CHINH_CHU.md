# HƯỚNG DẪN TẠO MÁY CHỦ GOOGLE FIREBASE CHÍNH CHỦ CHO SÂN VIỆT THẮNG
*(Dành riêng cho tài khoản của Chủ Sân • Miễn phí trọn đời • Độc lập 100%)*

---

Chỉ mất đúng **1 - 2 phút** để bạn sở hữu một máy chủ đám mây Google chính chủ mang tên riêng **`vietthang-badminton`**, không dính líu đến bất kỳ ai:

### BƯỚC 1: Đăng nhập Firebase Console
1. Mở trình duyệt và truy cập: 👉 **https://console.firebase.google.com**
2. Đăng nhập bằng tài khoản Google của bạn (ví dụ Gmail cá nhân hoặc tài khoản quản lý sân).

---

### BƯỚC 2: Thêm Dự Án Mới
1. Bấm vào nút **"Add project" (Thêm dự án)**.
2. Nhập tên dự án: **`vietthang-badminton`** (hoặc `san-vietthang`).
3. Bấm **Continue (Tiếp tục)** -> Tắt Google Analytics (để đỡ phức tạp) -> Bấm **Create project (Tạo dự án)**.
4. Đợi khoảng 10 giây cho Google khởi tạo xong -> Bấm **Continue**.

---

### BƯỚC 3: Tạo Cơ Sở Dữ Liệu Thời Gian Thực (Realtime Database)
1. Ở menu bên trái, tìm mục **Build** ➔ Chọn **Realtime Database**.
2. Bấm nút **"Create Database" (Tạo cơ sở dữ liệu)**.
3. Chọn vị trí máy chủ: `Singapore (asia-southeast1)` hoặc `United States` (mặc định) -> Bấm **Next**.
4. Ở màn hình bảo mật, chọn: **"Start in test mode" (Bắt đầu ở chế độ thử nghiệm)** -> Bấm **Enable**.
   *(Lúc này quy tắc đọc/ghi sẽ mở `read: true, write: true` để mọi máy tính và điện thoại đều đồng bộ được).*

---

### BƯỚC 4: Lấy Mã Cấu Hình & Dán Vào Ứng Dụng
1. Bấm vào biểu tượng **Bánh răng cài đặt ⚙️** (góc trên bên trái, cạnh dòng Project Overview) ➔ Chọn **Project settings (Cài đặt dự án)**.
2. Cuộn xuống dưới cùng ở mục **"Your apps" (Ứng dụng của bạn)** ➔ Bấm vào biểu tượng Web **`</>`**.
3. Đặt biệt danh ứng dụng: `vietthang-web` ➔ Bấm **Register app (Đăng ký ứng dụng)**.
4. Màn hình sẽ hiện ra đoạn mã cấu hình `firebaseConfig`:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "vietthang-badminton.firebaseapp.com",
  databaseURL: "https://vietthang-badminton-default-rtdb.firebaseio.com",
  projectId: "vietthang-badminton",
  storageBucket: "vietthang-badminton.firebasestorage.app",
  messagingSenderId: "...",
  appId: "..."
};
```
5. **Sao chép toàn bộ đoạn mã trên** ➔ Mở trang web **Sân Cầu Lông Thắng Pro**:
   - Vào menu **Cấu Hình** ➔ Chọn tab **4. Kết Nối Đám Mây**.
   - Dán vào ô văn bản ➔ Bấm **"LƯU & KẾT NỐI MÁY CHỦ RIÊNG"**!

---

### 🎉 HOÀN THÀNH: ĐỒNG BỘ CHO ĐIỆN THOẠI CHỈ VỚI 1 CLICK
Sau khi lưu xong trên máy tính:
- Bấm nút **"📋 SAO CHÉP LINK ZALO CHO ĐIỆN THOẠI"**.
- Gửi link đó qua Zalo cho điện thoại của bạn và nhân viên.
- Khi mở link trên điện thoại, hệ thống sẽ **tự động kết nối ngay lập tức**, không cần phải gõ hay làm lại bất kỳ thao tác nào trên điện thoại!
