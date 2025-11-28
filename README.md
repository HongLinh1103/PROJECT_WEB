# PROJECT_WEB — CleanAir (Demo cửa hàng máy lạnh)

Phiên bản demo của cửa hàng máy lạnh "CleanAir". Đây là một ứng dụng client-side (chạy trên trình duyệt) dùng để minh họa giao diện, luồng mua hàng cơ bản và một số tính năng tương tác (giỏ hàng, đặt hàng, chatbot tư vấn công suất). 
## Tổng Quan Dự Án
- Dữ liệu demo (sản phẩm, hình ảnh) được lưu trong file JS (`js/sanpham_array.js`). Trạng thái tạm thời (giỏ hàng, đơn hàng, người dùng) được lưu bằng `localStorage`/`sessionStorage` trên trình duyệt.
- Giao diện được phân tách theo trang trong `html/`, style trong `css/`, logic trong `js/`.

## Công Nghệ Sử Dụng

- Front-End:
	- HTML5, CSS3 (responsive), JavaScript (ES6+), jQuery 3.6.
	- Tổ chức CSS theo file: `style.css`, `header.css`, `modal.css`, các file theo trang.
	- Module JS nhỏ gọn cho từng trang (dùng ES modules ở một vài file).

- Back-End (nếu có):
	- Hiện tại không có backend; nhưng mã được thiết kế để dễ tích hợp API sau này: việc lưu/đọc dữ liệu có thể được thay thế bằng các cuộc gọi fetch tới REST API.

## Kiến Trúc Hệ Thống

- Mô hình: client-only (static site) với storage cục bộ.
	- `html/` — các trang giao diện (mỗi trang load CSS/JS tương ứng).
	- `css/`  — stylesheets chia theo component/page.
	- `js/`   — modules xử lý: dữ liệu mẫu, hiển thị sản phẩm, giỏ hàng, mua hàng, tài khoản, chatbot.
	- `img/`  — tài nguyên ảnh.

- Lưu trữ trạng thái:
	- `localStorage.dsGioSP` — mảng các giỏ hàng phân theo tài khoản (tendangnhap).
	- `localStorage.dsDonHang` — danh sách đơn hàng đã đặt.
	- `sessionStorage.MUA_NGAY_SP` — sản phẩm lưu tạm khi người dùng bấm "MUA NGAY".
	- `localStorage.tkDangnhap` / `localStorage.currentUser` — thông tin tài khoản demo.

- Luồng dữ liệu ngắn:
	1. Người dùng duyệt danh sách sản phẩm (JS lấy từ `sanpham_array.js`).
	2. Thêm vào giỏ hoặc MUA NGAY → JS cập nhật storage tương ứng.
	3. Thanh toán: trang `muahang.html` đọc `MUA_NGAY_SP` (nếu có) hoặc lấy dữ liệu từ `dsGioSP` và thực hiện lưu đơn vào `dsDonHang`.

## Thiết Kế Giao Diện (FE)

- Component chính:
	- Header (logo, tìm kiếm, menu, tài khoản, giỏ hàng).
	- Top navigation (thanh điều hướng theo trang).
	- Banner quảng cáo (ảnh lớn trên đầu trang).
	- Product card: ảnh, tên, giá, nút thêm giỏ.
	- Product detail: gallery, thông số, nút "THÊM VÀO GIỎ HÀNG" và "MUA NGAY".
	- Giỏ hàng / Checkout: sidebar thông tin khách hàng + danh sách sản phẩm.
	- Modal chung `#myModal` để zoom ảnh, thông báo, xác nhận.
	- Chatbot nổi (widget) để tư vấn công suất: `html/chatbot.html` + `js/chatbot.js`.

- Thiết kế responsive:
	- CSS sử dụng media queries để chuyển layout grid sang một cột trên mobile.
	- Các button và form control có kích thước chạm (touch-friendly).

- Quy ước load assets:
	- `jquery-3.6.0.min.js` được load trước các script dùng jQuery.
	- `sanpham_array.js` được load trước các script cần dữ liệu sản phẩm.

## Xử Lý Nghiệp Vụ

- Quản lý giỏ hàng (`js/giohang.js`, `js/chitietsanpham.js`):
	- Thêm/xóa/sửa số lượng, lưu theo user (key `dsGioSP` chứa object array phân theo `tendangnhap`).
	- Hỗ trợ thêm sản phẩm từ trang chi tiết hoặc từ danh sách sản phẩm.

- Mua hàng (`js/muahang.js`):
	- Hỗ trợ mua ngay (lưu `MUA_NGAY_SP` vào `sessionStorage`) và checkout một sản phẩm.
	- Validate form thông tin giao hàng, tạo đơn hàng và lưu vào `dsDonHang`.

- Quản lý tài khoản (`js/dangky.js`, `js/dangnhap.js`, `js/taikhoan.js`):
	- Đăng ký/đăng nhập mô phỏng, lưu thông tin vào `localStorage` (demo only).
	- Tương thích hai key: legacy `tkDangnhap` và `currentUser` để linh hoạt khi cập nhật dữ liệu.

- Chatbot (`js/chatbot.js`):
	- Widget client-side để ước lượng công suất điều hòa dựa trên diện tích, độ cao, số người, hướng nắng, thiết bị.

## Tính Năng Vượt Trội

- Chạy hoàn toàn phía client: dễ triển khai trên GitHub Pages hoặc server tĩnh.
- Mẫu giao diện đầy đủ các luồng mua hàng tiêu chuẩn (list → detail → cart → checkout).
- Modal dùng chung và component JS tái sử dụng giúp giảm trùng lặp code UI.
- Hỗ trợ "MUA NGAY" bằng `sessionStorage` để checkout 1 sản phẩm nhanh chóng.
- Chatbot tư vấn công suất tích hợp, tiện lợi cho người dùng khi chọn máy lạnh.

