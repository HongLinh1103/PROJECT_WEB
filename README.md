# CleanAir - Demo cửa hàng máy lạnh (Client-side)

Một trang thương mại điện tử demo cho cửa hàng máy lạnh "CleanAir". Toàn bộ ứng dụng chạy phía client (không có backend): các trang HTML tĩnh, CSS cho style, và JavaScript (kèm jQuery ở một số nơi) để xử lý tương tác, lưu trữ trạng thái (giỏ hàng, đơn hàng, người dùng) vào `localStorage`/`sessionStorage` của trình duyệt.

Mục tiêu: làm mẫu giao diện, luồng mua hàng cơ bản và các tính năng tương tác để dùng cho học tập hoặc demo trên web server tĩnh.

## Ngôn ngữ / Công nghệ

- HTML5: cấu trúc các trang tĩnh.
- CSS3: stylesheets theo trang và chung, responsive cơ bản.
- JavaScript (ES6+) và jQuery: tương tác DOM, xử lý form, render template đơn giản.
- LocalStorage / SessionStorage: lưu giỏ hàng, thông tin tài khoản, đơn hàng, quick-buy.
- Tài nguyên tĩnh: ảnh trong `img/`, file CSS/JS trong `css/` và `js/`.

## Cấu trúc dự án

- `html/`  — các trang HTML: `trangchu.html`, `danhsachsanpham.html`, `chitietsanpham.html`, `giohang.html`, `muahang.html`, `dangky.html`, `dangnhap.html`, `donhangcuatoi.html`, `sitemap.html`, ...
- `css/`   — stylesheet theo trang và chung (`main.css`, `header.css`, `modal.css`, ...).
- `js/`    — mã JavaScript xử lý UI/logic.
- `img/`   — ảnh demo sản phẩm và icon.
- `README.md` — tài liệu dự án (file này).

## Chức năng chính của các file (tóm tắt)

- `html/*.html` — các trang giao diện; JS sẽ render phần nội dung động (danh sách sản phẩm, giỏ hàng, đơn hàng) khi trang load.

- `css/*.css` — chứa style cho layout, modal, header, responsive. `modal.css` chứa style cho modal tái sử dụng.

- `js/sanpham_array.js` — dữ liệu mẫu: mảng sản phẩm để dùng cho render demo.

- `js/sanpham.js` — helper/utility để render card sản phẩm, format tiền, tạo markup cho danh sách.

- `js/danhsachsanpham.js` — xử lý trang danh sách sản phẩm: load data, lọc/sort, bắt sự kiện "Thêm vào giỏ".

- `js/chitietsanpham.js` — xử lý trang chi tiết sản phẩm: render chi tiết, gallery, thêm sản phẩm vào giỏ hoặc quick-buy.

- `js/giohang.js` — quản lý giỏ hàng: đọc/ghi `localStorage.dsGioSP`, chỉnh sửa số lượng, tính toán tổng, chuyển tới trang mua hàng.

- `js/muahang.js` — xử lý trang mua hàng: lấy dữ liệu từ giỏ hoặc `sessionStorage.MUA_NGAY_SP`, validate form, lưu đơn vào `localStorage.dsDonHang`.

- `js/donhangcuatoi.js` — hiển thị các đơn hàng của người dùng đang đăng nhập (lọc `localStorage.dsDonHang`).

- `js/dangky.js`, `js/dangnhap.js`, `js/taikhoan.js` — quản lý tài khoản: đăng ký, đăng nhập, lưu/đọc thông tin người dùng trong `localStorage` (keys: `tkDangnhap`, `currentUser`).

- `js/chatbot.js` & `html/chatbot.html` — widget tư vấn công suất nổi: `chatbot.html` chứa markup widget; `chatbot.js` fetch/insert markup, gán event và thực hiện phép tính ước lượng công suất dựa trên diện tích, độ cao trần, hướng nắng, số người, số thiết bị.

## Các key chính trong storage

- `currentUser` — object user hiện tại (stringified).
- `tkDangnhap` — key legacy (nếu có, mã cố gắng duy trì tương thích).
- `dsGioSP` — mảng giỏ hàng, phân theo `tendangnhap`.
- `dsDonHang` — mảng các đơn hàng đã tạo.
- `MUA_NGAY_SP` (sessionStorage) — chứa sản phẩm quick-buy.

## Nguyên lý hoạt động (tóm tắt kỹ thuật)

- Dữ liệu sản phẩm demo nằm trong `sanpham_array.js`. Khi người dùng thao tác (thêm giỏ, mua ngay), JS cập nhật `localStorage` hoặc `sessionStorage` tương ứng.
- Các trang render bằng cách lấy dữ liệu từ storage hoặc từ `sanpham_array.js` và build HTML bằng string templates + jQuery DOM APIs.
- Modal chung (`#myModal`) được dùng tái sử dụng cho nhiều mục đích (zoom ảnh, thông báo, xác nhận). JS chèn nội dung vào modal và hiển thị khi cần.
- Để tránh gán listener trùng, mã sử dụng event delegation và `.off()` trước khi gán lại listener cho các phần tử render lại.

