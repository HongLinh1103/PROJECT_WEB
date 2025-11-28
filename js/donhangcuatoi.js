$(window).ready(function () {

    /* Lấy tài khoản đăng nhập từ localStorage.
       - Hỗ trợ cả cấu trúc cũ: tkDangnhap
       - Và cấu trúc mới: currentUser */
    function getLegacyTK() {
        let taiKhoan = localStorage.getItem('tkDangnhap')
        if (!taiKhoan && localStorage.getItem('currentUser')) {
            try {
                const u = JSON.parse(localStorage.getItem('currentUser'))
                const legacy = {
                    ten_dangnhap: u.username || u.ten_dangnhap || '',
                    hoTen: u.fullname || u.hoTen || ''
                }
                taiKhoan = JSON.stringify(legacy)
            } catch (e) {
                console.warn(e)
            }
        }
        return taiKhoan
    }

    // Chuẩn hoá key để so sánh username (xóa khoảng trắng, chuyển về lowercase)
    function normalizeKey(s) { return (s || '').toString().trim().toLowerCase() }

    // Format số thành tiền VND theo dạng 1.234.567
    function formatVND(num) {
        if (!num && num !== 0) return ''
        const s = (num || 0).toString()
        return s.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    }

    // Không có tài khoản → yêu cầu đăng nhập
    const taiKhoanRaw = getLegacyTK()
    if (!taiKhoanRaw) {
        $('#ordersContainer').html('<div class="no-orders">Bạn chưa đăng nhập. Vui lòng đăng nhập để xem đơn hàng.</div>')
        return
    }

    // Lấy tên đăng nhập để lọc đơn hàng
    let tenDN = ''
    try {
        tenDN = JSON.parse(taiKhoanRaw).ten_dangnhap || ''
    } catch (e) {
        console.warn('parse tkDangnhap', e)
    }

    // Lấy danh sách đơn hàng
    const dsDonHangRaw = localStorage.getItem('dsDonHang')
    if (!dsDonHangRaw) {
        $('#ordersContainer').html('<div class="no-orders">Chưa có đơn hàng nào.</div>')
        return
    }

    let ds = []
    try {
        ds = JSON.parse(dsDonHangRaw)
    } catch (e) {
        console.warn('parse dsDonHang', e)
        ds = []
    }

    // Lọc đơn hàng thuộc người dùng hiện tại
    const userKey = normalizeKey(tenDN)
    const myOrders = ds.filter(o => normalizeKey(o.user) === userKey)

    // Không có đơn hàng
    if (myOrders.length === 0) {
        $('#ordersContainer').html('<div class="no-orders">Bạn chưa có đơn hàng nào.</div>')
        return
    }

    // Render một đơn hàng thành HTML
    function renderOrder(o) {
        const created = o.createdAt ? new Date(o.createdAt).toLocaleString() : ''

        let html = '<div class="order-card">'
        html += '<div class="order-meta">'
        html += '<div><strong>Mã đơn:</strong> ' + (o.id || '') +
            ' <span style="color:#6b7280;margin-left:8px">' + created + '</span></div>'
        html += '<div><strong>Trạng thái:</strong> Đã đặt</div></div>'

        html += '<table class="order-items" width="100%">'
        html += '<thead><tr><th>Sản phẩm</th><th>Số lượng</th><th>Đơn giá</th><th>Tổng</th></tr></thead>'
        html += '<tbody>'

        let subtotal = 0

        // Duyệt từng sản phẩm
        for (let i = 0; i < (o.items || []).length; i++) {
            const it = o.items[i]
            const giaNum = parseInt(it.gia || 0) || 0
            const qty = parseInt(it.soluong || 1) || 1
            const line = giaNum * qty
            subtotal += line

            html += '<tr>'
            html += '<td>' + (it.ten || '') + '</td>'
            html += '<td>' + qty + '</td>'
            html += '<td>' + formatVND(giaNum) + '<sup>đ</sup></td>'
            html += '<td>' + formatVND(line) + '<sup>đ</sup></td>'
            html += '</tr>'
        }

        html += '</tbody></table>'
        html += '<div class="order-total">Tổng đơn hàng: ' +
            formatVND(o.total || subtotal) + '<sup>đ</sup></div>'
        html += '</div>'

        return html
    }

    // Sắp xếp đơn hàng mới → cũ, rồi render
    let out = ''
    myOrders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))

    for (let i = 0; i < myOrders.length; i++) {
        out += renderOrder(myOrders[i])
    }

    $('#ordersContainer').html(out)
})
