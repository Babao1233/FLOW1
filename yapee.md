# Yapee Vietnam - Nâng Tầm Cuộc Sống Hiện Đại

## Giới Thiệu Dự Án
Yapee Vietnam là một trang web thương mại điện tử tập trung vào các sản phẩm gia dụng thông minh, bao gồm thiết bị gia đình thông minh, quạt, máy sưởi, máy lọc không khí. Trang web cung cấp trải nghiệm người dùng linh hoạt với hỗ trợ chế độ tối (dark mode) và các chức năng quản lý tài khoản cơ bản.

### Sứ Mệnh
Tại Yapee Vietnam, sứ mệnh của chúng tôi là không ngừng tìm tòi, phát triển và cung cấp các sản phẩm công nghệ gia dụng thông minh, chất lượng cao với thiết kế tinh tế. Chúng tôi mong muốn mỗi sản phẩm không chỉ giải quyết các nhu cầu thiết thực mà còn mang lại trải nghiệm sống tốt đẹp hơn, tiện nghi hơn cho mỗi gia đình Việt.

### Tầm Nhìn
Yapee Vietnam hướng đến mục tiêu trở thành thương hiệu hàng đầu trong lĩnh vực thiết bị gia dụng thông minh tại Việt Nam và khu vực. Chúng tôi không chỉ tập trung vào việc cung cấp sản phẩm mà còn xây dựng một cộng đồng người dùng yêu thích công nghệ, chia sẻ kinh nghiệm và cùng nhau khám phá những tiện ích mà cuộc sống hiện đại mang lại. Tầm nhìn của chúng tôi là một tương lai nơi mọi ngôi nhà đều được trang bị những giải pháp thông minh từ Yapee, góp phần tạo nên một cuộc sống dễ dàng và hạnh phúc hơn.

## Công Nghệ Sử Dụng
- **React 18+**: Xây dựng giao diện tương tác động với component-based architecture (nếu áp dụng).
- **HTML5**: Cấu trúc cơ bản của các trang web.
- **TailwindCSS 3.0+**: Thiết kế giao diện responsive và linh hoạt.
- **Font Awesome 6.5.1**: Icon hỗ trợ các chức năng giao diện.
- **Google Fonts (Inter)**: Font chữ chính cho nội dung trang web.
- **JavaScript ES6+**: Xử lý logic dark mode (lưu/khôi phục trạng thái qua localStorage - file `dark-mode.js`), tương tác giỏ hàng (thêm sản phẩm, hiển thị thông báo toast - file `cart.js`), và các chức năng cơ bản.

## Cấu Trúc Thư Mục
```
flow/
├── src/                  # Thư mục chứa các component React (nếu áp dụng)
│   ├── components/       # Các component tái sử dụng (Header, Footer, ProductCard)
│   ├── pages/            # Các trang chính (Home, About, Account, Cart, Checkout)
│   └── utils/
│       ├── dark-mode.js  # Xử lý logic dark mode (lưu/khôi phục trạng thái qua localStorage)
│       └── cart.js       # Xử lý chức năng giỏ hàng (thêm sản phẩm, hiển thị thông báo toast)
├── public/
│   └── index.html        # Trang chủ (public version)
├── index.html            # Trang chủ chính
├── about.html            # Trang giới thiệu về chúng tôi (sứ mệnh, tầm nhìn)
├── account.html          # Trang quản lý tài khoản (lịch sử đơn hàng, cập nhật thông tin)
├── cart.html             # Trang hiển thị giỏ hàng và sản phẩm đã chọn
├── checkout.html         # Trang thanh toán đơn hàng
├── contact.html          # Trang liên hệ (thông tin cửa hàng, form liên hệ)
├── product-detail.html   # Trang chi tiết sản phẩm (mô tả, đánh giá, tùy chọn)
└── README.md             # Tài liệu hướng dẫn (File này)
```

