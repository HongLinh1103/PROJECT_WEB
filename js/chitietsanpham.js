import { arrSP_DSSP } from "./sanpham_array.js"

// Lock tránh bấm liên tục khi thêm giỏ hàng
let addingInProgress = false;

// Hiển thị toast nhỏ gọn (không chặn UI)
function showToast(message, duration = 1000) {
    try {
        const id = 'site-toast'
        $('#' + id).remove()
        const t = $('<div>', { id: id, class: 'site-toast' }).text(message).css({ display: 'none' })
        $('body').append(t)
        t.fadeIn(180)
        setTimeout(() => { t.fadeOut(200, () => t.remove()) }, duration)
    } catch (e) { console.warn('toast error', e) }
}

$(document).ready(function () {

    // Lấy sản phẩm hiện tại từ session
    let stringSP = sessionStorage.getItem("TTCT_SP")

    // Nếu vào trang chi tiết mà không có dữ liệu → báo lỗi + hướng dẫn
    if (stringSP == null) {
        $("body").empty()
        $("body").append("<div style='text-align:center'><h1>Vui lòng quay lại</h1><a style='font-size:20px' href='../html/trangchu.html'>trang chủ</a> hoặc <a style='font-size:20px' href='../html/danhsachsanpham.html'>trang danh sách sản phẩm</a><p>Để chọn và xem thông tin chi tiết sản phẩm bạn mong muốn</p></div>")
    } else {
        let objSP = JSON.parse(stringSP)

        // Render thông tin chi tiết sản phẩm
        $("#hinhanhSP").attr("src", objSP.hinhanh[1])
        $(".tenSP").text(objSP.ten)
        $("#gia").text(objSP.gia + "đ")
        $("#loaiMay").text(objSP.loaimay)
        $("#congsuat").text(objSP.congsuatLamlanh + " HP")
        $("#phamviLamlanh").text(objSP.phamviLamlanh)
        $("#tieuthuDien").text(objSP.tieuthuDien + " kW/h")
        $("#khangkhuan").text(objSP.khangkhuan)
        $("#tietkiemDien").text(objSP.congngheTietkiemDien)
        $("#tienich").text(objSP.tienich)
        $("#noiSanxuat").text(objSP.noiSanxuat)

        // Lọc sản phẩm tương tự theo hãng hoặc công suất
        let arraySP_tuongtu = []
        for (let i = 0; i < arrSP_DSSP.length; i++) {
            if ((objSP.hang === arrSP_DSSP[i].hang && objSP.ten !== arrSP_DSSP[i].ten) ||
                (objSP.congsuatLamlanh === arrSP_DSSP[i].congsuatLamlanh && objSP.ten !== arrSP_DSSP[i].ten)) {

                arraySP_tuongtu.push(arrSP_DSSP[i])
                if (arraySP_tuongtu.length == 4) break
            }
        }

        // Không có sản phẩm tương tự → hiển thị thông báo
        if (arraySP_tuongtu.length === 0) {
            $("#cacSP_tuongtu").append("<div class='rowProducts'><p style='text-align: center; font-style: italic; padding: 20px;'>Không có sản phẩm tương tự.</p></div>")
        } else {
            // Tạo 1 hàng chứa toàn bộ sản phẩm tương tự – CSS sẽ tự responsive
            let rowProducts = $("<div></div>").attr("class", "rowProducts")

            for (let i = 0; i < arraySP_tuongtu.length; i++) {
                const product = arraySP_tuongtu[i]
                rowProducts.append(
                    "<a class='product' href='../html/chitietsanpham.html'>" +
                    "<div>" +
                    "<div class='productImg'><img src='" + product.hinhanh[0] + "' alt=''></div>" +
                    "<h3 class='productTen'>" + product.ten + "</h3>" +
                    "<div class='productGia'>" + product.gia + "<sup>đ</sup></div>" +
                    "<div class='productThemGioHang'><span>THÊM VÀO GIỎ HÀNG</span></div>" +
                    "</div>" +
                    "</a>"
                )
            }
            $("#cacSP_tuongtu").append(rowProducts)
        }

        // Click vào sản phẩm tương tự → chuyển sang trang chi tiết
        $(document).off("click", ".product").on("click", ".product", function (e) {

            // Nếu click vào nút giỏ hàng thì KHÔNG chuyển trang
            if ($(e.target).closest('.productThemGioHang').length === 0) {
                let tensanpham = $(this).find(".productTen").text()

                for (let i = 0; i < arrSP_DSSP.length; i++) {
                    if (tensanpham == arrSP_DSSP[i].ten) {
                        sessionStorage.setItem("TTCT_SP", JSON.stringify(arrSP_DSSP[i]))
                        window.location.href = "../html/chitietsanpham.html"
                        break
                    }
                }
            }
        })

        // Click “Thêm vào giỏ hàng” ở sản phẩm tương tự → thêm + chuyển đến giỏ hàng
        $(document).off("click", ".productThemGioHang").on("click", ".productThemGioHang", function (e) {
            e.preventDefault()
            e.stopPropagation()

            const productElement = $(this).closest('.product')
            const tensanpham = productElement.find(".productTen").text()
            let objSP_tuongtu = arrSP_DSSP.find(sp => sp.ten === tensanpham)

            if (!objSP_tuongtu) {
                console.error("Product not found:", tensanpham)
                return
            }

            const btn = $(this)
            if (btn.data('adding')) return
            btn.data('adding', true)

            themVaoGioHang(objSP_tuongtu, true).finally(() => btn.data('adding', false))
        })

        // Nút “THÊM VÀO GIỎ HÀNG” ngay trên trang chi tiết (hiển thị modal thống nhất)
        $(document).off("click", "#themvaogio").on("click", "#themvaogio", function () {

            const taiKhoanDN = localStorage.getItem("tkDangnhap")
            if (!taiKhoanDN) {
                showToast("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!", 1400)
                setTimeout(() => window.location.href = "../html/dangnhap.html", 600)
                return
            }

            const btn = $(this)
            if (btn.data('adding')) return
            btn.data('adding', true)

            // Sau khi thêm → show modal thay vì toast
            themVaoGioHang(objSP, false, false).then(() => {
                try {
                    const modal = $("#myModal")
                    $("#zoomContainer").hide()
                    $("#messageContainer").show()
                    $("#myModal").css("display", "block")

                    modal.find('.modal-header h2').text('Thông báo')
                    $("#tenSP").text(objSP.ten)
                    $("#giaSP").text(objSP.gia)

                    // Đóng modal (header X + click ngoài)
                    $(".close").off('click').on('click', function () {
                        $("#myModal").css("display", "none")
                        $("#zoomContainer").hide()
                        $("#messageContainer").hide()
                    })
                    $(window).off('click').on('click', function (event) {
                        if (event.target == document.getElementById('myModal')) {
                            $("#myModal").css("display", "none")
                            $("#zoomContainer").hide()
                            $("#messageContainer").hide()
                        }
                    })

                    // Add nút CTA: "Xem giỏ hàng" / "Tiếp tục mua sắm"
                    const footer = modal.find('.modal-footer')
                    footer.find('#modalViewCart').remove()
                    footer.find('#modalContinue').remove()
                    footer.append('<button id="modalViewCart" class="btn-confirm">Xem giỏ hàng</button>')
                    footer.append('<button id="modalContinue" class="btn-cancel">Tiếp tục mua sắm</button>')

                    $('#modalContinue').off('click').on('click', function () {
                        modal.css('display', 'none')
                        $("#zoomContainer").hide()
                        $("#messageContainer").hide()
                    })
                    $('#modalViewCart').off('click').on('click', function () {
                        window.location.href = "../html/giohang.html"
                    })
                } catch (e) { console.warn('modal show failed', e) }
            }).finally(() => btn.data('adding', false))
        })

        // Nút “Mua ngay” → lưu sản phẩm nhanh + chuyển đến muahang.html (không bắt đăng nhập)
        $("#muangay").off("click").on("click", function () {
            // Lưu sản phẩm mua ngay vào sessionStorage và chuyển sang trang thanh toán
            try {
                sessionStorage.setItem('MUA_NGAY_SP', JSON.stringify(objSP))
            } catch (e) { console.warn('cannot set session MUA_NGAY_SP', e) }

            // Trực tiếp chuyển sang trang mua hàng. Trang `muahang.html` sẽ xử lý cả trường hợp guest.
            window.location.href = "../html/muahang.html"
        })
    }
})

