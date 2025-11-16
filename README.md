# CleanAir - Trang demo cửa hàng tĩnh

Kho chứa này là một trang thương mại điện tử demo chạy hoàn toàn phía client cho cửa hàng máy lạnh "CleanAir". Dự án dùng HTML/CSS/JavaScript (jQuery) thuần và lưu trạng thái thời gian chạy trong bộ nhớ trình duyệt (localStorage / sessionStorage). Trang phù hợp để mở trực tiếp trong trình duyệt hoặc phục vụ bằng một web server tĩnh khi phát triển.

## Cấu trúc dự án

- `html/`                 -> Các trang HTML (trang chủ, danh sách sản phẩm, chi tiết sản phẩm, giỏ hàng, mua hàng, tài khoản, sitemap...)
- `css/`                  -> Các stylesheet (toàn trang và theo trang)
- `js/`                   -> Mã JavaScript (dùng jQuery cho DOM/DOM events)
- `img/`                  -> Ảnh tĩnh sử dụng trong site

Tập tin quan trọng
- `html/trangchu.html`        - Trang chủ
- `html/danhsachsanpham.html` - Danh sách sản phẩm
- `html/chitietsanpham.html`  - Trang chi tiết sản phẩm (dùng `js/chitietsanpham.js`)
- `html/giohang.html`         - Giỏ hàng / đặt hàng
- `html/donhangcuatoi.html`   - Trang "Đơn hàng của tôi" (đọc từ `localStorage.dsDonHang`)
- `js/sanpham.js`             - Hiệu ứng và handler cho danh sách sản phẩm
- `js/chitietsanpham.js`     - Logic trang chi tiết, thêm vào giỏ
- `js/giohang.js`             - Quản lý giỏ hàng và đặt hàng
- `css/modal.css`             - Style modal chung dùng trên nhiều trang

## Tính năng chính

- Trang tĩnh đa trang, sử dụng jQuery để tương tác phía client.
- Giỏ hàng lưu trên trình duyệt, phân theo tài khoản (localStorage).
- Sử dụng 1 modal hợp nhất (`#myModal`) cho zoom ảnh, thông báo thêm giỏ và xác nhận/hiện thị kết quả.
- Hỗ trợ hai dạng lưu trữ tài khoản: key cũ `tkDangnhap` và key mới `currentUser` (mã sẽ cố gắng chuyển đổi nếu cần).
- Trang "Đơn hàng của tôi" hiển thị các đơn được lưu trong `localStorage.dsDonHang`.
- Flow mua ngay (quick-buy) lưu tạm sản phẩm qua `sessionStorage` (`MUA_NGAY_SP`) để trang mua riêng (`muahang.html`) đọc.

## Các khóa lưu trong trình duyệt (local/session storage)

- `tkDangnhap` : object tài khoản dạng legacy (stringified)
- `currentUser`: object tài khoản dạng mới (stringified). Nếu có `currentUser` mà thiếu `tkDangnhap`, mã sẽ cố gắng tạo `tkDangnhap` tương thích.
- `dsGioSP`     : mảng giỏ hàng; mỗi phần tử có cấu trúc { tendangnhap: string, sanpham: [ { ten, gia, soluong, hinhanh } ] }
- `dsDonHang`   : mảng các đơn hàng đã đặt; mỗi đơn chứa id, user, items, total, createdAt
- `MUA_NGAY_SP` : sessionStorage key để lưu sản phẩm mua ngay (quick buy)
