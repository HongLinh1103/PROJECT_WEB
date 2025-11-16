$(window).ready(function () {
    const dsGio = localStorage.getItem("dsGioSP")
    // Hỗ trợ legacy 'tkDangnhap' và new 'currentUser'
    let taiKhoanDN = localStorage.getItem("tkDangnhap")
    if (!taiKhoanDN && localStorage.getItem('currentUser')) {
        try {
            const u = JSON.parse(localStorage.getItem('currentUser'));
            const legacy = {
                ten_dangnhap: u.username || u.ten_dangnhap || '',
                hoTen: u.fullname || u.hoTen || '',
                dienThoai: u.phone || u.dienThoai || '',
                diaChi: u.diaChi || '',
                gioiTinh: u.gioiTinh || ''
            };
            taiKhoanDN = JSON.stringify(legacy);
            localStorage.setItem('tkDangnhap', taiKhoanDN);
        } catch (e) { console.warn('Cannot derive tkDangnhap from currentUser', e); }
    }

    // Debug helper removed for production. (Panel was removed.)

    if (dsGio == null || taiKhoanDN == null) {
        xuLyGiohangRong()
        return
    } else {
        const objTKDN = JSON.parse(taiKhoanDN)
        const tenDN = objTKDN.ten_dangnhap
        const objDSGioSP = JSON.parse(dsGio)
        let gioRong = true
        // Try to find the cart matching the logged-in username. Use normalized comparison and fallbacks.
        function normalizeKey(s) {
            return (s || "").toString().trim().toLowerCase();
        }

        const normalizedTenDN = normalizeKey(tenDN);
        let matchedIndex = -1;

        for (let i = 0; i < objDSGioSP.length; i++) {
            const cartKey = normalizeKey(objDSGioSP[i].tendangnhap);
            if (cartKey === normalizedTenDN) {
                matchedIndex = i;
                break;
            }
        }

        // Fallback: if no exact username match, but current user full name matches a cart key, try that
        if (matchedIndex === -1 && objTKDN && objTKDN.hoTen) {
            const nameKey = normalizeKey(objTKDN.hoTen);
            for (let i = 0; i < objDSGioSP.length; i++) {
                if (normalizeKey(objDSGioSP[i].tendangnhap) === nameKey) { matchedIndex = i; break; }
            }
        }

        // Final fallback: if still not found and there's only one cart saved, use it
        if (matchedIndex === -1 && objDSGioSP.length === 1) matchedIndex = 0;

    // console.debug removed in production

        if (matchedIndex !== -1) {
            let divCacsanpham = $("<div></div>")
            divCacsanpham.attr("id", "cacsanpham")
            for (let j = 0; j < objDSGioSP[matchedIndex].sanpham.length; j++) {
                gioRong = false
                const imgPath = normalizeImagePath(objDSGioSP[matchedIndex].sanpham[j].hinhanh);
                let divSanpham = "<div class='sanpham'><div><div class='imgSanPham'><img src='" + imgPath + "' alt='" + (objDSGioSP[matchedIndex].sanpham[j].ten || '') + "'></div><div class='tenSanPham'><h4>" + objDSGioSP[matchedIndex].sanpham[j].ten + "</h4></div><div class='giaSanPham'>" + objDSGioSP[matchedIndex].sanpham[j].gia + "<sup>đ</sup></div></div><div><div class='xoaSanpham'><a onclick='xoaSanPham(" + matchedIndex + "," + j + ")'><span><i class='fa fa-delete-left'></i> Xóa</span></a></div><div class='soluongSanPham'><span>Số lượng: </span><div><button onclick='giamSoluong(" + matchedIndex + "," + j + ")'>-</button><span class='soluong'>" + objDSGioSP[matchedIndex].sanpham[j].soluong + "</span><button onclick='tangSoluong(" + matchedIndex + "," + j + ")'>+</button></div></div></div></div>"
                divCacsanpham.append(divSanpham)
            }

            $("#container").prepend(divCacsanpham)
        }
        if (gioRong) {
            xuLyGiohangRong()
            return
        }

        // Cập nhật thông tin khách hàng vào form đặt hàng
        if (objTKDN.gioiTinh === "Nữ") {
            $("#chi").attr("checked", "checked")
            $("#anh").attr("disabled", "disabled")
        } else {
            $("#anh").attr("checked", "checked")
            $("#chi").attr("disabled", "disabled")
        }
        $("#hovaten").val(objTKDN.hoTen)
        $("#sodienthoai").val(objTKDN.dienThoai)
        $("#diachi").val(objTKDN.diaChi)
            // helper: normalize image path so images load correctly from pages under /html/
            function normalizeImagePath(src) {
                if (!src) return '';
                src = src.toString().trim();
                // absolute URL or root-relative
                if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/')) return src;
                // already relative from html/ (e.g., ../img/..)
                if (src.startsWith('../')) return src;
                // starts with ./img/ or img/
                if (src.startsWith('./img/')) return '../' + src.slice(2);
                if (src.startsWith('img/')) return '../' + src;
                // fallback: if filename only, assume in ../img/
                if (!src.includes('/')) return '../img/' + src;
                return src;
            }

        $("#tannha").click(function () {
            $("#diachi").val(objTKDN.diaChi)
            $(".diachi").css("display", "block")
        })
        $("#sieuthi").click(function () {
            $(".diachi").css("display", "none")
        })

        $("#tongTien").text(tinhTongtien())

        // lightweight toast function for feedback
        function showToast(message, duration = 1200) {
            try {
                const id = 'site-toast'
                $('#' + id).remove()
                const t = $('<div>', { id: id, class: 'site-toast' }).text(message).css({ display: 'none' })
                $('body').append(t)
                t.fadeIn(180)
                setTimeout(() => { t.fadeOut(200, () => t.remove()) }, duration)
            } catch (e) { console.warn('toast error', e) }
        }

        // confirmation modal helper (reuses #myModal)
        function showConfirmationModal(message, onConfirm) {
            try {
                const modal = $("#myModal")
                modal.find('.modal-header h2').text('Xác nhận')
                modal.find('.modal-body').html('<p class="lead">' + message + '</p><p class="muted">Xin cảm ơn!</p>')
                const footer = modal.find('.modal-footer')
                footer.find('#confirmYes').remove()
                footer.find('#confirmNo').remove()
                // Use styled buttons placed directly in the footer (footer is flex container)
                footer.append('<button id="confirmYes" class="btn-confirm">Xác nhận</button>')
                footer.append('<button id="confirmNo" class="btn-cancel">Hủy</button>')
                modal.css('display', 'block')
                $('#confirmNo').off('click').on('click', function () { modal.css('display', 'none') })
                $('#confirmYes').off('click').on('click', function () { modal.css('display', 'none'); try { onConfirm() } catch (e) { console.warn(e) } })
            } catch (e) {
                // fallback to native confirm
                if (confirm(message)) {
                    try { onConfirm() } catch (ex) { console.warn(ex) }
                }
            }
        }

        // perform the order placement
        function placeOrder() {
            // capture phone (optional) — do not require or alert
            const phone = $("#sodienthoai").val() ? $("#sodienthoai").val().trim() : ''
            if ($("#tannha").is(":checked")) {
                if ($("#diachi").val().trim() === "") {
                    alert("Quý khách vui lòng nhập địa chỉ giao hàng!")
                    return
                }
            }

            try {
                const dsGioRaw = localStorage.getItem('dsGioSP')
                let objDS = dsGioRaw ? JSON.parse(dsGioRaw) : []
                const userKey = normalizeKey(tenDN)
                const cart = objDS.find(c => normalizeKey(c.tendangnhap) === userKey) || { sanpham: [] }
                function parsePriceString(s) { if (!s) return 0; return parseInt(s.toString().replace(/[^0-9]/g, '')) || 0 }
                const items = cart.sanpham.map(p => ({ ten: p.ten, gia: parsePriceString(p.gia), soluong: p.soluong || 1, hinhanh: p.hinhanh }))
                const total = items.reduce((acc, it) => acc + (it.gia * (it.soluong || 1)), 0)
                const order = { id: 'DH' + Date.now(), user: tenDN, items: items, phone: phone, address: $("#diachi").val().trim(), total: total, createdAt: new Date().toISOString() }
                const dsDonHangRaw = localStorage.getItem('dsDonHang')
                const dsDonHang = dsDonHangRaw ? JSON.parse(dsDonHangRaw) : []
                dsDonHang.push(order)
                localStorage.setItem('dsDonHang', JSON.stringify(dsDonHang))
                objDS = objDS.filter(c => normalizeKey(c.tendangnhap) !== userKey)
                localStorage.setItem('dsGioSP', JSON.stringify(objDS))

                // Clear cart UI immediately
                xuLyGiohangRong()

                // show success modal with order summary
                try {
                    const modal = $("#myModal")
                    modal.find('.modal-header h2').text('Đặt hàng thành công')
                    const formattedTotal = phantachSoHangnghin(order.total)
                    const bodyHtml = `
                        <div style="line-height:1.6">
                            <p><strong>Mã đơn hàng:</strong> ${order.id}</p>
                            <p><strong>Số mục:</strong> ${items.length}</p>
                            <p><strong>Tổng:</strong> ${formattedTotal}<sup>đ</sup></p>
                            <p class="muted">Đơn hàng của bạn đang được xử lý. Chúng tôi sẽ liên hệ để xác nhận giao nhận.</p>
                        </div>
                    `
                    modal.find('.modal-body').html(bodyHtml)
                    const footer = modal.find('.modal-footer')
                    footer.find('#modalOk').remove()
                    footer.append('<button id="modalOk">OK</button>')
                    modal.css('display', 'block')
                    // On OK just hide modal and show success state on the cart page (do not redirect)
                    $('.close, #modalOk').off('click').on('click', function () {
                        modal.css('display', 'none')
                        try { sessionStorage.removeItem('MUA_NGAY_SP') } catch (e) {}
                        // render success/empty cart state in-page instead of navigating away
                        try { xuLyGiohangRong(order) } catch (e) { /* ignore */ }
                    })
                } catch (e) {
                    // fallback: show toast and render empty/success state
                    showToast('Đơn hàng đã được đặt. Cảm ơn bạn!', 1300)
                    try { xuLyGiohangRong(order) } catch (ex) {}
                }

            } catch (e) { console.warn('order save failed', e) }
        }

        // When user clicks Đặt hàng, show confirmation modal then place order on confirm
        $("#datHang").click(function () {
            showConfirmationModal('Quý khách có chắc chắn muốn đặt tất cả các sản phẩm trong giỏ hàng?', placeOrder)
        })
    }
})

