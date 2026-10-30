-- ==============================================================================
-- HỆ THỐNG QUẢN LÝ KINH DOANH SÂN CẦU LÔNG 2.0
-- DỮ LIỆU KHỞI TẠO BAN ĐẦU (SEEDS DATA)
-- ==============================================================================

-- 1. TẠO CƠ SỞ BAN ĐẦU
INSERT INTO branches (id, code, name, address, phone, bank_account_no, bank_name, bank_account_holder)
VALUES (
    'b0000000-0000-0000-0000-000000000001',
    'THANG_PRO_01',
    'SÂN CẦU LÔNG THẮNG PRO - CƠ SỞ 1',
    '45 Đường Cầu Lông, TP. Thủ Đức, TP. Hồ Chí Minh',
    '0988.777.666',
    '0988776655',
    'MB',
    'VIET THANG PRO'
) ON CONFLICT (code) DO NOTHING;

-- 2. TẠO 4 SÂN KHỞI ĐIỂM (CÓ THỂ MỞ RỘNG THÊM SÂN 5, 6, 7...)
INSERT INTO courts (id, branch_id, court_number, name, court_type, floor_material, lighting_quality, status)
VALUES 
(
    'c0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    1,
    'SÂN 1',
    'INDOOR',
    'PVC_MAT',
    'LED_PRO_400LUX',
    'AVAILABLE'
),
(
    'c0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000001',
    2,
    'SÂN 2',
    'INDOOR',
    'PVC_MAT',
    'LED_PRO_400LUX',
    'AVAILABLE'
),
(
    'c0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000001',
    3,
    'SÂN 3',
    'INDOOR',
    'PVC_MAT',
    'LED_PRO_400LUX',
    'AVAILABLE'
),
(
    'c0000000-0000-0000-0000-000000000004',
    'b0000000-0000-0000-0000-000000000001',
    4,
    'SÂN 4',
    'INDOOR',
    'PVC_MAT',
    'LED_PRO_400LUX',
    'AVAILABLE'
) ON CONFLICT (branch_id, court_number) DO NOTHING;

-- 3. CẤU HÌNH BẢNG GIÁ ĐA KHUNG GIỜ
INSERT INTO pricing_slot_templates (branch_id, slot_name, start_time, end_time, hourly_rate, is_holiday)
VALUES
('b0000000-0000-0000-0000-000000000001', 'Khung Giờ Sáng', '06:00:00', '14:00:00', 50000, FALSE),
('b0000000-0000-0000-0000-000000000001', 'Khung Giờ Chiều Thường', '14:00:00', '17:00:00', 60000, FALSE),
('b0000000-0000-0000-0000-000000000001', 'Khung Giờ Vàng (Cao Điểm)', '17:00:00', '22:00:00', 90000, FALSE),
('b0000000-0000-0000-0000-000000000001', 'Khung Giờ Đêm', '22:00:00', '24:00:00', 60000, FALSE);

-- 4. TÀI KHOẢN CHỦ SÂN TOÀN QUYỀN & NHÂN VIÊN CA
INSERT INTO staff_accounts (branch_id, username, password_hash, full_name, phone, role, permissions)
VALUES
(
    'b0000000-0000-0000-0000-000000000001',
    'admin',
    '123456', -- Trong môi trường thực tế hash bằng bcrypt
    'Chủ Sân Việt Thắng',
    '0988.777.666',
    'OWNER',
    '{
        "canManageCourts": true,
        "canCheckout": true,
        "canViewRevenue": true,
        "canManageInventory": true,
        "canManagePricing": true,
        "canManageMonthly": true
    }'
),
(
    'b0000000-0000-0000-0000-000000000001',
    'nhanvien1',
    '123',
    'Nhân Viên Ca Sáng',
    '0903.111.222',
    'STAFF',
    '{
        "canManageCourts": true,
        "canCheckout": true,
        "canViewRevenue": false,
        "canManageInventory": false,
        "canManagePricing": false,
        "canManageMonthly": true
    }'
) ON CONFLICT (username) DO NOTHING;

-- 5. DANH MỤC SẢN PHẨM SHOP & GIÁ VỐN (COGS)
INSERT INTO products (branch_id, sku, name, category, unit, cost_price, selling_price, current_stock, min_stock_alert)
VALUES
('b0000000-0000-0000-0000-000000000001', 'DRK-01', 'Revive chanh muối', 'Đồ uống', 'Chai', 9000, 15000, 35, 5),
('b0000000-0000-0000-0000-000000000001', 'DRK-02', 'Nước suối Aquafina 500ml', 'Đồ uống', 'Chai', 4000, 10000, 50, 10),
('b0000000-0000-0000-0000-000000000001', 'SHU-01', 'Quả cầu Hải Yến đỏ', 'Cầu lông', 'Quả', 18000, 25000, 24, 6),
('b0000000-0000-0000-0000-000000000001', 'ACC-01', 'Quấn cán vợt Yonex', 'Phụ kiện', 'Cái', 12000, 20000, 15, 3),
('b0000000-0000-0000-0000-000000000001', 'DRK-03', 'Nước tăng lực Redbull lon', 'Đồ uống', 'Lon', 11000, 18000, 20, 5),
('b0000000-0000-0000-0000-000000000001', 'SRV-01', 'Thuê vợt tập Pro', 'Dịch vụ', 'Cây/ca', 0, 30000, 10, 2);
