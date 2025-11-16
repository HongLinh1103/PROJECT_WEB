# CleanAir - Trang demo cửa hàng tĩnh

Kho chứa này là một trang thương mại điện tử demo chạy hoàn toàn phía client cho cửa hàng máy lạnh "CleanAir". Dự án dùng HTML/CSS/JavaScript (jQuery) thuần và lưu trạng thái thời gian chạy trong bộ nhớ trình duyệt (localStorage / sessionStorage). Trang phù hợp để mở trực tiếp trong trình duyệt hoặc phục vụ bằng một web server tĩnh khi phát triển.

## Các ngôn ngữ / công nghệ được sử dụng

- HTML5: các trang tĩnh, semantic markup cơ bản.
- CSS3: stylesheets theo trang và chung; modal và responsive design sử dụng CSS thuần.
- JavaScript (ES6+) + jQuery: jQuery dùng rộng rãi cho DOM manipulation và event handling; một vài file dùng `type="module"` để import/ export (ví dụ `js/chitietsanpham.js` import `sanpham_array.js`).
- LocalStorage / SessionStorage: lưu trạng thái giỏ hàng, thông tin tài khoản, các đơn hàng; không có backend.
- Hình ảnh và tài nguyên tĩnh: thư mục `img/` chứa các ảnh demo.

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



## Các kỹ thuật JavaScript chính được áp dụng

- Event delegation: nhiều handler (ví dụ cho `.product` hoặc `.productThemGioHang`) được gán qua delegation để hỗ trợ DOM động.
- Quản lý state client-side: toàn bộ giỏ hàng và đơn hàng lưu trong `localStorage` (`dsGioSP`, `dsDonHang`) — code chịu trách nhiệm serialize/deserialize JSON.
- Xử lý tương thích key cũ/mới: mã kiểm tra `currentUser` và nếu cần chuyển đổi sang format legacy `tkDangnhap` để giữ tương thích giữa các module.
- Modal tái sử dụng: dùng một phần tử DOM `#myModal` với hai vùng nội dung (`#zoomContainer` / `#messageContainer`) và `.modal-footer` để JS chèn nội dung và nút hành động.
- Templating nhẹ: rendering danh sách sản phẩm, đơn hàng, bảng giỏ đều dùng string templates và jQuery `.append()` / `.html()`; đơn giản và hiệu quả cho trang tĩnh.
- Debounce / prevention patterns: tránh hành vi click kép bằng cờ `data('adding')` hoặc biến cục bộ `addingInProgress`.
- Event management: trước khi thêm listener mới, mã thường gọi `.off(...)` để tránh gán listener trùng lặp trên cùng một selector khi render lại.
- Parsing/format tiền tệ: hàm helper đơn giản (`phantachSoHangnghin`) để hiển thị số có dấu phân cách hàng nghìn; khi cần tính toán, code chuyển chuỗi sang số bằng regex để loại bỏ ký tự không phải chữ số.
- Module pattern nhẹ: một vài file xuất/nhập module (ES modules) để tổ chức code (ví dụ `sanpham_array.js` và `sanpham.js`), còn phần lớn mã vẫn dùng pattern script truyền thống.

Nếu bạn muốn, tôi có thể bổ sung đoạn mã mẫu (snippets) cho những kỹ thuật trên vào README — ví dụ: cách seed `localStorage`, ví dụ render đơn hàng, hoặc ví dụ event-delegation. Nói mình biết bạn cần gì tiếp theo.
