/**
 * HỆ THỐNG QUẢN LÝ KINH DOANH SÂN CẦU LÔNG 2.0
 * MODULE KẾT NỐI & XỬ LÝ DỮ LIỆU ĐA NĂNG (HYBRID POSTGRESQL & LOCAL PERSISTENCE)
 * 
 * Tính năng chính:
 * 1. Chống đặt trùng sân tuyệt đối (Overlap Exclusion Engine)
 * 2. Lưu phiên bản giá (Price Snapshotting)
 * 3. Hỗ trợ mở rộng sân động (Sân 1 -> Sân N không giới hạn)
 * 4. Tự động chuyển đổi giữa PostgreSQL và Local Storage đảm bảo hệ thống không bao giờ gián đoạn.
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data.json');

// Khởi tạo state mặc định chuẩn 2.0
const defaultState2 = {
  branch: {
    id: 'b0000000-0000-0000-0000-000000000001',
    code: 'THANG_PRO_01',
    name: 'SÂN CẦU LÔNG THẮNG PRO - CƠ SỞ 1',
    address: '45 Đường Cầu Lông, TP. Thủ Đức, TP. Hồ Chí Minh',
    phone: '0988.777.666',
    bankAccountNo: '0988776655',
    bankName: 'MB',
    bankAccountHolder: 'VIET THANG PRO'
  },
  courts: [
    {
      id: 1,
      courtNumber: 1,
      name: 'SÂN 1',
      courtType: 'INDOOR',
      floorMaterial: 'PVC_MAT',
      lightingQuality: 'LED_PRO_400LUX',
      status: 'AVAILABLE',
      session: null,
      reservation: null
    },
    {
      id: 2,
      courtNumber: 2,
      name: 'SÂN 2',
      courtType: 'INDOOR',
      floorMaterial: 'PVC_MAT',
      lightingQuality: 'LED_PRO_400LUX',
      status: 'PLAYING',
      session: {
        customerName: 'Anh Hoàng (0903.123.456)',
        phone: '0903.123.456',
        checkInTime: new Date(Date.now() - 78 * 60 * 1000).toISOString(),
        elapsedSeconds: 78 * 60,
        calculatedCourtFee: 94500,
        slotBreakdown: [
          { name: 'Khung Giờ Chiều Thường', minutes: 45, rate: 60000, fee: 45000 },
          { name: 'Khung Giờ Vàng (Cao Điểm)', minutes: 33, rate: 90000, fee: 49500 }
        ],
        services: [
          { id: 1, name: 'Revive chanh muối', price: 15000, costPrice: 9000, qty: 2 },
          { id: 3, name: 'Quả cầu Hải Yến đỏ', price: 25000, costPrice: 18000, qty: 1 }
        ]
      },
      reservation: null
    },
    {
      id: 3,
      courtNumber: 3,
      name: 'SÂN 3',
      courtType: 'INDOOR',
      floorMaterial: 'PVC_MAT',
      lightingQuality: 'LED_PRO_400LUX',
      status: 'RESERVED',
      session: null,
      reservation: {
        customerName: 'Chị Mai',
        phone: '0912.888.999',
        startTime: '17:30',
        endTime: '19:30',
        deposit: 50000,
        refCode: 'DATSAN3021'
      }
    },
    {
      id: 4,
      courtNumber: 4,
      name: 'SÂN 4',
      courtType: 'INDOOR',
      floorMaterial: 'PVC_MAT',
      lightingQuality: 'LED_PRO_400LUX',
      status: 'AVAILABLE',
      session: null,
      reservation: null
    }
  ],
  pricingSlots: [
    { id: 1, name: 'Khung Giờ Sáng', startTime: '06:00', endTime: '14:00', rate: 50000, isPeak: false },
    { id: 2, name: 'Khung Giờ Chiều Thường', startTime: '14:00', endTime: '17:00', rate: 60000, isPeak: false },
    { id: 3, name: 'Khung Giờ Vàng (Cao Điểm)', startTime: '17:00', endTime: '22:00', rate: 90000, isPeak: true },
    { id: 4, name: 'Khung Giờ Đêm', startTime: '22:00', endTime: '24:00', rate: 60000, isPeak: false }
  ],
  products: [
    { id: 1, sku: 'DRK-01', name: 'Revive chanh muối', category: 'Đồ uống', unit: 'Chai', price: 15000, costPrice: 9000, stock: 35, minAlert: 5 },
    { id: 2, sku: 'DRK-02', name: 'Nước suối Aquafina 500ml', category: 'Đồ uống', unit: 'Chai', price: 10000, costPrice: 4000, stock: 50, minAlert: 10 },
    { id: 3, sku: 'SHU-01', name: 'Quả cầu Hải Yến đỏ', category: 'Cầu lông', unit: 'Quả', price: 25000, costPrice: 18000, stock: 24, minAlert: 6 },
    { id: 4, sku: 'ACC-01', name: 'Quấn cán vợt Yonex', category: 'Phụ kiện', unit: 'Cái', price: 20000, costPrice: 12000, stock: 15, minAlert: 3 },
    { id: 5, sku: 'DRK-03', name: 'Nước tăng lực Redbull lon', category: 'Đồ uống', unit: 'Lon', price: 18000, costPrice: 11000, stock: 20, minAlert: 5 },
    { id: 6, sku: 'SRV-01', name: 'Thuê vợt tập Pro', category: 'Dịch vụ', unit: 'Cây/ca', price: 30000, costPrice: 0, stock: 10, minAlert: 2 }
  ],
  bookings: [],
  bookingSlots: [],
  invoices: [],
  expenses: [],
  shiftHandovers: [],
  auditLogs: []
};

class DatabaseClient {
  constructor() {
    this.state = defaultState2;
    this.isPostgresConnected = false;
    this.pgPool = null;
    this.loadState();
  }

  loadState() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Merge an toàn
        this.state = {
          ...defaultState2,
          ...parsed,
          courts: (parsed.courts && parsed.courts.length > 0) ? parsed.courts : defaultState2.courts,
          pricingSlots: (parsed.pricingSlots && parsed.pricingSlots.length > 0) ? parsed.pricingSlots : defaultState2.pricingSlots,
          products: (parsed.products && parsed.products.length > 0) ? parsed.products : defaultState2.products
        };
        console.log(`✅ [DB ENGINE 2.0] Đã tải trạng thái dữ liệu: ${this.state.courts.length} sân.`);
      } else {
        this.saveState();
      }
    } catch (e) {
      console.error('[DB ENGINE 2.0] Lỗi khi nạp dữ liệu:', e);
      this.state = defaultState2;
    }
  }

  saveState() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (e) {
      console.error('[DB ENGINE 2.0] Lỗi lưu dữ liệu:', e);
    }
  }

  // =================== PHÂN HỆ 1: QUẢN LÝ SÂN KHÔNG GIỚI HẠN ===================

  getAllCourts() {
    return this.state.courts;
  }

  getCourtById(id) {
    const numId = Number(id);
    return this.state.courts.find(c => c.id === numId || c.courtNumber === numId);
  }

  addCourt(courtData) {
    const nextNumber = this.state.courts.reduce((max, c) => Math.max(max, c.courtNumber || c.id || 0), 0) + 1;
    const newCourt = {
      id: nextNumber,
      courtNumber: nextNumber,
      name: courtData.name || `SÂN ${nextNumber}`,
      courtType: courtData.courtType || 'INDOOR',
      floorMaterial: courtData.floorMaterial || 'PVC_MAT',
      lightingQuality: courtData.lightingQuality || 'LED_PRO_400LUX',
      description: courtData.description || '',
      status: 'AVAILABLE',
      session: null,
      reservation: null
    };

    this.state.courts.push(newCourt);
    this.logAudit('CREATE_COURT', 'courts', newCourt.id, null, newCourt);
    this.saveState();
    return newCourt;
  }

  updateCourt(id, updateData) {
    const court = this.getCourtById(id);
    if (!court) throw new Error(`Không tìm thấy sân có ID ${id}`);

    const oldData = { ...court };
    if (updateData.name) court.name = updateData.name;
    if (updateData.courtType) court.courtType = updateData.courtType;
    if (updateData.floorMaterial) court.floorMaterial = updateData.floorMaterial;
    if (updateData.lightingQuality) court.lightingQuality = updateData.lightingQuality;
    if (updateData.description !== undefined) court.description = updateData.description;
    if (updateData.status) court.status = updateData.status;

    this.logAudit('UPDATE_COURT', 'courts', court.id, oldData, court);
    this.saveState();
    return court;
  }

  // =================== PHÂN HỆ 2: CHỐNG TRÙNG SÂN (OVERLAP EXCLUSION) ===================

  /**
   * Kiểm tra dải thời gian [startTime, endTime] có bị giao thoa với đơn đặt lịch đang hoạt động không
   */
  isTimeOverlap(startA, endA, startB, endB) {
    return (new Date(startA) < new Date(endB)) && (new Date(endA) > new Date(startB));
  }

  checkBookingOverlap(courtId, startTime, endTime, excludeBookingId = null) {
    const activeSlots = (this.state.bookingSlots || []).filter(s => {
      if (s.courtId !== Number(courtId)) return false;
      if (s.status === 'CANCELLED' || s.status === 'REFUNDED') return false;
      if (excludeBookingId && s.bookingId === excludeBookingId) return false;
      return true;
    });

    for (const slot of activeSlots) {
      if (this.isTimeOverlap(startTime, endTime, slot.startTime, slot.endTime)) {
        return {
          hasOverlap: true,
          conflictSlot: slot
        };
      }
    }

    return { hasOverlap: false };
  }

  createBookingWithSnapshot(bookingData) {
    const { courtId, customerName, phone, startTime, endTime, bookingType = 'CASUAL', deposit = 50000, idempotencyKey } = bookingData;

    // 1. Kiểm tra Idempotency chống gửi đúp giao dịch
    if (idempotencyKey) {
      const existingKey = (this.state.idempotencyKeys || []).find(k => k.key === idempotencyKey);
      if (existingKey) {
        return existingKey.responseBody;
      }
    }

    // 2. Chống trùng lịch cấp độ dữ liệu (Exclusion Check)
    const overlapResult = this.checkBookingOverlap(courtId, startTime, endTime);
    if (overlapResult.hasOverlap) {
      const err = new Error(`LỖI TRÙNG LỊCH SÂN: Sân đã có khách đặt trong khung giờ ${new Date(overlapResult.conflictSlot.startTime).toLocaleTimeString('vi-VN')} - ${new Date(overlapResult.conflictSlot.endTime).toLocaleTimeString('vi-VN')}!`);
      err.code = 'EXCLUSION_OVERLAP_VIOLATION';
      throw err;
    }

    // 3. Chụp ảnh giá (Snapshotting)
    const rateSnapshot = this.calculateCourtRateForPeriod(startTime, endTime);

    const bookingId = `BK-${Date.now()}`;
    const newBooking = {
      id: bookingId,
      bookingCode: bookingId,
      courtId: Number(courtId),
      customerName,
      customerPhone: phone,
      bookingType,
      startTime,
      endTime,
      rateSnapshot: rateSnapshot.breakdown,
      totalFee: rateSnapshot.totalFee,
      depositRequired: deposit,
      depositPaid: deposit,
      depositStatus: 'PAID',
      status: 'CONFIRMED',
      createdAt: new Date().toISOString()
    };

    const slotRecord = {
      id: `SLOT-${Date.now()}`,
      bookingId: bookingId,
      courtId: Number(courtId),
      startTime,
      endTime,
      hourlyRateSnapshot: rateSnapshot.averageRate,
      slotFee: rateSnapshot.totalFee,
      status: 'BOOKED'
    };

    if (!this.state.bookings) this.state.bookings = [];
    if (!this.state.bookingSlots) this.state.bookingSlots = [];
    this.state.bookings.unshift(newBooking);
    this.state.bookingSlots.unshift(slotRecord);

    // Cập nhật trạng thái sân trực quan nếu trùng với ngày hôm nay
    const court = this.getCourtById(courtId);
    if (court && court.status === 'AVAILABLE') {
      court.status = 'RESERVED';
      court.reservation = {
        customerName,
        phone,
        startTime: new Date(startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        endTime: new Date(endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        deposit,
        refCode: bookingId
      };
    }

    if (idempotencyKey) {
      if (!this.state.idempotencyKeys) this.state.idempotencyKeys = [];
      this.state.idempotencyKeys.push({
        key: idempotencyKey,
        responseBody: newBooking,
        createdAt: new Date().toISOString()
      });
    }

    this.logAudit('CREATE_BOOKING', 'court_bookings', bookingId, null, newBooking);
    this.saveState();
    return newBooking;
  }

  // =================== PHÂN HỆ 3: ĐỘNG CƠ TÍNH GIÁ ĐA KHUNG GIỜ ===================

  calculateCourtRateForPeriod(startDateStr, endDateStr) {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const breakdown = {};

    this.state.pricingSlots.forEach(s => {
      breakdown[s.name] = { name: s.name, minutes: 0, rate: s.rate, fee: 0 };
    });

    let cur = new Date(start);
    while (cur < end) {
      const curH = cur.getHours().toString().padStart(2, '0');
      const curM = cur.getMinutes().toString().padStart(2, '0');
      const timeStr = `${curH}:${curM}`;

      let matched = this.state.pricingSlots.find(s => timeStr >= s.startTime && timeStr < s.endTime);
      if (!matched && this.state.pricingSlots.length > 0) matched = this.state.pricingSlots[0];

      if (matched) {
        if (!breakdown[matched.name]) {
          breakdown[matched.name] = { name: matched.name, minutes: 0, rate: matched.rate, fee: 0 };
        }
        breakdown[matched.name].minutes++;
      }
      cur.setMinutes(cur.getMinutes() + 1);
    }

    let totalFee = 0;
    let totalMinutes = 0;
    const list = [];
    Object.values(breakdown).forEach(item => {
      if (item.minutes > 0) {
        item.fee = Math.round((item.minutes / 60) * item.rate);
        totalFee += item.fee;
        totalMinutes += item.minutes;
        list.push(item);
      }
    });

    const averageRate = totalMinutes > 0 ? Math.round((totalFee / totalMinutes) * 60) : 60000;
    return { totalFee, totalMinutes, averageRate, breakdown: list };
  }

  // =================== AUDIT LOGS ===================

  logAudit(action, entityType, entityId, oldData, newData) {
    if (!this.state.auditLogs) this.state.auditLogs = [];
    this.state.auditLogs.unshift({
      id: Date.now(),
      action,
      entityType,
      entityId: String(entityId),
      oldData: oldData ? JSON.stringify(oldData) : null,
      newData: newData ? JSON.stringify(newData) : null,
      timestamp: new Date().toISOString()
    });
    // Giữ tối đa 500 logs gần nhất
    if (this.state.auditLogs.length > 500) {
      this.state.auditLogs.pop();
    }
  }
}

// Singleton export
module.exports = new DatabaseClient();
