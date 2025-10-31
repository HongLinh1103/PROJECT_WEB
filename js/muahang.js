$(window).ready(function () {
    // Read product prepared for quick-buy
    const prodRaw = sessionStorage.getItem('MUA_NGAY_SP')
    if (!prodRaw) {
        // No quick-buy product, show message and link to products
        $('main>div').empty()
        $('main>div').append(`
            <div style="text-align:center; padding:40px;">
                <h2>Không có sản phẩm để mua ngay</h2>
                <p>Vui lòng chọn sản phẩm từ <a href="danhsachsanpham.html">danh sách sản phẩm</a>.</p>
            </div>
        `)
        return
    }

    let objSP = null
    try { objSP = JSON.parse(prodRaw) } catch (e) { console.warn('invalid MUA_NGAY_SP', e); return }

    // helper: normalize image path like giohang.js
    function normalizeImagePath(src) {
        if (!src) return ''
        src = src.toString().trim()
        if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/')) return src
        if (src.startsWith('../')) return src
        if (src.startsWith('./img/')) return '../' + src.slice(2)
        if (src.startsWith('img/')) return '../' + src
        if (!src.includes('/')) return '../img/' + src
        return src
    }

    // Render the single product in the left column
    const imgPath = normalizeImagePath(objSP.hinhanh ? (Array.isArray(objSP.hinhanh) ? objSP.hinhanh[0] : objSP.hinhanh) : '')
    const productHtml = `
        <div class="sanpham">
            <div>
                <div class="imgSanPham"><img src="${imgPath}" alt="${objSP.ten || ''}"></div>
                <div class="tenSanPham"><h4>${objSP.ten}</h4></div>
                <div class="giaSanPham">${objSP.gia}<sup>đ</sup></div>
            </div>
            <div>
                <div class="soluongSanPham"><span>Số lượng: </span><div><button onclick="incrementQty()">-</button><span class="soluong">1</span><button onclick="incrementQty(true)">+</button></div></div>
            </div>
        </div>
    `
    $('#cacsanpham').html(productHtml)

    // Fill customer info if logged in (supports currentUser fallback)
    let taiKhoanDN = localStorage.getItem('tkDangnhap')
    if (!taiKhoanDN && localStorage.getItem('currentUser')) {
        try {
            const u = JSON.parse(localStorage.getItem('currentUser'))
            const legacy = {
                ten_dangnhap: u.username || u.ten_dangnhap || '',
                hoTen: u.fullname || u.hoTen || '',
                dienThoai: u.phone || u.dienThoai || '',
                diaChi: u.diaChi || '',
                gioiTinh: u.gioiTinh || ''
            }
            taiKhoanDN = JSON.stringify(legacy)
        } catch (e) { console.warn(e) }
    }

    if (taiKhoanDN) {
        try {
            const objTK = JSON.parse(taiKhoanDN)
            if (objTK.gioiTinh === 'Nữ') { $('#chi').prop('checked', true); $('#anh').prop('disabled', true) } else { $('#anh').prop('checked', true); $('#chi').prop('disabled', true) }
            $('#hovaten').val(objTK.hoTen || '')
            $('#sodienthoai').val(objTK.dienThoai || '')
            $('#diachi').val(objTK.diaChi || '')
        } catch (e) { console.warn('parse tkDangnhap', e) }
    }

    function parsePrice(str) {
        if (!str) return 0
        return parseInt(str.toString().replace(/[\.đ\s]/g, '')) || 0
    }

    function updateTotal() {
        const qty = parseInt($('.soluong').text()) || 1
        const priceNum = parsePrice(objSP.gia)
        const total = priceNum * qty
        // format with dots
        const s = total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
        $('#tongTien').text(s)
    }

    window.incrementQty = function (up) {
        const el = $('.soluong')
        let v = parseInt(el.text()) || 1
        if (up) v++
        else if (v > 1) v--
        el.text(v)
        updateTotal()
    }

    updateTotal()

    // Place order handler: similar to giohang.js but for single product
    $('#datHang').off('click').on('click', function () {
        // Ensure address is provided
        if ($('#diachi').val().trim() === '') { alert('Vui lòng nhập địa chỉ giao hàng!'); return }
        const xacnhan = confirm('Quý khách có chắc chắn muốn đặt sản phẩm này?')
        if (!xacnhan) return

        // Add to dsGioSP for continuity (optional)
        try {
            const dsGio = localStorage.getItem('dsGioSP')
            const objDS = dsGio ? JSON.parse(dsGio) : []
            // derive user
            let taiKhoan = localStorage.getItem('tkDangnhap')
            if (!taiKhoan && localStorage.getItem('currentUser')) {
                try {
                    const u = JSON.parse(localStorage.getItem('currentUser'))
                    const legacy = { ten_dangnhap: u.username || '', hoTen: u.fullname || '', dienThoai: u.phone || '', diaChi: u.diaChi || '' }
                    taiKhoan = JSON.stringify(legacy)
                } catch (e) {}
            }
            const userName = taiKhoan ? JSON.parse(taiKhoan).ten_dangnhap : ('guest_' + Date.now())
            // remove existing quickbuy for same user
            let cart = objDS.find(c => c.tendangnhap === userName)
            const item = { hinhanh: objSP.hinhanh ? (Array.isArray(objSP.hinhanh) ? objSP.hinhanh[0] : objSP.hinhanh) : '', ten: objSP.ten, gia: objSP.gia, soluong: parseInt($('.soluong').text()) }
            if (cart) {
                // push as separate or merge
                cart.sanpham.push(item)
            } else {
                objDS.push({ tendangnhap: userName, sanpham: [item] })
            }
            localStorage.setItem('dsGioSP', JSON.stringify(objDS))
        } catch (e) { console.warn(e) }

        // show simple thank you and clear quick-buy
        try {
            // prefer non-blocking toast if available
            if (typeof showToast === 'function') showToast('Đơn hàng đã được gửi. Cảm ơn bạn!', 1400)
            else alert('Đơn hàng đã được gửi. Cảm ơn bạn!')
        } catch (e) { alert('Đơn hàng đã được gửi. Cảm ơn bạn!') }
        sessionStorage.removeItem('MUA_NGAY_SP')
        // redirect back to homepage
        setTimeout(() => { window.location.href = 'trangchu.html' }, 900)
    })
})
