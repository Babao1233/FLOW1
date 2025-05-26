# Yapee Vietnam - Smart Home Appliances

![Yapee Vietnam Logo](https://placehold.co/400x100?text=Yapee+Vietnam)

## Giới Thiệu

Yapee Vietnam là một nền tảng thương mại điện tử chuyên về thiết bị gia dụng thông minh, quạt, máy lọc không khí, máy sưởi và các sản phẩm công nghệ gia đình hiện đại. Dự án này bao gồm cả front-end và back-end, cho phép người dùng duyệt sản phẩm, tìm kiếm, quản lý giỏ hàng và tài khoản.

## Tính Năng Chính

- **Trang Chủ**: Hiển thị sản phẩm nổi bật, danh mục và đánh giá từ khách hàng
- **Danh Mục Sản Phẩm**: Duyệt sản phẩm theo danh mục, lọc và tìm kiếm
- **Chi Tiết Sản Phẩm**: Xem thông tin chi tiết, hình ảnh và đánh giá
- **Giỏ Hàng**: Thêm sản phẩm, cập nhật số lượng, xóa sản phẩm
- **Thanh Toán**: Quy trình thanh toán với thông tin giao hàng
- **Tài Khoản Người Dùng**: Đăng ký, đăng nhập, quản lý thông tin cá nhân
- **Chế Độ Tối/Sáng**: Thay đổi giao diện theo sở thích
- **Responsive Design**: Tương thích với máy tính, tablet và điện thoại

## Công Nghệ Sử Dụng

### Front-end
- HTML5, CSS3
- Tailwind CSS
- JavaScript (ES6+)
- Font Awesome (biểu tượng)
- Google Fonts (Inter)
- LocalStorage API

### Back-end
- Node.js
- Express.js
- PostgreSQL
- express-session & connect-pg-simple (quản lý phiên)
- bcryptjs (mã hóa mật khẩu)
- dotenv (quản lý biến môi trường)

## Cấu Trúc Dự Án

```
FLOW1/
├── css/                   # CSS styles
│   └── styles.css         # Stylesheet chính
├── js/                    # JavaScript client-side
│   ├── app.js             # Quản lý ứng dụng chính
│   ├── cart.js            # Xử lý giỏ hàng
│   ├── account-page.js    # Quản lý tài khoản người dùng
│   └── ...                # Các module JS khác
├── src/                   # Mã nguồn cấu trúc theo thành phần
│   ├── components/        # Các thành phần UI
│   ├── contexts/          # Context providers
│   ├── pages/             # Các component trang
│   └── data/              # Dữ liệu
├── public/                # Tài nguyên công khai
├── server.js              # Máy chủ Express
├── database.js            # Kết nối PostgreSQL
├── init-db.js             # Khởi tạo cơ sở dữ liệu
├── seed-db.js             # Dữ liệu mẫu
├── cleanup-db.js          # Dọn dẹp cơ sở dữ liệu
├── *.html                 # Các trang giao diện
└── package.json           # Cấu hình dự án và dependencies
```

## Cài Đặt và Chạy Dự Án

### Yêu Cầu Hệ Thống
- Node.js (v14.x hoặc cao hơn)
- PostgreSQL (v12.x hoặc cao hơn)

### Cài Đặt
1. **Clone hoặc tải về dự án**:
   ```bash
   git clone <repository-url>
   # hoặc giải nén từ file ZIP
   ```

2. **Cài đặt dependencies**:
   ```bash
   cd FLOW1
   npm install
   ```

3. **Thiết lập cơ sở dữ liệu**:
   - Tạo cơ sở dữ liệu PostgreSQL mới
   - Tạo file `.env` từ mẫu `.env.example` và cập nhật thông tin kết nối:
     ```
     DB_HOST=localhost
     DB_PORT=5432
     DB_NAME=yapee_db
     DB_USER=your_username
     DB_PASSWORD=your_password
     SESSION_SECRET=your_session_secret
     ```
   - Khởi tạo cơ sở dữ liệu:
     ```bash
     npm run init-db
     ```
   - Thêm dữ liệu mẫu:
     ```bash
     npm run seed-db
     ```

### Chạy Dự Án

#### Phương Pháp 1: Xem Tĩnh (Chỉ Front-end)
Double-click vào file `index.html` hoặc mở nó bằng trình duyệt web để xem giao diện tĩnh (không có tính năng back-end).

#### Phương Pháp 2: Chạy Đầy Đủ (Back-end và Front-end)
1. Khởi động server:
   ```bash
   npm start
   # hoặc
   npm run dev   # cho phát triển với hot-reload
   ```

2. Truy cập ứng dụng tại `http://localhost:3000`

## API Endpoints

### Xác Thực
- `POST /api/auth/register` - Đăng ký người dùng mới
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/status` - Kiểm tra trạng thái đăng nhập

### Sản Phẩm
- `GET /api/products` - Lấy danh sách sản phẩm (hỗ trợ query params: category, search)
- `GET /api/products/:id` - Lấy thông tin chi tiết sản phẩm

### Liên Hệ
- `POST /api/contact` - Gửi tin nhắn liên hệ

## Cấu Trúc Cơ Sở Dữ Liệu

### Bảng `users`
- `id` - serial primary key
- `username` - varchar(50) unique
- `email` - varchar(100) unique
- `password_hash` - varchar(100)
- `created_at` - timestamp

### Bảng `products`
- `id` - serial primary key
- `name` - varchar(100)
- `description` - text
- `price` - numeric(10,2)
- `salePrice` - numeric(10,2)
- `category` - varchar(50)
- `image` - varchar(255)
- `rating` - numeric(3,1)
- `stock` - integer
- `created_at` - timestamp

### Bảng `contacts`
- `id` - serial primary key
- `name` - varchar(100)
- `email` - varchar(100)
- `message` - text
- `created_at` - timestamp

### Bảng `user_sessions`
- `sid` - varchar primary key
- `sess` - json
- `expire` - timestamp

## Quản Lý State Client-side

Dự án sử dụng LocalStorage để quản lý:
- Giỏ hàng người dùng
- Chế độ tối/sáng
- Các tùy chọn người dùng khác

## Phát Triển

### Quy Trình Phát Triển
1. Fork hoặc clone dự án
2. Tạo nhánh feature mới (`git checkout -b feature/amazing-feature`)
3. Commit thay đổi (`git commit -m 'Add some amazing feature'`)
4. Push lên nhánh (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

### Quy Ước Mã Nguồn
- Sử dụng ES6+ cho JavaScript
- Tuân thủ cấu trúc module hiện có
- Kiểm tra lỗi và xử lý ngoại lệ đầy đủ
- Thêm comment cho code phức tạp

## Vấn Đề Đã Biết

- Chức năng thanh toán chưa tích hợp cổng thanh toán thực
- Chưa có tính năng đánh giá sản phẩm từ người dùng
- Chức năng đặt lại mật khẩu đang được phát triển

## Kế Hoạch Tương Lai

- Tích hợp cổng thanh toán (VNPay, Momo)
- Hệ thống đánh giá và bình luận sản phẩm
- Quản lý đơn hàng và theo dõi giao hàng
- Tối ưu hóa hiệu suất và SEO

## Đóng Góp

Chúng tôi hoan nghênh mọi đóng góp! Vui lòng đọc `CONTRIBUTING.md` để biết thêm chi tiết về quy trình đóng góp và phát triển.

## Giấy Phép

Dự án này được cấp phép theo [Giấy phép MIT](LICENSE).

## Liên Hệ

- Email: support@yapee.vn
- Website: [www.yapee.vn](https://www.yapee.vn)
- Địa chỉ: 123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh, Việt Nam

---

© 2025 Yapee Vietnam. All Rights Reserved.