function xuLyGiohangRong(order) {
    $("main>div").empty()
    if (order) {
        // show a friendly success card with order summary and CTAs
        const formattedTotal = phantachSoHangnghin(order.total)
        const successCard = `
            <div style="text-align:left; padding:28px; max-width:880px; margin:0 auto; background:transparent; box-shadow:none; border-radius:0;">
                <h2 style="margin:0 0 8px; font-size:22px; color:#0b2440">Đặt hàng thành công</h2>
                <p style="margin:0 0 8px; color:#374151"><strong>Mã đơn hàng:</strong> ${order.id}</p>
                <p style="margin:0 0 8px; color:#374151"><strong>Số mục:</strong> ${order.items.length}</p>
                <p style="margin:0 0 18px; color:#374151"><strong>Tổng:</strong> ${formattedTotal}<sup>đ</sup></p>
                <div style="display:flex; gap:12px;">
                    <a href="../html/trangchu.html" style="display:inline-block; padding:10px 16px; background:#0b5ed7; color:#fff; border-radius:8px; text-decoration:none; font-weight:700">Tiếp tục mua sắm</a>
                    <a href="taikhoancuatoi.html" style="display:inline-block; padding:10px 16px; background:#10b981; color:#fff; border-radius:8px; text-decoration:none; font-weight:700">Xem đơn hàng của tôi</a>
                </div>
            </div>
        `
        $("main>div").append(successCard)
        return
    }

    const emptyCard = `
        <div style="text-align:center; padding:28px; max-width:100%; margin:0 auto; background:transparent; box-shadow:none; border-radius:0;">
            <h2 style="margin:0 0 8px; font-size:22px; color:#0b2440">Giỏ hàng của bạn đang trống</h2>
            <p style="margin:0 0 18px; color:#6b7280">Hãy thêm những sản phẩm bạn thích vào giỏ hàng để đặt mua.</p>
            <a href="../html/danhsachsanpham.html" style="display:inline-block; padding:12px 18px; background:linear-gradient(90deg,#0b5ed7,#0366d6); color:#fff; border-radius:8px; text-decoration:none; font-weight:700">Xem sản phẩm</a>
        </div>
    `;
    $("main>div").append(emptyCard)
}

