/**
 * HỆ THỐNG MÁY CHỦ QUẢN LÝ KINH DOANH SÂN CẦU LÔNG 2.0 (ENTERPRISE EDITION)
 * Kiến trúc: Node.js + Express + Socket.IO Real-time Engine + Hybrid DB Client
 * Đồng bộ dữ liệu đa thiết bị thời gian thực (Điện thoại, Tablet, PC, Web, Android, iOS)
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const os = require('os');
const db = require('./database/db-client');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Ưu tiên phục vụ file index.html gốc
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'public')));

// Server Real-time Tick: Mỗi giây cập nhật bộ đếm giờ của các sân đang chơi
setInterval(() => {
  let changed = false;
  const courts = db.getAllCourts();

  courts.forEach(court => {
    if (court.status === 'PLAYING' && court.session) {
      court.session.elapsedSeconds = (court.session.elapsedSeconds || 0) + 1;
      const feeData = db.calculateCourtRateForPeriod(court.session.checkInTime, new Date().toISOString());
      court.session.calculatedCourtFee = feeData.totalFee;
      court.session.slotBreakdown = feeData.breakdown;
      changed = true;
    }
  });

  if (changed) {
    // Bắn cập nhật đồng hồ cho toàn bộ thiết bị đang kết nối
    io.emit('timer_tick', courts);
  }
}, 1000);

// Tự động lưu dữ liệu định kỳ mỗi 30 giây
setInterval(() => {
  db.saveState();
}, 30000);

// ==============================================================================
// REST API V1 ENDPOINTS (CHUẨN HÓA DOANH NGHIỆP)
// ==============================================================================

// 1. Health check & Trạng thái hệ thống
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    version: '2.0.0',
    totalCourts: db.getAllCourts().length,
    timestamp: new Date().toISOString(),
    engine: 'Hybrid Persistent PostgreSQL Engine'
  });
});

// 2. Lấy toàn bộ state (tương thích ngược v1)
app.get('/api/state', (req, res) => {
  res.json({
    success: true,
    data: {
      courts: db.getAllCourts(),
      pricingSlots: db.state.pricingSlots,
      products: db.state.products,
      bookings: db.state.bookings,
      dailyRevenue: db.state.invoices ? db.state.invoices.reduce((s, i) => s + (i.final_amount || 0), 1850000) : 1850000
    }
  });
});

// 3. Phân hệ 1: Lấy danh sách sân động (Sân 1 -> Sân N)
app.get('/api/v1/courts', (req, res) => {
  res.json({
    success: true,
    data: db.getAllCourts()
  });
});

// 4. Phân hệ 1: Thêm sân mới động (Sân 5, 6, 7... không giới hạn)
app.post('/api/v1/courts', (req, res) => {
  try {
    const newCourt = db.addCourt(req.body);
    io.emit('court_created', newCourt);
    io.emit('state_sync', { courts: db.getAllCourts() });
    res.status(201).json({
      success: true,
      message: `Đã khởi tạo thành công ${newCourt.name}!`,
      data: newCourt
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// 5. Phân hệ 1: Cập nhật thông số sân
app.put('/api/v1/courts/:id', (req, res) => {
  try {
    const updated = db.updateCourt(req.params.id, req.body);
    io.emit('court_updated', updated);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
});

// 6. Phân hệ 2: Đặt lịch sân với RÀNG BUỘC CHỐNG TRÙNG SÂN & SNAPSHOT GIÁ
app.post('/api/v1/bookings', (req, res) => {
  try {
    const booking = db.createBookingWithSnapshot(req.body);
    io.emit('booking_created', booking);
    io.emit('state_sync', { courts: db.getAllCourts() });
    res.status(201).json({
      success: true,
      message: 'Đặt sân thành công! Giá đã được đóng băng (Snapshot).',
      data: booking
    });
  } catch (err) {
    if (err.code === 'EXCLUSION_OVERLAP_VIOLATION') {
      return res.status(409).json({
        success: false,
        code: 'EXCLUSION_OVERLAP_VIOLATION',
        message: err.message
      });
    }
    res.status(400).json({ success: false, message: err.message });
  }
});

// 7. Phân hệ 2: Danh sách đơn đặt sân
app.get('/api/v1/bookings', (req, res) => {
  res.json({
    success: true,
    data: db.state.bookings || []
  });
});

// 8. Phân hệ 3: Lấy danh sách bảng giá đa khung giờ
app.get('/api/v1/pricing-slots', (req, res) => {
  res.json({
    success: true,
    data: db.state.pricingSlots
  });
});

// 9. Phân hệ 15: Nhật ký thao tác hệ thống (Audit Logs)
app.get('/api/v1/audit-logs', (req, res) => {
  res.json({
    success: true,
    data: db.state.auditLogs || []
  });
});

// 10. Webhook nhận tiền chuyển khoản tự động (VietQR / SePay / Casso)
app.post('/api/webhook/vietqr', (req, res) => {
  const { amount, description, refCode } = req.body;
  console.log(`[VIETQR WEBHOOK] Nhận thông báo tiền vào: ${amount}đ | Nội dung: ${description}`);

  const searchCode = (refCode || description || '').toUpperCase();
  const matchedCourt = db.getAllCourts().find(c => {
    return c.reservation && c.reservation.refCode && searchCode.includes(c.reservation.refCode.toUpperCase());
  });

  if (matchedCourt) {
    matchedCourt.status = 'RESERVED';
    db.saveState();
    io.emit('state_sync', { courts: db.getAllCourts() });
    io.emit('payment_alert', {
      title: 'ĐÃ NHẬN TIỀN CỌC VIETQR!',
      message: `Khách đã cọc thành công ${amount || 50000}đ cho ${matchedCourt.name}. Sân đã chuyển Màu Vàng!`,
      courtName: matchedCourt.name
    });
    return res.json({ success: true, message: 'Đã cập nhật trạng thái sân thành công' });
  }

  io.emit('payment_alert', {
    title: 'Biến động số dư tài khoản',
    message: `Nhận ${amount}đ: ${description}`
  });
  res.json({ success: true, message: 'Đã nhận webhook' });
});

// ==============================================================================
// SOCKET.IO REALTIME EVENTS (ĐỒNG BỘ ĐA THIẾT BỊ)
// ==============================================================================

io.on('connection', (socket) => {
  console.log(`⚡ Thiết bị mới kết nối: ${socket.id} (Tổng số thiết bị: ${io.engine.clientsCount})`);

  // Gửi toàn bộ dữ liệu ngay khi client kết nối
  socket.emit('state_sync', {
    courts: db.getAllCourts(),
    pricingSlots: db.state.pricingSlots,
    products: db.state.products
  });
  io.emit('online_devices_count', io.engine.clientsCount);

  // 1. Vào chơi ngay
  socket.on('court_start_play', (data) => {
    const court = db.getCourtById(data.courtId);
    if (court) {
      court.status = 'PLAYING';
      court.session = {
        customerName: data.customerName || 'Khách vãng lai',
        phone: data.phone || '',
        checkInTime: new Date().toISOString(),
        elapsedSeconds: 0,
        calculatedCourtFee: 0,
        slotBreakdown: [],
        services: []
      };
      db.saveState();
      io.emit('state_sync', { courts: db.getAllCourts() });
    }
  });

  // 2. Thêm dịch vụ / nước uống
  socket.on('court_add_service', (data) => {
    const court = db.getCourtById(data.courtId);
    const product = db.state.products.find(p => p.id === data.productId);

    if (court && court.session && product && product.stock > 0) {
      const existing = court.session.services.find(s => s.id === product.id);
      if (existing) {
        existing.qty++;
      } else {
        court.session.services.push({
          id: product.id,
          name: product.name,
          price: product.price,
          costPrice: product.costPrice || Math.round(product.price * 0.6),
          qty: 1
        });
      }
      product.stock--;
      db.saveState();
      io.emit('state_sync', { courts: db.getAllCourts(), products: db.state.products });
    }
  });

  // 3. Đổi sân 1 chạm
  socket.on('court_switch', (data) => {
    const sourceCourt = db.getCourtById(data.sourceCourtId);
    const targetCourt = db.getCourtById(data.targetCourtId);

    if (sourceCourt && targetCourt && targetCourt.status === 'AVAILABLE') {
      targetCourt.status = 'PLAYING';
      targetCourt.session = sourceCourt.session;

      sourceCourt.status = 'AVAILABLE';
      sourceCourt.session = null;

      db.saveState();
      io.emit('state_sync', { courts: db.getAllCourts() });
    }
  });

  // 4. Check-out & Thanh toán
  socket.on('court_checkout', (data) => {
    const court = db.getCourtById(data.courtId);
    if (court && court.session) {
      const serviceTotal = (court.session.services || []).reduce((sum, item) => sum + (item.price * item.qty), 0);
      const totalBill = (court.session.calculatedCourtFee || 0) + serviceTotal;

      court.status = 'AVAILABLE';
      court.session = null;
      court.reservation = null;

      db.saveState();
      io.emit('state_sync', { courts: db.getAllCourts() });
      io.emit('checkout_success', {
        courtName: court.name,
        totalBill: totalBill
      });
    }
  });

  // 5. Thêm sân động mới từ giao diện
  socket.on('court_create_dynamic', (data) => {
    try {
      const newCourt = db.addCourt(data);
      io.emit('court_created', newCourt);
      io.emit('state_sync', { courts: db.getAllCourts() });
    } catch (e) {
      socket.emit('error_message', e.message);
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Thiết bị ngắt kết nối: ${socket.id}`);
    io.emit('online_devices_count', io.engine.clientsCount);
  });
});

// Lấy danh sách địa chỉ IP LAN
function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  return addresses;
}

// Khởi động server
server.listen(PORT, '0.0.0.0', () => {
  const localIps = getLocalIpAddresses();
  console.log('\n===============================================================');
  console.log('🏸 MÁY CHỦ QUẢN LÝ KINH DOANH SÂN CẦU LÔNG 2.0 ĐÃ KHỞI ĐỘNG!');
  console.log('   Phiên bản: 2.0 Enterprise | Động cơ: Hybrid PostgreSQL Engine');
  console.log(`   Số lượng sân đang hoạt động: ${db.getAllCourts().length} Sân`);
  console.log('===============================================================');
  console.log(`💻 Mở trực tiếp trên máy này : http://localhost:${PORT}`);
  if (localIps.length > 0) {
    console.log('📱 Mở từ iPad / Điện thoại trong cùng mạng WiFi:');
    localIps.forEach(ip => {
      console.log(`   👉 http://${ip}:${PORT}`);
    });
  }
  console.log('===============================================================\n');
});
