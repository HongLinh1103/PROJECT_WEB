// sanpham.js

class Sanpham {
    constructor(ten, gia, hang, kieudang, hinhanh, noiSanxuat, namSanxuat, loaimay, congsuatLamlanh, phamviLamlanh, congngheKhangkhuan, congngheTietkiemDien, tienich, tieuthuDien) {
        // 14 thuộc tính
        this.ten = ten
        this.gia = gia
        this.hang = hang
        this.kieudang = kieudang
        this.hinhanh = hinhanh
        this.noiSanxuat = noiSanxuat
        this.namSanxuat = namSanxuat
        this.loaimay = loaimay
        this.congsuatLamlanh = congsuatLamlanh
        this.phamviLamlanh = phamviLamlanh
        this.congngheKhangkhuan = congngheKhangkhuan
        this.congngheTietkiemDien = congngheTietkiemDien
        this.tienich = tienich
        this.tieuthuDien = tieuthuDien
    }
    thongtinSanpham() {
        return "Máy lạnh " + this.ten + " sản xuất tại " + this.noiSanxuat + ". Với kiểu dáng " + this.kieudang + " thuộc hãng " + this.hang + " có giá " + this.gia
    }
    thongsoKythuat() {
        return "Máy lạnh " + this.ten + " thuộc loại máy " + this.loaimay + ", có công suất làm lạnh " + this.congsuatLamlanh + "trong phạm vi " + this.phamviLamlanh + ", tiêu thụ điện khoảng " + this.tieuthuDien + ". Máy lạnh được trang bị công nghệ kháng khuẩn " + this.congngheKhangkhuan + ", công nghệ tiết kiệm điện " + this.congngheTietkiemDien + " đi kèm nhiều tiện ích như: " + this.tienich
    }