## Chức Năng Chính
1. **Chế Độ Tối (Dark Mode)**: Hỗ trợ chuyển đổi giữa chế độ sáng/tối qua localStorage, đảm bảo trải nghiệm ổn định khi tải lại trang.
2. **Giao Diện Responsive**: Thiết kế đáp ứng với các kích thước màn hình (di động, tablet, desktop) nhờ TailwindCSS.
3. **Thông Báo Toast**: Hiển thị thông báo khi thêm sản phẩm vào giỏ hàng (ví dụ: "Đã thêm vào giỏ hàng!").
4. **Quản Lý Tài Khoản**: Trang `account.html` hỗ trợ xem lịch sử đơn hàng và cập nhật thông tin cá nhân.
5. **Giới Thiệu Dự Án**: Trang `about.html` cung cấp thông tin chi tiết về sứ mệnh, tầm nhìn và giá trị cốt lõi của Yapee Vietnam.
6. **Giỏ Hàng (cart.html)**: Hiển thị danh sách sản phẩm đã thêm, hỗ trợ cập nhật số lượng và xóa sản phẩm. Thông báo toast được kích hoạt khi thêm sản phẩm.
7. **Thanh Toán (checkout.html)**: Form nhập thông tin giao hàng, lựa chọn phương thức thanh toán (mockup).
8. **Liên Hệ (contact.html)**: Hiển thị thông tin địa chỉ, số điện thoại, email và form liên hệ (mockup).
9. **Chi Tiết Sản Phẩm (product-detail.html)**: Hiển thị mô tả chi tiết sản phẩm, hình ảnh, đánh giá người dùng, và tùy chọn mua hàng.

## Hướng Dẫn Cài Đặt
### Yêu Cầu Môi Trường
- Hệ điều hành Windows 10/11.
- Trình duyệt web modern (Chrome, Firefox, Edge, Safari) với JavaScript được bật (yêu cầu bắt buộc cho chức năng dark mode, giỏ hàng và tương tác).
- Công cụ giải nén (nếu cần): WinRAR, 7-Zip hoặc tiện ích tích hợp Windows.
- (Tùy chọn) Công cụ phát triển: Visual Studio Code (để sử dụng Live Server).

### Các Bước Khởi Động Dự Án (Windows)
1. **Tải mã nguồn**: Tải xuống toàn bộ mã nguồn dự án từ repository (ví dụ: GitHub) dưới dạng file `.zip`.
2. **Giải nén**: Di chuyển file `.zip` vừa tải về đến thư mục mong muốn, sau đó giải nén bằng công cụ giải nén (nhấn phải chuột vào file → chọn "Extract All").
3. **Mở thư mục dự án**: Sau khi giải nén, mở thư mục `flow` (thư mục gốc của dự án) bằng Windows Explorer.
4. **Chạy trang web**: 
   - **Cách 1 (Mở trực tiếp)**: Double-click vào file `index.html` (trang chủ) hoặc các file HTML khác (như `about.html`, `cart.html`) để mở trong trình duyệt.
   - **Cách 2 (Tùy chọn - Dùng Live Server)**: Mở thư mục `flow` bằng Visual Studio Code, cài đặt extension "Live Server" (nếu chưa có), sau đó click "Go Live" ở góc dưới bên phải cửa sổ VS Code. Trang web sẽ tự động mở trong trình duyệt với địa chỉ `http://localhost:5500` (hoặc cổng khác).

### Lưu Ý
- Dự án hiện tại là phiên bản tĩnh (static), không yêu cầu cài đặt backend hoặc cơ sở dữ liệu.
- Các chức năng như "Thêm vào giỏ hàng" và "Lịch sử đơn hàng" là mockup (mẫu), cần tích hợp backend để hoàn thiện.
- Nếu gặp lỗi giao diện không hiển thị đầy đủ, hãy kiểm tra lại JavaScript đã được bật trong trình duyệt (cài đặt → Bảo mật/Chế độ phát triển → Kích hoạt JavaScript).
- Live Server hỗ trợ tự động tải lại trang khi thay đổi file HTML/CSS/JS, cải thiện trải nghiệm phát triển.

## Hướng Dẫn Sử Dụng
### Chuyển Đổi Chế Độ Tối/Sáng
- Click vào nút toggle dark mode (thường ở góc trên cùng bên phải) để chuyển đổi giữa chế độ sáng và tối.
- Trạng thái sẽ được lưu trữ trong `localStorage` và khôi phục khi tải lại trang.

### Truy Cập Trang Tài Khoản
- Click vào liên kết "Tài Khoản" trên thanh điều hướng để chuyển đến trang `account.html`.
- Trang này hiển thị lịch sử đơn hàng gần đây và biểu mẫu cập nhật thông tin cá nhân.

### Xem Thông Tin Dự Án
- Click vào liên kết "Về Chúng Tôi" trên thanh điều hướng để truy cập trang `about.html` với nội dung giới thiệu chi tiết.

## Lưu Ý
- Dự án hiện tại là phiên bản tĩnh (static), không hỗ trợ kết nối với backend hoặc cơ sở dữ liệu.
- Các chức năng như "Thêm vào giỏ hàng" và "Lịch sử đơn hàng" hiện chỉ là mockup (mẫu), cần tích hợp backend để hoàn thiện.