function phantachSoHangnghin(so) {
    let arrHangtram = []
    let soDaduocPhantach = ""
    let strSo = so + ""
    let end = strSo.length
    let start = end - 3
    while (start > 0) {
        arrHangtram.unshift("." + strSo.slice(start, end))
        if (start - 3 <= 0) {
            arrHangtram.unshift(strSo.slice(0, start))
            break
        }
        end = start
        start = end - 3
    }
    soDaduocPhantach = arrHangtram.join("")
    return soDaduocPhantach
}

function giamSoluong(indexGio, indexSanpham) {
    let soluongSanpham = eval(document.getElementsByClassName("soluong")[indexSanpham].innerHTML)
    if (soluongSanpham === 1) {
        return
    }

    document.getElementsByClassName("soluong")[indexSanpham].innerHTML = soluongSanpham - 1 + ""
    $("#tongTien").text(tinhTongtien())

    const dsGio = localStorage.getItem("dsGioSP")
    let objDSGioSP = JSON.parse(dsGio)
    objDSGioSP[indexGio].sanpham[indexSanpham].soluong = soluongSanpham - 1
    localStorage.setItem("dsGioSP", JSON.stringify(objDSGioSP))
}

function tangSoluong(indexGio, indexSanpham) {
    let soluongSanpham = eval(document.getElementsByClassName("soluong")[indexSanpham].innerHTML)
    document.getElementsByClassName("soluong")[indexSanpham].innerHTML = soluongSanpham + 1 + ""
    $("#tongTien").text(tinhTongtien())

    const dsGio = localStorage.getItem("dsGioSP")
    let objDSGioSP = JSON.parse(dsGio)
    objDSGioSP[indexGio].sanpham[indexSanpham].soluong = soluongSanpham + 1
    localStorage.setItem("dsGioSP", JSON.stringify(objDSGioSP))
}

