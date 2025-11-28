$(window).ready(function () {

    // Lấy sản phẩm mua ngay từ session
    const prodRaw = sessionStorage.getItem('MUA_NGAY_SP')
    if (!prodRaw) {
        $('main>div').empty().append(`
            <div style="text-align:center; padding:40px;">
                <h2>Không có sản phẩm để mua ngay</h2>
                <p>Vui lòng chọn sản phẩm từ <a href="danhsachsanpham.html">danh sách sản phẩm</a>.</p>
            </div>
        `)
        return
    }

    let objSP = null
    try { objSP = JSON.parse(prodRaw) } catch (e) { console.warn('invalid MUA_NGAY_SP', e); return }

    // Chuẩn hoá đường dẫn ảnh giống giohang.js
    function normalizeImagePath(src) {
        if (!src) return ''
        src = src.toString().trim()
        if (src.startsWith('http') || src.startsWith('/') || src.startsWith('../')) return src
        if (src.startsWith('./img/')) return '../' + src.slice(2)
        if (src.startsWith('img/')) return '../' + src
        if (!src.includes('/')) return '../img/' + src
        return src
    }

    // Render sản phẩm vào cột trái
    const imgPath = normalizeImagePath(
        objSP.hinhanh ? (Array.isArray(objSP.hinhanh) ? objSP.hinhanh[0] : objSP.hinhanh) : ''
    )

    const productHtml = `
        <div class="sanpham">
            <div>
                <div class="imgSanPham">
                    <img src="${imgPath}" alt="${objSP.ten || ''}">
                </div>
                <div class="tenSanPham"><h4>${objSP.ten}</h4></div>
                <div class="giaSanPham">${objSP.gia}<sup>đ</sup></div>
            </div>
            <div>
                <div class="soluongSanPham">
                    <span>Số lượng: </span>
                    <div>
                        <button onclick="incrementQty()">-</button>
                        <span class="soluong">1</span>
                        <button onclick="incrementQty(true)">+</button>
                    </div>
                </div>
            </div>
        </div>
    `
    $('#cacsanpham').html(productHtml)

    // Lấy thông tin tài khoản (tương thích tkDangnhap + currentUser)
    let taiKhoanDN = localStorage.getItem('tkDangnhap')
    if (!taiKhoanDN && localStorage.getItem('currentUser')) {
        try {
            const u = JSON.parse(localStorage.getItem('currentUser'))
            taiKhoanDN = JSON.stringify({
                ten_dangnhap: u.username || u.ten_dangnhap || '',
                hoTen: u.fullname || u.hoTen || '',
                dienThoai: u.phone || u.dienThoai || '',
                diaChi: u.diaChi || '',
                gioiTinh: u.gioiTinh || ''
            })
        } catch (e) { console.warn(e) }
    }

    // Điền thông tin khách hàng
    if (taiKhoanDN) {
        try {
            const tk = JSON.parse(taiKhoanDN)
            if (tk.gioiTinh === 'Nữ') {
                $('#chi').prop('checked', true); $('#anh').prop('disabled', true)
            } else {
                $('#anh').prop('checked', true); $('#chi').prop('disabled', true)
            }
            $('#hovaten').val(tk.hoTen || '')
            $('#sodienthoai').val(tk.dienThoai || '')
            $('#diachi').val(tk.diaChi || '')
        } catch (e) { console.warn('parse tkDangnhap', e) }
    }

    // Parse giá dạng "1.234đ"
    function parsePrice(str) {
        if (!str) return 0
        return parseInt(str.toString().replace(/[\.đ\s]/g, '')) || 0
    }

    // Cập nhật tổng tiền
    function updateTotal() {
        const qty = parseInt($('.soluong').text()) || 1
        const price = parsePrice(objSP.gia)
        const total = price * qty
        $('#tongTien').text(total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'))
    }

    // Tăng/giảm số lượng
    window.incrementQty = function (up) {
        const el = $('.soluong')
        let v = parseInt(el.text()) || 1
        if (up) v++
        else if (v > 1) v--
        el.text(v)
        updateTotal()
    }

    updateTotal()

    // Đặt hàng – áp dụng cho mua ngay 1 sản phẩm
    $('#datHang').off('click').on('click', function () {

        if ($('#diachi').val().trim() === '') {
            alert('Vui lòng nhập địa chỉ giao hàng!')
            return
        }

        if (!confirm('Quý khách có chắc chắn muốn đặt sản phẩm này?')) return

        // Thêm vào dsGioSP để đồng bộ giỏ hàng nếu cần
        try {
            const dsGio = localStorage.getItem('dsGioSP')
            const objDS = dsGio ? JSON.parse(dsGio) : []

            let tk = localStorage.getItem('tkDangnhap')
            if (!tk && localStorage.getItem('currentUser')) {
                try {
                    const u = JSON.parse(localStorage.getItem('currentUser'))
                    tk = JSON.stringify({
                        ten_dangnhap: u.username || '',
                        hoTen: u.fullname || '',
                        dienThoai: u.phone || '',
                        diaChi: u.diaChi || ''
                    })
                } catch (e) { }
            }

            const userName = tk ? JSON.parse(tk).ten_dangnhap : ('guest_' + Date.now())
            const cart = objDS.find(c => c.tendangnhap === userName)

            const item = {
                hinhanh: Array.isArray(objSP.hinhanh) ? objSP.hinhanh[0] : objSP.hinhanh,
                ten: objSP.ten,
                gia: objSP.gia,
                soluong: parseInt($('.soluong').text())
            }

            if (cart) cart.sanpham.push(item)
            else objDS.push({ tendangnhap: userName, sanpham: [item] })

            localStorage.setItem('dsGioSP', JSON.stringify(objDS))
        } catch (e) { console.warn(e) }

        // Thông báo & chuyển trang
        try {
            if (typeof showToast === 'function') showToast('Đơn hàng đã được gửi. Cảm ơn bạn!', 1400)
            else alert('Đơn hàng đã được gửi. Cảm ơn bạn!')
        } catch (e) {
            alert('Đơn hàng đã được gửi. Cảm ơn bạn!')
        }

        sessionStorage.removeItem('MUA_NGAY_SP')
        setTimeout(() => { window.location.href = 'trangchu.html' }, 900)
    })
})
