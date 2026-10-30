-- ==============================================================================
-- HỆ THỐNG QUẢN LÝ KINH DOANH SÂN CẦU LÔNG 2.0 (ENTERPRISE EDITION)
-- CƠ SỞ DỮ LIỆU POSTGRESQL 16 - SCHEMA DDL CHUẨN HÓA TOÀN DIỆN
-- Tác giả: Antigravity AI & Viet Thang Pro
-- ==============================================================================

-- 1. BẬT TIỆN ÍCH MỞ RỘNG (EXTENSIONS)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist"; -- Bắt buộc để chống trùng sân bằng EXCLUDE USING gist

-- ==============================================================================
-- PHÂN HỆ 1: CƠ SỞ & SÂN (HỖ TRỢ MỞ RỘNG ĐA CHI NHÁNH & SÂN KHÔNG GIỚI HẠN)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(30) UNIQUE NOT NULL,               -- Ví dụ: CS01, THANG_PRO_01
    name VARCHAR(150) NOT NULL,                      -- Sân Cầu Lông Thắng Pro - Cơ sở 1
    address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    bank_account_no VARCHAR(50),
    bank_name VARCHAR(50) DEFAULT 'MB',             -- MBBank, Vietcombank, Techcombank...
    bank_account_holder VARCHAR(100),
    status VARCHAR(20) DEFAULT 'ACTIVE',             -- ACTIVE, INACTIVE
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS courts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    court_number INT NOT NULL,                       -- 1, 2, 3, 4, 5, 6... (Không giới hạn)
    name VARCHAR(50) NOT NULL,                       -- SÂN 1, SÂN 2, SÂN VIP 5...
    court_type VARCHAR(30) DEFAULT 'INDOOR',         -- INDOOR (Trong nhà), OUTDOOR (Ngoài trời)
    floor_material VARCHAR(50) DEFAULT 'PVC_MAT',    -- PVC_MAT (Thảm sàn BWF), WOODEN (Sàn gỗ)
    lighting_quality VARCHAR(50) DEFAULT 'LED_PRO_400LUX',
    description TEXT,
    display_order INT DEFAULT 1,
    status VARCHAR(20) DEFAULT 'AVAILABLE',          -- AVAILABLE, PLAYING, RESERVED, FIXED, MAINTENANCE
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_branch_court_number UNIQUE (branch_id, court_number)
);

