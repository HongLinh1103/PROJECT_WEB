import { arrSP_Trangchu } from "./sanpham_array.js"
import { Sanpham } from "./sanpham.js"

const sp = new Sanpham()

let stringTimkiem = sessionStorage.getItem("timkiemTrangchu")

if (stringTimkiem != null) {
    sp.timkiemSanpham(stringTimkiem, arrSP_Trangchu)
} else {
    sp.themSanpham(arrSP_Trangchu)
}

$(".reloadTrang").click(function () {
    sessionStorage.removeItem("timkiemTrangchu")
})

$("#formSearch").submit(function (event) {
    event.preventDefault()
})

$("#inputTimkiem").focus()

// Hàm xử lý tìm kiếm chung
function xuLyTimKiem() {
    let input = $("#inputTimkiem").val().trim()
    if (input !== "") {
        sp.timkiemSanpham(input, arrSP_Trangchu)
    } else {
        sessionStorage.removeItem("timkiemTrangchu")
        $("#products").html("")
        sp.themSanpham(arrSP_Trangchu)
    }
}

// Tìm kiếm khi nhấn Enter
$("#inputTimkiem").keydown(function (event) {
    if (event.which === 13 || event.keyCode === 13) {
        xuLyTimKiem()
    }
})

// Tìm kiếm khi bấm nút
$("#btnTimkiem").click(function () {
    $("#inputTimkiem").focus()
    xuLyTimKiem()
})

// Nếu người dùng xoá hết chữ trong ô input thì tự động load lại sản phẩm
$("#inputTimkiem").on("input", function () {
    if ($(this).val().trim() === "") {
        sessionStorage.removeItem("timkiemTrangchu")
        $("#products").html("")
        sp.themSanpham(arrSP_Trangchu)
    }
})
