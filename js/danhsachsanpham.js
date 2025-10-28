// danhsachsanpham.js

import { arrSP_DSSP } from "../js/sanpham_array.js";
import { Sanpham } from "../js/sanpham.js";

const sp = new Sanpham();
let currentProductsArray = arrSP_DSSP; // Mảng sản phẩm hiện tại đang được hiển thị (có thể đã lọc/tìm kiếm)
let currentPage = 1;
const itemsPerPage = 8; // Số sản phẩm trên mỗi trang

// Hàm để cập nhật hiển thị sản phẩm dựa trên trang hiện tại
function updateProductDisplay() {
    let stringTimkiem = sessionStorage.getItem("timkiemDSSP");
    let stringBoloc = sessionStorage.getItem("boloc");

    if (stringTimkiem != null) {
        sp.timkiemSanpham(stringTimkiem, arrSP_DSSP, currentPage, itemsPerPage);
    } else if (stringBoloc != null) {
        let objBoloc = JSON.parse(stringBoloc);
        sp.locSanpham(objBoloc, arrSP_DSSP, currentPage, itemsPerPage);
    } else {
        sp.themSanpham(arrSP_DSSP, currentPage, itemsPerPage);
    }
}

// Khởi tạo hiển thị sản phẩm khi tải trang
$(document).ready(function () {
    updateProductDisplay();
});

// Gán hàm changePage vào window để có thể gọi từ sanpham.js
window.changePage = function (page) {
    currentPage = page;
    updateProductDisplay();
    // Cuộn lên đầu trang sau khi chuyển trang
    $('html, body').animate({ scrollTop: 0 }, 'slow');
};

$("#dssp").click(function () {
    sessionStorage.removeItem("timkiemDSSP");
    sessionStorage.removeItem("boloc");
    currentPage = 1; // Reset về trang 1 khi click vào dssp
    updateProductDisplay();
});

$("#formSearch").submit(function (event) {
    event.preventDefault();
});

$("#inputTimkiem").focus();

// Tìm kiếm sản phẩm
$("#inputTimkiem").keydown(function (event) {
    if (event.which === 13 || event.keyCode === 13) {
        if (this.value.trim() !== "") {
            currentPage = 1; // Reset về trang 1 khi tìm kiếm mới
            sp.timkiemSanpham(this.value, arrSP_DSSP, currentPage, itemsPerPage);
        } else if (this.value === "") {
            refreshBoloc();
        }
    }
});

$("#btnTimkiem").click(function () {
    $("#inputTimkiem").focus();
    let input = $("#inputTimkiem").val();
    if (input.trim() !== "") {
        currentPage = 1; // Reset về trang 1 khi tìm kiếm mới
        sp.timkiemSanpham(input, arrSP_DSSP, currentPage, itemsPerPage);
    } else if (input === "") {
        refreshBoloc();
    }
});

// Bộ lọc sản phẩm
let boloc = ["congsuat", "hang", "gia", "tienich", "macdinh"];
// Các biến count không còn cần thiết với cách xử lý click mới
// let countCongsuat = 0;
// let countHang = 0;
// let countGia = 0;
// let countTienich = 0;
// let countXeptheo = 0;

$("#congsuat").change(function () { // Sử dụng change thay vì click để bắt sự kiện khi giá trị thay đổi
    boloc[0] = $(this).val();
    currentPage = 1; // Reset về trang 1 khi lọc mới
    sp.locSanpham(boloc, arrSP_DSSP, currentPage, itemsPerPage);
});

$("#hang").change(function () {
    boloc[1] = $(this).val();
    currentPage = 1; // Reset về trang 1 khi lọc mới
    sp.locSanpham(boloc, arrSP_DSSP, currentPage, itemsPerPage);
});

$("#gia").change(function () {
    boloc[2] = $(this).val();
    currentPage = 1; // Reset về trang 1 khi lọc mới
    sp.locSanpham(boloc, arrSP_DSSP, currentPage, itemsPerPage);
});

$("#tienich").change(function () {
    boloc[3] = $(this).val();
    currentPage = 1; // Reset về trang 1 khi lọc mới
    sp.locSanpham(boloc, arrSP_DSSP, currentPage, itemsPerPage);
});

$("#xeptheo").change(function () {
    boloc[4] = $(this).val();
    currentPage = 1; // Reset về trang 1 khi sắp xếp mới
    sp.locSanpham(boloc, arrSP_DSSP, currentPage, itemsPerPage);
});

function refreshBoloc() {
    sessionStorage.removeItem("timkiemDSSP");
    sessionStorage.removeItem("boloc");
    $("#congsuat").val("congsuat");
    $("#hang").val("hang");
    $("#gia").val("gia");
    $("#tienich").val("tienich");
    $("#xeptheo").val("macdinh");
    currentPage = 1; // Reset về trang 1
    updateProductDisplay(); // Gọi lại hàm hiển thị sản phẩm
}


