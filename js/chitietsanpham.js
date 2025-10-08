import { arrSP_DSSP } from "./sanpham_array.js"

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

            // Gọi hàm thêm vào giỏ với modal (không redirect)
            themVaoGioHang(objSP_tuongtu, false)  // false: không redirect
        })

        // Event listener cho nút "#muangay" (thêm vào giỏ và redirect đến giỏ hàng, với modal)
        $("#muangay").off("click").on("click", function () {
            const taiKhoanDN = localStorage.getItem("tkDangnhap")
            if (taiKhoanDN == null) {
                alert("Vui lòng đăng nhập để mua hàng!")
                window.location.href = "../html/dangnhap.html"
                return
            }

            // Gọi hàm thêm vào giỏ với modal, và redirect sau khi thêm
            themVaoGioHang(objSP, true)  // true: redirect sau khi thêm
        })
    }
})

// Hàm chung để thêm vào giỏ hàng (dùng cho sản phẩm chính và tương tự)
// Tham số: objSP (sản phẩm), redirectAfterAdd (boolean: có redirect đến giỏ hàng không)
function themVaoGioHang(objSP, redirectAfterAdd) {
    const taikhoan = localStorage.getItem("tkDangnhap")
    if (taikhoan == null) {
        alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!")
        window.location.href = "../html/dangnhap.html"
        return
    }

    const loggedInAccount = JSON.parse(taikhoan)

    // Hiển thị modal xác nhận (giả sử có #myModal trong HTML)
    $("#myModal").css("display", "block")
    $("#tenSP").text(objSP.ten)  // Giả sử có #tenSP trong modal
    $("#giaSP").text(objSP.gia + "đ")  // Giả sử có #giaSP trong modal

    // Đóng modal khi click nút close hoặc ngoài modal
    $(".close").off("click").on("click", function () {
        $("#myModal").css("display", "none")
    })
    $(window).off("click").on("click", function (event) {
        if (event.target == document.getElementById("myModal")) {
            $("#myModal").css("display", "none")
        }
    })

    // Thêm vào giỏ hàng sau 1 giây (hiển thị modal tạm thời)
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

        localStorage.setItem("dsGioSP", JSON.stringify(objDSGioSP))
        $("#myModal").css("display", "none")  // Đóng modal sau khi thêm

        // Thông báo thành công
        alert("Đã thêm sản phẩm vào giỏ hàng!")

        // Nếu redirectAfterAdd là true (cho nút mua ngay), chuyển đến giỏ hàng
        if (redirectAfterAdd) {
            location.href = "../html/giohang.html"
        }
    }, 1000)
}