    // Thêm tham số currentPage và itemsPerPage
    themSanpham(arr, currentPage = 1, itemsPerPage = 8) {
        $("#products .rowProducts").remove(); // Xóa tất cả sản phẩm hiện có trước khi thêm mới
        $("#products .no-products-found").remove(); // Xóa thông báo không tìm thấy sản phẩm

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const productsToDisplay = arr.slice(startIndex, endIndex);

        if (productsToDisplay.length === 0) {
            $("#products").append("<div class='rowProducts no-products-found'><b>Không sản phẩm nào được tìm thấy</b></div>");
            this.renderPaginationControls(arr.length, currentPage, itemsPerPage); // Vẫn render controls để hiển thị tổng số trang
            return;
        }

        let rowProductsContainer = $("<div></div>");
        rowProductsContainer.attr("class", "rowProducts");

        for (let i = 0; i < productsToDisplay.length; i++) {
            const product = productsToDisplay[i];
            rowProductsContainer.append(
                "<a class='product' href='../html/chitietsanpham.html'>" +
                "<div>" +
                "<div class='productImg'><img src='" + product.hinhanh[0] + "' alt=''></div>" +
                "<h3 class='productTen'>" + product.ten + "</h3>" +
                "<div class='productGia'>" + product.gia + "<sup>đ</sup></div>" +
                "<div class='productThemGioHang'><span>THÊM VÀO GIỎ HÀNG</span></div>" +
                "</div>" +
                "</a>"
            );
        }
        $("#products").append(rowProductsContainer);

        // Render pagination controls
        this.renderPaginationControls(arr.length, currentPage, itemsPerPage);

        // Attach event listeners for products
        $(".product").off("click").on("click", function () {
            let tensanpham = $(this).find(".productTen").text();
            for (let i = 0; i < arr.length; i++) {
                if (tensanpham === arr[i].ten) {
                    sessionStorage.setItem("TTCT_SP", JSON.stringify(arr[i]));
                    $("#tenSP").text(tensanpham);
                    $("#giaSP").text(arr[i].gia);
                    break;
                }
            }
        });

        $(".productThemGioHang").off("click").on("click", function (e) {
            e.preventDefault(); // Prevent default link behavior
            e.stopPropagation(); // Stop event propagation to parent .product link

            // Hỗ trợ cả key cũ 'tkDangnhap' và key mới 'currentUser'
            let taikhoan = localStorage.getItem("tkDangnhap");
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
                    // Also persist legacy key for other modules
                    localStorage.setItem('tkDangnhap', taikhoan);
                } catch (e) { console.warn('Cannot derive tkDangnhap from currentUser', e); }
            }
            if (!taikhoan) {
                alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
                return;
            }

            // Get product info from the clicked button's parent
            const productElement = $(this).closest('.product');
            const tensanpham = productElement.find(".productTen").text();
            const gia = productElement.find(".productGia").text().replace('đ', ''); // Remove currency symbol

            // Find the full product object from the array
            let objSP = null;
            for (let i = 0; i < arr.length; i++) {
                if (tensanpham === arr[i].ten) {
                    objSP = arr[i];
                    break;
                }
            }

            if (!objSP) {
                console.error("Product not found in array:", tensanpham);
                return;
            }

            // Display unified modal (messageContainer) and prepare footer CTAs
            try {
                var modal = document.getElementById("myModal");
                $("#zoomContainer").hide();
                $("#messageContainer").show();
                $("#myModal").css("display", "block");
                // Ensure header title is consistent
                $("#myModal").find('.modal-header h2').text('Thông báo');
                $("#tenSP").text(tensanpham);
                // Use the product's formatted price (keep currency formatting consistent)
                if (objSP && objSP.gia) {
                    $("#giaSP").text(objSP.gia);
                } else {
                    $("#giaSP").text(gia);
                }

                // ensure close also hides internal containers
                $(".close").off('click').on('click', function () {
                    $("#myModal").css("display", "none");
                    $("#zoomContainer").hide();
                    $("#messageContainer").hide();
                });
                $(window).off('click').on('click', function (event) {
                    if (event.target == modal) {
                        $("#myModal").css("display", "none");
                        $("#zoomContainer").hide();
                        $("#messageContainer").hide();
                    }
                });

                // Footer CTAs: Xem giỏ hàng / Tiếp tục mua sắm (remove any existing first)
                const $footer = $("#myModal").find('.modal-footer');
                $footer.find('#modalViewCart').remove();
                $footer.find('#modalContinue').remove();
                $footer.append('<button id="modalViewCart" class="btn-confirm">Xem giỏ hàng</button>');
                $footer.append('<button id="modalContinue" class="btn-cancel">Tiếp tục mua sắm</button>');
                $('#modalContinue').off('click').on('click', function () {
                    $("#myModal").css("display", "none");
                    $("#zoomContainer").hide();
                    $("#messageContainer").hide();
                });
                $('#modalViewCart').off('click').on('click', function () {
                    window.location.href = "../html/giohang.html";
                });
            } catch (e) {
                console.warn('show modal failed', e);
            }

            // Add to cart logic after a short delay (keeps same behavior but keeps modal open)
            setTimeout(function () {
                const dsGioSP = localStorage.getItem("dsGioSP");
                const loggedInAccount = JSON.parse(localStorage.getItem("tkDangnhap"));

                const newItem = {
                    hinhanh: objSP.hinhanh[0],
                    ten: objSP.ten,
                    gia: objSP.gia,
                    soluong: 1 // Initialize quantity
                };

                let objDSGioSP = [];
                if (dsGioSP) {
                    objDSGioSP = JSON.parse(dsGioSP);
                }

                let userCart = objDSGioSP.find(cart => cart.tendangnhap === loggedInAccount.ten_dangnhap);

                if (userCart) {
                    let existingProduct = userCart.sanpham.find(item => item.ten === newItem.ten);
                    if (existingProduct) {
                        existingProduct.soluong += 1;
                    } else {
                        userCart.sanpham.push(newItem);
                    }
                } else {
                    objDSGioSP.push({
                        tendangnhap: loggedInAccount.ten_dangnhap,
                        sanpham: [newItem]
                    });
                }

                // DEBUG: log cart before and after saving
                console.log('Adding to cart for user:', loggedInAccount);
                console.log('Cart before save:', objDSGioSP);
                localStorage.setItem("dsGioSP", JSON.stringify(objDSGioSP));
                console.log('Saved dsGioSP:', localStorage.getItem('dsGioSP'));
                // keep modal open so user can choose CTA (View cart / Continue shopping)
            }, 1000); // Reduced delay for better UX
        });
    }

    renderPaginationControls(totalItems, currentPage, itemsPerPage) {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const paginationContainer = $("#pagination-controls");
        paginationContainer.empty(); // Clear previous controls

        if (totalPages <= 1) {
            return; // No pagination needed for 1 or fewer pages
        }

        // Previous button
        const prevButton = $("<button>").text("Trước").prop("disabled", currentPage === 1);
        prevButton.on("click", () => {
            if (currentPage > 1) {
                window.changePage(currentPage - 1);
            }
        });
        paginationContainer.append(prevButton);

        // Page number buttons
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = $("<button>").text(i).addClass(i === currentPage ? "active" : "");
            pageButton.on("click", () => {
                window.changePage(i);
            });
            paginationContainer.append(pageButton);
        }

        // Next button
        const nextButton = $("<button>").text("Sau").prop("disabled", currentPage === totalPages);
        nextButton.on("click", () => {
            if (currentPage < totalPages) {
                window.changePage(currentPage + 1);
            }
        });
        paginationContainer.append(nextButton);
    }

    locSanpham(boloc, arr, currentPage = 1, itemsPerPage = 8) {
        $("#inputTimkiem").val("");
        $("#products .rowProducts").remove();
        $("#products .no-products-found").remove();

        let arrSPtoShow = [];
        let filteredArr = [];

        for (let i = 0; i < arr.length; i++) {
            let product = arr[i];
            let match = true;

            // Lọc về Công suất
            if (boloc[0] !== "congsuat" && parseFloat(boloc[0]) !== product.congsuatLamlanh) {
                match = false;
            }

            // Lọc về Hãng
            if (match && boloc[1] !== "hang" && boloc[1] !== product.hang) {
                match = false;
            }

            // Lọc về giá
            if (match && boloc[2] !== "gia") {
                let giaValue = parseFloat(product.gia.replace(/\./g, ""));
                let priceCategory = "";
                if (giaValue < 7000000) {
                    priceCategory = "low7tr";
                } else if (giaValue >= 7000000 && giaValue < 9000000) {
                    priceCategory = "7to9tr";
                } else if (giaValue >= 9000000 && giaValue < 12000000) {
                    priceCategory = "9to12tr";
                } else if (giaValue >= 12000000 && giaValue <= 15000000) {
                    priceCategory = "12to15tr";
                } else {
                    priceCategory = "up20tr";
                }
                if (boloc[2] !== priceCategory) {
                    match = false;
                }
            }

            // Lọc về tiện ích
            if (match && boloc[3] !== "tienich") {
                let tienichNormalized = chuyendoiChuoi(product.tienich);
                if (tienichNormalized.indexOf(boloc[3]) === -1) {
                    match = false;
                }
            }

            if (match) {
                filteredArr.push(product);
            }
        }

        // Sắp xếp các sản phẩm theo tiêu chí giá
        if (boloc[4] === "thapdencao") {
            filteredArr.sort((a, b) => parseFloat(a.gia.replace(/\./g, "")) - parseFloat(b.gia.replace(/\./g, "")));
        } else if (boloc[4] === "caodenthap") {
            filteredArr.sort((a, b) => parseFloat(b.gia.replace(/\./g, "")) - parseFloat(a.gia.replace(/\./g, "")));
        }

        arrSPtoShow = filteredArr;

        // Nếu không có sản phẩm nào thỏa mãn bộ lọc
        if (arrSPtoShow.length === 0) {
            $("#products").append("<div class='rowProducts no-products-found'><b>Không sản phẩm nào được tìm thấy</b></div>");
            this.renderPaginationControls(0, currentPage, itemsPerPage); // Render controls with 0 items
        } else {
            // Hiển thị các sản phẩm thỏa mãn bộ lọc lên giao diện
            this.themSanpham(arrSPtoShow, currentPage, itemsPerPage);

            sessionStorage.setItem("boloc", JSON.stringify(boloc));
            sessionStorage.removeItem("timkiemDSSP");
        }
    }

    timkiemSanpham(input, arr, currentPage = 1, itemsPerPage = 8) {
        $("#congsuat").val("congsuat");
        $("#hang").val("hang");
        $("#gia").val("gia");
        $("#tienich").val("tienich");
        $("#xeptheo").val("macdinh");
        $("#products .rowProducts").remove();
        $("#products .no-products-found").remove();

        input = chuyendoiChuoi(input); // Normalize and clean input
        let arrSPtoShow = [];

        for (let i = 0; i < arr.length; i++) {
            let product = arr[i];
            let ten = chuyendoiChuoi(product.ten);
            let noiSanxuat = chuyendoiChuoi(product.noiSanxuat);
            let congngheKhangkhuan = chuyendoiChuoi(product.congngheKhangkhuan);
            let congngheTietkiemDien = chuyendoiChuoi(product.congngheTietkiemDien);
            let tienich = chuyendoiChuoi(product.tienich);

            if (ten.includes(input) ||
                noiSanxuat.includes(input) ||
                congngheKhangkhuan.includes(input) ||
                congngheTietkiemDien.includes(input) ||
                tienich.includes(input)) {
                arrSPtoShow.push(product);
            }
        }

        // Nếu không có sản phẩm nào phù hợp với kết quả tìm kiếm
        if (arrSPtoShow.length === 0) {
            $("#products").append("<div class='rowProducts no-products-found'><b>Không sản phẩm nào được tìm thấy</b></div>");
            this.renderPaginationControls(0, currentPage, itemsPerPage); // Render controls with 0 items
        } else {
            // Hiển thị các sản phẩm phù hợp kết quả tìm kiếm
            this.themSanpham(arrSPtoShow, currentPage, itemsPerPage);
            if (arr.length !== 8) { // This condition seems to distinguish between DSSP and Trangchu
                sessionStorage.setItem("timkiemDSSP", input);
                sessionStorage.removeItem("boloc");
            } else {
                sessionStorage.setItem("timkiemTrangchu", input);
            }
        }
    }
}

function chuyendoiChuoi(str) {
    if (typeof str !== 'string') {
        return '';
    }
    return str.normalize("NFD")
        .toLowerCase()
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, "d")
        .replace(/[ \-\$\$/,.]/g, ""); // Added . to remove dots from prices
}

export { Sanpham }