import { arrSP_DSSP } from "./sanpham_array.js"

// Prevent double submissions when adding to cart
let addingInProgress = false;

// Lightweight toast for non-blocking user feedback
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
    let stringSP = sessionStorage.getItem("TTCT_SP")
    if (stringSP == null) {
        $("body").empty()
        $("body").append("<div style='text-align:center'><h1>Vui lòng quay lại</h1><a style='font-size:20px' href='../html/trangchu.html'>trang chủ</a> hoặc <a style='font-size:20px' href='../html/danhsachsanpham.html'>trang danh sách sản phẩm</a><p>Để chọn và xem thông tin chi tiết sản phẩm bạn mong muốn</p></div>")
    } else {
        let objSP = JSON.parse(stringSP)

        // Hiển thị thông tin sản phẩm chi tiết
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

        // Thêm các sản phẩm tương tự (dựa vào hãng hoặc công suất làm lạnh)
        let arraySP_tuongtu = []
        for (let i = 0; i < arrSP_DSSP.length; i++) {
            if ((objSP.hang === arrSP_DSSP[i].hang && objSP.ten !== arrSP_DSSP[i].ten) ||
                (objSP.congsuatLamlanh === arrSP_DSSP[i].congsuatLamlanh && objSP.ten !== arrSP_DSSP[i].ten)) {
                arraySP_tuongtu.push(arrSP_DSSP[i])
                if (arraySP_tuongtu.length == 4) {
                    break
                }
            }
        }

        // Nếu không có sản phẩm tương tự, hiển thị thông báo
        if (arraySP_tuongtu.length === 0) {
            $("#cacSP_tuongtu").append("<div class='rowProducts'><p style='text-align: center; font-style: italic; padding: 20px;'>Không có sản phẩm tương tự.</p></div>")
        } else {
            // Tạo một rowProducts duy nhất cho tất cả sản phẩm tương tự (để CSS grid tự sắp xếp responsive)
            let rowProducts = $("<div></div>")
            rowProducts.attr("class", "rowProducts")

            for (let i = 0; i < arraySP_tuongtu.length; i++) {
                const product = arraySP_tuongtu[i]
                rowProducts.append(
                    "<a class='product' href='../html/chitietsanpham.html'>" +
                    "<div>" +
                    "<div class='productImg'><img src='" + product.hinhanh[0] + "' alt=''></div>" +
                    "<h3 class='productTen'>" + product.ten + "</h3>" +
                    "<div class='productGia'>" + product.gia + "<sup>đ</sup></div>" +
                    "<div class='productThemGioHang'><span>THÊM VÀO GIỎ HÀNG</span></div>" +  // Thêm nút thêm giỏ hàng
                    "</div>" +
                    "</a>"
                )
            }
            $("#cacSP_tuongtu").append(rowProducts)
        }

        // Event listener cho click vào sản phẩm tương tự (chuyển trang chi tiết)
        $(document).off("click", ".product").on("click", ".product", function (e) {
            // Kiểm tra nếu click vào nút thêm giỏ thì không chuyển trang
            if ($(e.target).closest('.productThemGioHang').length === 0) {
                let tensanpham = $(this).find(".productTen").text()
                for (let i = 0; i < arrSP_DSSP.length; i++) {
                    if (tensanpham == arrSP_DSSP[i].ten) {
                        sessionStorage.setItem("TTCT_SP", JSON.stringify(arrSP_DSSP[i]))
                        window.location.href = "../html/chitietsanpham.html"  // Thêm redirect để chuyển trang
                        break
                    }
                }
            }
        })

        // Event listener cho nút "THÊM VÀO GIỎ HÀNG" của sản phẩm tương tự (với modal xác nhận)
        // Khi click thêm từ danh sách tương tự, chuyển thẳng tới trang giỏ hàng sau khi thêm.
        $(document).off("click", ".productThemGioHang").on("click", ".productThemGioHang", function (e) {
            e.preventDefault()  // Ngăn chuyển trang khi click nút
            e.stopPropagation() // Ngăn sự kiện lan tỏa lên .product

            const productElement = $(this).closest('.product')
            const tensanpham = productElement.find(".productTen").text()
            let objSP_tuongtu = null
            for (let i = 0; i < arrSP_DSSP.length; i++) {
                if (tensanpham === arrSP_DSSP[i].ten) {
                    objSP_tuongtu = arrSP_DSSP[i]
                    break
                }
            }

            if (!objSP_tuongtu) {
                console.error("Product not found:", tensanpham)
                return
            }

            // prevent duplicate clicks
            const btn = $(this)
            if (btn.data('adding')) return
            btn.data('adding', true)
            themVaoGioHang(objSP_tuongtu, true).finally(() => btn.data('adding', false))
        })

        // Event listener cho nút "THÊM VÀO GIỎ HÀNG" trên trang chi tiết (thêm rồi chuyển sang giỏ hàng)
        $(document).off("click", "#themvaogio").on("click", "#themvaogio", function () {
            const taiKhoanDN = localStorage.getItem("tkDangnhap")
            if (taiKhoanDN == null) {
                showToast("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!", 1400)
                setTimeout(() => window.location.href = "../html/dangnhap.html", 600)
                return
            }
            const btn = $(this)
            if (btn.data('adding')) return
            btn.data('adding', true)
            themVaoGioHang(objSP, true).finally(() => btn.data('adding', false))
        })

        // Event listener cho nút "#muangay" (thêm vào quick-buy và chuyển đến trang mua hàng riêng)
        $("#muangay").off("click").on("click", function () {
            const taiKhoanDN = localStorage.getItem("tkDangnhap")
            if (taiKhoanDN == null) {
                alert("Vui lòng đăng nhập để mua hàng!")
                window.location.href = "../html/dangnhap.html"
                return
            }

            // store quick-buy product in session so muahang.html can render only this product
            sessionStorage.setItem('MUA_NGAY_SP', JSON.stringify(objSP))
            // add to cart storage (but do not redirect there); after add completes send to quick-buy page
            themVaoGioHang(objSP, false).finally(() => {
                window.location.href = "../html/muahang.html"
            })
        })
    }
})

// Hàm chung để thêm vào giỏ hàng (dùng cho sản phẩm chính và tương tự)
// Tham số: objSP (sản phẩm), redirectAfterAdd (boolean: có redirect đến giỏ hàng không)
function themVaoGioHang(objSP, redirectAfterAdd) {
    // Return a promise so callers can know when finished
    return new Promise((resolve) => {
    // Hỗ trợ cả 'tkDangnhap' (legacy) và 'currentUser' (mới)
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

    // Thêm vào giỏ hàng sau 300ms (nhỏ delay để thể hiện animation)
    if (addingInProgress) { showToast('Đang xử lý...',700); resolve(); return }
    addingInProgress = true
    setTimeout(function () {
        const dsGio = localStorage.getItem("dsGioSP")
        const newItem = {
            hinhanh: objSP.hinhanh[0],
            ten: objSP.ten,
            gia: objSP.gia,
            soluong: 1  // Đảm bảo có soluong
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

        // Lưu trở lại localStorage
        localStorage.setItem('dsGioSP', JSON.stringify(objDSGioSP))

        // Thông báo non-blocking
        showToast('Đã thêm sản phẩm vào giỏ hàng!', 900)
        addingInProgress = false
        // Nếu redirectAfterAdd là true (cho nút mua ngay), chuyển đến giỏ hàng sau khi toast
        if (redirectAfterAdd) {
            setTimeout(() => { location.href = "../html/giohang.html" }, 700)
        }
        resolve()
    }, 300)
    })
}