function xoaSanPham(indexGio, indexSanpham) {
    const xacnhan = confirm("Bạn muốn xóa sản phẩm này khỏi giỏ hàng?")
    if (!xacnhan) {
        return
    }

    let sanpham = document.getElementsByClassName("sanpham")[indexSanpham]
    let giaSanPham = document.getElementsByClassName("giaSanPham")[indexSanpham]
    let soluongSanPham = document.getElementsByClassName("soluong")[indexSanpham]
    sanpham.style.display = "none"
    giaSanPham.style.display = "none"
    soluongSanPham.style.display = "none"
    $("#tongTien").text(tinhTongtien())
    if ($(".sanpham:visible").length === 0) {
        xuLyGiohangRong()
    }

    const dsGio = localStorage.getItem("dsGioSP")
    let objDSGioSP = JSON.parse(dsGio)
    objDSGioSP[indexGio].sanpham.splice(indexSanpham, 1)
    localStorage.setItem("dsGioSP", JSON.stringify(objDSGioSP))
}

function tinhTongtien() {
    const soloaisanpham = $(".sanpham:visible").length
    const giaTungSanPham = $(".giaSanPham:visible")
    const soluongTungSanPham = $(".soluong:visible")
    let tongTien = 0
    for (let i = 0; i < soloaisanpham; i++) {
        tongTien += eval(giaTungSanPham[i].innerText.replace(/[\.đ]/g, "")) * eval(soluongTungSanPham[i].innerHTML)
    }
    return phantachSoHangnghin(tongTien)
}