// Hàm chung thêm sản phẩm vào giỏ hàng
// redirectAfterAdd → true: sau khi thêm sẽ chuyển trang giỏ hàng
// showToastFlag → tắt/bật toast mặc định
function themVaoGioHang(objSP, redirectAfterAdd, showToastFlag = true) {

    return new Promise((resolve) => {

        // Cho phép dùng cả account cũ “tkDangnhap” và account mới “currentUser”
        let taikhoan = localStorage.getItem("tkDangnhap")
        if (!taikhoan && localStorage.getItem('currentUser')) {
            try {
                const u = JSON.parse(localStorage.getItem('currentUser'));
                const legacy = {
                    ten_dangnhap: u.username || u.ten_dangnhap || '',
                    hoTen: u.fullname || u.hoTen || '',
                    dienThoai: u.phone || u.dienThoai || '',
                    diaChi: u.diaChi || '',
                    gioiTinh: u.gioiTinh || ''
                };
                taikhoan = JSON.stringify(legacy);
                localStorage.setItem('tkDangnhap', taikhoan);
            } catch (e) { console.warn('Cannot derive tkDangnhap from currentUser', e); }
        }

        if (!taikhoan) {
            alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!")
            window.location.href = "../html/dangnhap.html"
            resolve()
            return
        }

        const loggedInAccount = JSON.parse(taikhoan)

        // Tránh spam nút thêm giỏ → hiển thị đang xử lý
        if (addingInProgress) {
            showToast('Đang xử lý...', 700)
            resolve()
            return
        }

        addingInProgress = true

        // Delay nhẹ để tạo cảm giác animation
        setTimeout(function () {

            const dsGio = localStorage.getItem("dsGioSP")
            const newItem = {
                hinhanh: objSP.hinhanh[0],
                ten: objSP.ten,
                gia: objSP.gia,
                soluong: 1
            }

            let objDSGioSP = dsGio ? JSON.parse(dsGio) : []
            let userCart = objDSGioSP.find(cart => cart.tendangnhap === loggedInAccount.ten_dangnhap)

            if (userCart) {
                let existingProduct = userCart.sanpham.find(item => item.ten === newItem.ten)
                if (existingProduct) {
                    existingProduct.soluong += 1
                } else {
                    userCart.sanpham.push(newItem)
                }
            } else {
                objDSGioSP.push({
                    tendangnhap: loggedInAccount.ten_dangnhap,
                    sanpham: [newItem]
                })
            }

            localStorage.setItem('dsGioSP', JSON.stringify(objDSGioSP))

            if (showToastFlag) showToast('Đã thêm sản phẩm vào giỏ hàng!', 900)

            addingInProgress = false

            if (redirectAfterAdd) {
                setTimeout(() => { location.href = "../html/giohang.html" }, 700)
            }

            resolve()
        }, 300)
    })
}
