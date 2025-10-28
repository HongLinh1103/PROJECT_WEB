$(window).ready(function () {
    const currentUser = localStorage.getItem("currentUser")
    
    // =================================================================
    // 1. XỬ LÝ HIỂN THỊ TÀI KHOẢN TRÊN HEADER
    // =================================================================
    if (currentUser != null) {
        $("#dkdn").hide() // Ẩn nút Đăng ký/Đăng nhập
        $("#divTaikhoan").show() // Hiện nút Tài khoản

        const ttTaikhoan = JSON.parse(currentUser)
        
        // Lấy chữ cái đầu của tên để hiển thị trên nút dropbtn
        let hoten = ttTaikhoan.fullname.split(" ")
        let ten = hoten[hoten.length - 1]
        let kytuDauCuaTen = ten[0]
        $("#taikhoan").text(kytuDauCuaTen.toUpperCase())
        
        // Ẩn mật khẩu bằng dấu *
        let star = "";
        for (let i = 0; i < ttTaikhoan.password.length; i++) {
            star += "*"
        }
        
        // Cập nhật nội dung thông tin chi tiết
        const $infoList = $("#info");
        $infoList.empty(); // Xóa nội dung cũ và thêm lại
        
        $infoList.append(`<li><b>Tên đăng nhập: </b><span id="tenDangnhap">${ttTaikhoan.username}</span></li>`);
        $infoList.append(`<li><b>Mật khẩu: </b><span id="matkhau">${star}</span><span id="passEye"><img width="22" src="../img/closePassEye.png" alt="Hiện/Ẩn"></span></li>`);
        $infoList.append(`<li><b>Họ và tên: </b><span id="hoten">${ttTaikhoan.fullname}</span></li>`);
        $infoList.append(`<li><b>Số điện thoại: </b><span id="sdt">${ttTaikhoan.phone}</span></li>`);
        
        if (ttTaikhoan.ngaySinh && ttTaikhoan.ngaySinh.includes('-')) {
            let ngaysinhParts = ttTaikhoan.ngaySinh.split("-");
            let ngaysinh = `${ngaysinhParts[2]}/${ngaysinhParts[1]}/${ngaysinhParts[0]}`;
            $infoList.append(`<li><b>Ngày sinh: </b>${ngaysinh}</li>`);
        }
        if (ttTaikhoan.gioiTinh) {
            $infoList.append(`<li><b>Giới tính: </b>${ttTaikhoan.gioiTinh}</li>`);
        }
        if (ttTaikhoan.email) {
            $infoList.append(`<li><b>Email: </b>${ttTaikhoan.email}</li>`);
        }
        if (ttTaikhoan.diaChi) {
            $infoList.append(`<li><b>Địa chỉ: </b>${ttTaikhoan.diaChi}</li>`);
        }
        
        // =================================================================
        // 2. LOGIC ẨN/HIỆN MẬT KHẨU TRONG DROPDOWN
        // =================================================================
        $('#passEye').on('click', function() {
            const $matkhauSpan = $('#matkhau');
            const $img = $(this).find('img');
            
            if ($matkhauSpan.text() === star) {
                // Đang ẩn -> Hiện mật khẩu
                $matkhauSpan.text(ttTaikhoan.password);
                $img.attr('src', '../img/openPassEye.png'); // Thay bằng icon con mắt mở
            } else {
                // Đang hiện -> Ẩn mật khẩu
                $matkhauSpan.text(star);
                $img.attr('src', '../img/closePassEye.png'); // Thay bằng icon con mắt đóng
            }
        });

    } else {
        $("#dkdn").show()
        $("#divTaikhoan").hide()
    }
    
    // =================================================================
    // 3. XỬ LÝ ĐĂNG XUẤT
    // =================================================================
    $("#dangXuat").on('click', function() {
        localStorage.removeItem('currentUser'); // Xóa trạng thái đăng nhập
        // Xóa luôn danh sách tài khoản đã đăng ký (Tùy chọn, để dễ test)
        // localStorage.removeItem('registeredAccounts'); 
        window.location.href = "dangnhap.html"; // Chuyển về trang Đăng nhập
    });
});