-- ==============================================================================
-- PHÂN HỆ 3: BẢNG GIÁ ĐA KHUNG GIỜ, NGÀY LỄ & ĐÓNG BĂNG GIÁ (SNAPSHOT)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS pricing_slot_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    court_id UUID REFERENCES courts(id) ON DELETE SET NULL, -- NULL nếu áp dụng chung toàn cơ sở
    slot_name VARCHAR(100) NOT NULL,                 -- Khung Giờ Sáng, Giờ Vàng Cao Điểm...
    start_time TIME NOT NULL,                        -- 06:00:00
    end_time TIME NOT NULL,                          -- 14:00:00
    days_of_week INT[] DEFAULT '{1,2,3,4,5,6,7}',    -- 1: T2 ... 7: CN
    is_holiday BOOLEAN DEFAULT FALSE,
    customer_tier VARCHAR(20) DEFAULT 'STANDARD',    -- STANDARD, VIP, MEMBER
    hourly_rate NUMERIC(12, 2) NOT NULL,             -- 50000, 60000, 90000
    version INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- PHÂN HỆ 7 & 13: KHÁCH HÀNG, HỘI VIÊN & NHÂN VIÊN PHÂN QUYỀN (RBAC)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    tier VARCHAR(20) DEFAULT 'STANDARD',             -- STANDARD, SILVER, GOLD, VIP
    deposit_balance NUMERIC(12, 2) DEFAULT 0,        -- Số dư cọc / ví trả trước
    total_played_hours NUMERIC(10, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS staff_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(30) DEFAULT 'STAFF',                -- OWNER (Chủ sân), MANAGER (Quản lý), STAFF (Thu ngân)
    permissions JSONB NOT NULL DEFAULT '{
        "canManageCourts": true,
        "canCheckout": true,
        "canViewRevenue": false,
        "canManageInventory": false,
        "canManagePricing": false,
        "canManageMonthly": true
    }',
    status VARCHAR(20) DEFAULT 'ACTIVE',             -- ACTIVE, LOCKED
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- PHÂN HỆ 2: ĐẶT LỊCH SÂN VỚI RÀNG BUỘC CHỐNG TRÙNG CẤP VẬT LÝ (EXCLUDE USING GIST)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS court_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_code VARCHAR(30) UNIQUE NOT NULL,        -- BK-YYYYMMDD-XXXX
    branch_id UUID NOT NULL REFERENCES branches(id),
    customer_id UUID REFERENCES customers(id),
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    booking_type VARCHAR(20) DEFAULT 'CASUAL',       -- CASUAL (Vãng lai), FIXED_MONTHLY (Lịch cố định tháng)
    total_court_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
    deposit_required NUMERIC(12, 2) NOT NULL DEFAULT 0,
    deposit_paid NUMERIC(12, 2) NOT NULL DEFAULT 0,
    deposit_status VARCHAR(20) DEFAULT 'PENDING',    -- PENDING, PAID, REFUNDED, FORFEITED
    status VARCHAR(20) DEFAULT 'CONFIRMED',          -- CONFIRMED, CHECKED_IN, COMPLETED, CANCELLED
    notes TEXT,
    created_by UUID REFERENCES staff_accounts(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS court_booking_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES court_bookings(id) ON DELETE CASCADE,
    court_id UUID NOT NULL REFERENCES courts(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    time_range TSTZRANGE GENERATED ALWAYS AS (tstzrange(start_time, end_time, '[)')) STORED,
    hourly_rate_snapshot NUMERIC(12, 2) NOT NULL,   -- Giá đóng băng bất biến tại thời điểm đặt
    slot_fee NUMERIC(12, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'BOOKED',            -- BOOKED, CHECKED_IN, FINISHED, CANCELLED
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT check_valid_slot_time CHECK (end_time > start_time),
    -- RÀNG BUỘC CỐT LÕI: Chống đặt trùng sân tuyệt đối
    CONSTRAINT prevent_court_overlap_booking EXCLUDE USING gist (
        court_id WITH =,
        time_range WITH &&
    ) WHERE (status NOT IN ('CANCELLED', 'REFUNDED'))
);

-- ==============================================================================
-- PHÂN HỆ 4: CHECK-IN & PHIÊN CHƠI THỰC TẾ (SESSIONS)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS court_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    court_id UUID NOT NULL REFERENCES courts(id),
    booking_id UUID REFERENCES court_bookings(id),
    booking_slot_id UUID REFERENCES court_booking_slots(id),
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20),
    check_in_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    check_out_time TIMESTAMPTZ,
    actual_duration_seconds INT DEFAULT 0,
    calculated_court_fee NUMERIC(12, 2) DEFAULT 0,
    services_fee NUMERIC(12, 2) DEFAULT 0,
    total_amount NUMERIC(12, 2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'IN_PROGRESS',        -- IN_PROGRESS, COMPLETED, SWITCHED
    cashier_id UUID REFERENCES staff_accounts(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- PHÂN HỆ 5 & 6: SẢN PHẨM, KHO HÀNG (COGS) & DỊCH VỤ SÂN
-- ==============================================================================

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES branches(id),
    sku VARCHAR(50),
    barcode VARCHAR(50),
    name VARCHAR(150) NOT NULL,                      -- Nước Pocari, Cầu Thành Lợi...
    category VARCHAR(50) NOT NULL,                   -- Đồ uống, Quả cầu, Phụ kiện, Dịch vụ
    unit VARCHAR(30) NOT NULL,                       -- Chai, Lon, Quả, Ống, Lượt
    cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0,    -- Giá vốn nhập hàng (COGS)
    selling_price NUMERIC(12, 2) NOT NULL DEFAULT 0, -- Giá bán lẻ
    current_stock INT NOT NULL DEFAULT 0,
    min_stock_alert INT DEFAULT 5,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS session_service_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES court_sessions(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    item_name VARCHAR(150) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(12, 2) NOT NULL,
    cost_price NUMERIC(12, 2) NOT NULL,              -- Snapshot giá vốn
    total_amount NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES branches(id),
    product_id UUID NOT NULL REFERENCES products(id),
    transaction_type VARCHAR(20) NOT NULL,           -- IMPORT (Nhập hàng), SALE (Bán lẻ), LOSS (Hư hỏng), ADJUST (Kiểm kho)
    quantity INT NOT NULL,
    unit_cost NUMERIC(12, 2) NOT NULL,
    reference_code VARCHAR(50),
    note TEXT,
    created_by UUID REFERENCES staff_accounts(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- PHÂN HỆ 8, 9, 10: HÓA ĐƠN, THANH TOÁN (VIETQR/TIỀN MẶT) & SỔ QUỸ THU CHI
-- ==============================================================================

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(30) UNIQUE NOT NULL,      -- INV-YYYYMMDD-XXXX
    branch_id UUID NOT NULL REFERENCES branches(id),
    session_id UUID REFERENCES court_sessions(id),
    customer_id UUID REFERENCES customers(id),
    customer_name VARCHAR(100),
    court_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
    services_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(12, 2) DEFAULT 0,
    deposit_deducted NUMERIC(12, 2) DEFAULT 0,
    final_amount NUMERIC(12, 2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL,             -- CASH, VIETQR, BANK_TRANSFER
    payment_status VARCHAR(20) DEFAULT 'PAID',       -- PAID, PENDING, DEBT
    shift_period VARCHAR(20) DEFAULT 'MORNING',      -- MORNING (Ca sáng), AFTERNOON (Ca chiều/tối)
    cashier_id UUID REFERENCES staff_accounts(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    item_name VARCHAR(150) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(12, 2) NOT NULL,
    cost_price NUMERIC(12, 2) NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    profit NUMERIC(12, 2) GENERATED ALWAYS AS (total_amount - (cost_price * quantity)) STORED
);

CREATE TABLE IF NOT EXISTS expense_vouchers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voucher_code VARCHAR(30) UNIQUE NOT NULL,        -- EXP-YYYYMMDD-XXXX
    branch_id UUID NOT NULL REFERENCES branches(id),
    court_id UUID REFERENCES courts(id),             -- Chi riêng cho sân nào (ví dụ sửa đèn Sân 3)
    category VARCHAR(50) NOT NULL,                   -- Sửa đèn LED, Thay lưới, Quạt, Điện nước, Vệ sinh
    amount NUMERIC(12, 2) NOT NULL,
    shift_period VARCHAR(20) DEFAULT 'MORNING',      -- MORNING, AFTERNOON
    recipient_name VARCHAR(100),
    note TEXT NOT NULL,
    created_by UUID REFERENCES staff_accounts(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shift_handovers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES branches(id),
    shift_name VARCHAR(50) NOT NULL,                 -- Ca Sáng (06h-12h), Ca Tối (12h-24h)
    handover_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    handover_staff_id UUID REFERENCES staff_accounts(id),
    receiving_staff_id UUID REFERENCES staff_accounts(id),
    total_court_count INT DEFAULT 0,
    system_court_revenue NUMERIC(12, 2) DEFAULT 0,
    system_shop_revenue NUMERIC(12, 2) DEFAULT 0,
    system_shop_cost NUMERIC(12, 2) DEFAULT 0,
    system_shop_profit NUMERIC(12, 2) DEFAULT 0,
    system_cash_amount NUMERIC(12, 2) DEFAULT 0,     -- Tiền mặt trong két quầy
    system_vietqr_amount NUMERIC(12, 2) DEFAULT 0,   -- Tiền chuyển khoản VietQR
    total_maintenance_expenses NUMERIC(12, 2) DEFAULT 0, -- Chi phí bảo dưỡng ca này
    net_profit NUMERIC(12, 2) DEFAULT 0,             -- Lãi thực tế bỏ túi
    actual_cash_counted NUMERIC(12, 2) DEFAULT 0,
    cash_difference NUMERIC(12, 2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'CONFIRMED',
    notes TEXT
);

-- ==============================================================================
-- PHÂN HỆ 15 & 16: NHẬT KÝ HỆ THỐNG & CHỐNG TRÙNG GIAO DỊCH (IDEMPOTENCY KEY)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS idempotency_keys (
    key VARCHAR(100) PRIMARY KEY,
    request_path VARCHAR(200) NOT NULL,
    response_body JSONB NOT NULL,
    status_code INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours')
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    branch_id UUID,
    actor_id UUID REFERENCES staff_accounts(id),
    actor_name VARCHAR(100),
    action VARCHAR(50) NOT NULL,                     -- CREATE_COURT, BOOK_SLOT, OVERRIDE_PRICE...
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50),
    old_data JSONB,
    new_data JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- CHỈ MỤC (INDEXES) TỐI ƯU HIỆU NĂNG TRUY VẤN
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_courts_branch ON courts(branch_id);
CREATE INDEX IF NOT EXISTS idx_booking_slots_court_time ON court_booking_slots(court_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at);
CREATE INDEX IF NOT EXISTS idx_invoices_shift ON invoices(shift_period);
CREATE INDEX IF NOT EXISTS idx_expense_vouchers_court ON expense_vouchers(court_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id, created_at);
