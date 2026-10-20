/**
 * HỆ THỐNG MÁY CHỦ QUẢN LÝ SÂN CẦU LÔNG (SÂN 1 - SÂN 4)
 * Kiến trúc: Node.js + Express + Socket.IO Real-time Engine
 * Đồng bộ dữ liệu đa thiết bị thời gian thực (Điện thoại, Tablet, PC)
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(express.json());
// Ưu tiên phục vụ file index.html gốc
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'public')));

// Cấu hình bảng giá sân
const PRICING_CONFIG = {
  normalRatePerHour: 60000, // Trước 17h: 60.000đ/giờ
  peakRatePerHour: 90000,   // Sau 17h: 90.000đ/giờ
  peakStartHour: 17         // Mốc 17:00
};

// Dữ liệu mặc định ban đầu nếu chưa có file data.json
const defaultState = {
  dailyRevenue: 1850000,
  courts: [
    {
      id: 1,
      name: 'SÂN 1',
      status: 'AVAILABLE', // AVAILABLE, PLAYING, RESERVED, FIXED
      session: null,
      reservation: null,
      fixedSchedule: null
    },
    {
      id: 2,
      name: 'SÂN 2',
      status: 'PLAYING',
      session: {
        customerName: 'Anh Hoàng (0903.123.456)',
        checkInTime: new Date(Date.now() - 78 * 60 * 1000).toISOString(),
        elapsedSeconds: 78 * 60,
        normalMinutes: 45,
        peakMinutes: 33,
        normalFee: 45000,
        peakFee: 49500,
        calculatedCourtFee: 94500,
        services: [
          { id: 1, name: 'Revive chanh muối', price: 15000, qty: 2 },
          { id: 3, name: 'Quả cầu Hải Yến', price: 25000, qty: 1 }
        ]
      },
      reservation: null,
      fixedSchedule: null
    },
    {
      id: 3,
      name: 'SÂN 3',
      status: 'RESERVED',
      session: null,
      reservation: {
        customerName: 'Chị Mai',
        phone: '0912.888.999',
        startTime: '17:30',
        endTime: '19:30',
        deposit: 50000,
        refCode: 'DATSAN3021'
      },
      fixedSchedule: null
    },
    {
      id: 4,
      name: 'SÂN 4',
      status: 'FIXED',
      session: null,
      reservation: null,
      fixedSchedule: {
        groupName: 'CLB Cầu Lông Phong Trào',
        repName: 'Anh Hùng',
        phone: '0988.777.666',
        days: 'Thứ 2 - 4 - 6',
        startTime: '18:00',
        endTime: '20:00',
        paid: true
      }
    }
  ],
  products: [
    { id: 1, name: 'Revive chanh muối', unit: 'Chai', price: 15000, stock: 32, minAlert: 5 },
    { id: 2, name: 'Nước suối Aquafina', unit: 'Chai', price: 10000, stock: 45, minAlert: 10 },
    { id: 3, name: 'Quả cầu Hải Yến đỏ', unit: 'Quả', price: 25000, stock: 24, minAlert: 6 },
    { id: 4, name: 'Quấn cán vợt Yonex', unit: 'Cái', price: 20000, stock: 15, minAlert: 3 },
    { id: 5, name: 'Nước tăng lực Redbull', unit: 'Lon', price: 18000, stock: 20, minAlert: 5 },
    { id: 6, name: 'Thuê vợt tập Pro', unit: 'Cây/ca', price: 30000, stock: 8, minAlert: 2 }
  ],
  monthlyContracts: [
    {
      id: 1,
      courtName: 'SÂN 4',
      days: 'Thứ 2 - 4 - 6',
      groupName: 'CLB Cầu Lông Phong Trào',
      repName: 'Anh Hùng',
      phone: '0988.777.666',
      time: '18:00 - 20:00',
      totalSessions: 13,
      totalFund: 2340000,
      paid: true
    },
    {
      id: 2,
      courtName: 'SÂN 1',
      days: 'Thứ 3 - 5 - 7',
      groupName: 'Nhóm Thầy Cô Giáo',
      repName: 'Cô Lan',
      phone: '0909.111.222',
      time: '17:00 - 19:00',
      totalSessions: 12,
      totalFund: 2160000,
      paid: false
    }
  ]
};

// Đọc và ghi dữ liệu ra file data.json để lưu trữ lâu dài
let appState = defaultState;
function loadState() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      appState = JSON.parse(raw);
      console.log('✅ Đã nạp dữ liệu từ data.json thành công!');
    } else {
      saveState();
    }
  } catch (err) {
    console.error('Lỗi khi đọc file dữ liệu:', err);
    appState = defaultState;
  }
}

function saveState() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(appState, null, 2), 'utf-8');
  } catch (err) {
    console.error('Lỗi khi lưu file dữ liệu:', err);
  }
}

// Thuật toán tính tiền giờ sân theo phút & giờ vàng
function calculateCourtFee(checkInTimeStr) {
  const checkIn = new Date(checkInTimeStr);
  const now = new Date();
  let normalMinutes = 0;
  let peakMinutes = 0;

  let cur = new Date(checkIn);
  while (cur < now) {
    if (cur.getHours() >= PRICING_CONFIG.peakStartHour) {
      peakMinutes++;
    } else {
      normalMinutes++;
    }
    cur.setMinutes(cur.getMinutes() + 1);
  }

  const normalFee = Math.round((normalMinutes / 60) * PRICING_CONFIG.normalRatePerHour);
  const peakFee = Math.round((peakMinutes / 60) * PRICING_CONFIG.peakRatePerHour);
  const totalCourtFee = normalFee + peakFee;

  return { normalMinutes, peakMinutes, normalFee, peakFee, totalCourtFee };
}

// Server Real-time Tick: Mỗi giây cập nhật bộ đếm giờ của các sân đang chơi
setInterval(() => {
  let changed = false;
  appState.courts.forEach(court => {
    if (court.status === 'PLAYING' && court.session) {
      court.session.elapsedSeconds = (court.session.elapsedSeconds || 0) + 1;
      const feeData = calculateCourtFee(court.session.checkInTime);
      court.session.normalMinutes = feeData.normalMinutes;
      court.session.peakMinutes = feeData.peakMinutes;
      court.session.normalFee = feeData.normalFee;
      court.session.peakFee = feeData.peakFee;
      court.session.calculatedCourtFee = feeData.totalCourtFee;
      changed = true;
    }
  });

  if (changed) {
    // Bắn cập nhật đồng hồ cho toàn bộ thiết bị đang kết nối
    io.emit('timer_tick', appState.courts);
  }
}, 1000);

// Tự động lưu dữ liệu định kỳ mỗi 30 giây
setInterval(() => {
  saveState();
}, 30000);

// REST API Endpoints
app.get('/api/state', (req, res) => {
  res.json({ success: true, data: appState });
});

// Webhook nhận tiền chuyển khoản tự động (VietQR / SePay / Casso)
app.post('/api/webhook/vietqr', (req, res) => {
  const { amount, description, refCode } = req.body;
  console.log(`[VIETQR WEBHOOK] Nhận thông báo tiền vào: ${amount}đ | Nội dung: ${description}`);

  // Tìm kiếm sân tương ứng
  const searchCode = (refCode || description || '').toUpperCase();
  const matchedCourt = appState.courts.find(c => {
    return c.reservation && c.reservation.refCode && searchCode.includes(c.reservation.refCode.toUpperCase());
  });

  if (matchedCourt) {
    matchedCourt.status = 'RESERVED';
    saveState();
    io.emit('state_sync', appState);
    io.emit('payment_alert', {
      title: 'ĐÃ NHẬN TIỀN CỌC VIETQR!',
      message: `Khách đã cọc thành công ${amount || 50000}đ cho ${matchedCourt.name}. Sân đã chuyển Màu Vàng!`,
      courtName: matchedCourt.name
    });
    return res.json({ success: true, message: 'Đã cập nhật trạng thái sân thành công' });
  }

  // Trường hợp khách đặt online mới
  io.emit('payment_alert', {
    title: 'Biến động số dư tài khoản',
    message: `Nhận ${amount}đ: ${description}`
  });
  res.json({ success: true, message: 'Đã nhận webhook' });
});

// Socket.IO Realtime Connection Handling
io.on('connection', (socket) => {
  console.log(`⚡ Thiết bị mới kết nối: ${socket.id} (Tổng số thiết bị: ${io.engine.clientsCount})`);
  
  // Gửi toàn bộ dữ liệu ngay khi client kết nối
  socket.emit('state_sync', appState);
  io.emit('online_devices_count', io.engine.clientsCount);

  // 1. Vào chơi ngay
  socket.on('court_start_play', (data) => {
    const court = appState.courts.find(c => c.id === data.courtId);
    if (court) {
      court.status = 'PLAYING';
      court.session = {
        customerName: data.customerName || 'Khách vãng lai',
        phone: data.phone || '',
        checkInTime: new Date().toISOString(),
        elapsedSeconds: 0,
        normalMinutes: 0,
        peakMinutes: 0,
        normalFee: 0,
        peakFee: 0,
        calculatedCourtFee: 0,
        services: []
      };
      saveState();
      io.emit('state_sync', appState);
    }
  });

  // 2. Thêm dịch vụ / nước uống
  socket.on('court_add_service', (data) => {
    const court = appState.courts.find(c => c.id === data.courtId);
    const product = appState.products.find(p => p.id === data.productId);
    
    if (court && court.session && product && product.stock > 0) {
      const existing = court.session.services.find(s => s.id === product.id);
      if (existing) {
        existing.qty++;
      } else {
        court.session.services.push({
          id: product.id,
          name: product.name,
          price: product.price,
          qty: 1
        });
      }
      product.stock--; // Giảm tồn kho
      saveState();
      io.emit('state_sync', appState);
    }
  });

  // 3. Đổi sân
  socket.on('court_switch', (data) => {
    const sourceCourt = appState.courts.find(c => c.id === data.sourceCourtId);
    const targetCourt = appState.courts.find(c => c.id === data.targetCourtId);

    if (sourceCourt && targetCourt && targetCourt.status === 'AVAILABLE') {
      targetCourt.status = 'PLAYING';
      targetCourt.session = sourceCourt.session;

      sourceCourt.status = 'AVAILABLE';
      sourceCourt.session = null;

      saveState();
      io.emit('state_sync', appState);
    }
  });

  // 4. Check-out & Thanh toán
  socket.on('court_checkout', (data) => {
    const court = appState.courts.find(c => c.id === data.courtId);
    if (court && court.session) {
      const serviceTotal = court.session.services.reduce((sum, item) => sum + (item.price * item.qty), 0);
      const totalBill = (court.session.calculatedCourtFee || 0) + serviceTotal;

      appState.dailyRevenue += totalBill;
      court.status = 'AVAILABLE';
      court.session = null;
      court.reservation = null;

      saveState();
      io.emit('state_sync', appState);
      io.emit('checkout_success', {
        courtName: court.name,
        totalBill: totalBill
      });
    }
  });

  // 5. Khách đặt sân online & Quét VietQR
  socket.on('online_booking', (data) => {
    const court = appState.courts.find(c => c.id === data.courtId);
    if (court) {
      court.status = 'RESERVED';
      court.reservation = {
        customerName: data.name,
        phone: data.phone,
        startTime: data.startTime,
        endTime: data.endTime,
        deposit: 50000,
        refCode: data.refCode
      };
      saveState();
      io.emit('state_sync', appState);
      io.emit('payment_alert', {
        title: 'ĐƠN ĐẶT SÂN ONLINE MỚI!',
        message: `${data.name} (${data.phone}) vừa cọc ${court.name} khung giờ ${data.startTime}-${data.endTime}`,
        courtName: court.name
      });
    }
  });

  // 6. Check-in khách đã đặt trước (Vàng -> Đỏ)
  socket.on('court_checkin_reserved', (data) => {
    const court = appState.courts.find(c => c.id === data.courtId);
    if (court && court.status === 'RESERVED') {
      const res = court.reservation;
      court.status = 'PLAYING';
      court.session = {
        customerName: res ? res.customerName : 'Khách đặt trước',
        phone: res ? res.phone : '',
        checkInTime: new Date().toISOString(),
        elapsedSeconds: 0,
        normalMinutes: 0,
        peakMinutes: 0,
        normalFee: 0,
        peakFee: 0,
        calculatedCourtFee: 0,
        services: []
      };
      court.reservation = null;
      saveState();
      io.emit('state_sync', appState);
    }
  });

  // 7. Hủy buổi lẻ của khách quen (Tím -> Xanh online ngay)
  socket.on('court_cancel_single_session', (data) => {
    const court = appState.courts.find(c => c.id === data.courtId);
    if (court) {
      court.status = 'AVAILABLE';
      saveState();
      io.emit('state_sync', appState);
      io.emit('court_reopened', {
        message: `${court.name} vừa được mở lại trạng thái TRỐNG 🟢 để đón khách online!`,
        courtName: court.name
      });
    }
  });

  // 8. Điều chỉnh tồn kho
  socket.on('inventory_adjust', (data) => {
    const product = appState.products.find(p => p.id === data.productId);
    if (product) {
      product.stock = Math.max(0, product.stock + data.amount);
      saveState();
      io.emit('state_sync', appState);
    }
  });

  // 9. Cập nhật đóng quỹ hợp đồng tháng
  socket.on('contract_toggle_paid', (data) => {
    const contract = appState.monthlyContracts.find(c => c.id === data.contractId);
    if (contract) {
      contract.paid = !contract.paid;
      saveState();
      io.emit('state_sync', appState);
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Thiết bị ngắt kết nối: ${socket.id}`);
    io.emit('online_devices_count', io.engine.clientsCount);
  });
});

// Lấy danh sách địa chỉ IP LAN của máy tính
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
loadState();
server.listen(PORT, '0.0.0.0', () => {
  const localIps = getLocalIpAddresses();
  console.log('\n===============================================================');
  console.log('🏸 MÁY CHỦ QUẢN LÝ SÂN CẦU LÔNG (SÂN 1 - SÂN 4) ĐÃ SẴN SÀNG!');
  console.log('===============================================================');
  console.log(`💻 Mở trực tiếp trên máy này : http://localhost:${PORT}`);
  if (localIps.length > 0) {
    console.log('📱 Mở từ iPad / Điện thoại nhân viên & Khách hàng trong cùng mạng WiFi:');
    localIps.forEach(ip => {
      console.log(`   👉 http://${ip}:${PORT}`);
    });
  }
  console.log('===============================================================\n');
});
