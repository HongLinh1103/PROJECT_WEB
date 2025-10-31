$(window).ready(function () {
    // Hỗ trợ 2 khóa trước kia: 'tkDangnhap' (cũ) và 'currentUser' (mới)
    let currentUser = localStorage.getItem("currentUser");
    if (!currentUser && localStorage.getItem('tkDangnhap')) {
        // Nếu có dữ liệu cũ, migrate sang key mới để thống nhất
        localStorage.setItem('currentUser', localStorage.getItem('tkDangnhap'));
        currentUser = localStorage.getItem('currentUser');
    }
    // Nếu đã có currentUser nhưng key cũ tkDangnhap chưa tồn tại, tạo bản sao legacy để tương thích
    if (currentUser && !localStorage.getItem('tkDangnhap')) {
        try {
            const u = JSON.parse(currentUser);
            const legacy = {
                ten_dangnhap: u.username || u.ten_dangnhap || '',
                hoTen: u.fullname || u.hoTen || '',
                dienThoai: u.phone || u.dienThoai || '',
                diaChi: u.diaChi || u.diaChi || '',
                gioiTinh: u.gioiTinh || u.gioiTinh || ''
            };
            localStorage.setItem('tkDangnhap', JSON.stringify(legacy));
        } catch (e) { console.warn('Không thể tạo tkDangnhap từ currentUser', e); }
    }
    
    // =================================================================
    // 1. XỬ LÝ HIỂN THỊ TÀI KHOẢN TRÊN HEADER
    // =================================================================
    if (currentUser != null) {
        $("#dkdn").hide() // Ẩn nút Đăng ký/Đăng nhập
        $("#divTaikhoan").show() // Hiện nút Tài khoản

        const ttTaikhoan = JSON.parse(currentUser)
        
        // Lấy chữ cái đầu của tên để hiển thị trên nút dropbtn (fallbacks nếu thiếu dữ liệu)
        const nameSource = ttTaikhoan.fullname || ttTaikhoan.username || '';
        const hoten = nameSource.split(" ")
        const ten = hoten[hoten.length - 1] || ''
        const kytuDauCuaTen = ten ? ten[0] : ''
        $("#taikhoan").text(kytuDauCuaTen.toUpperCase())

        // Ẩn mật khẩu bằng dấu * (an toàn nếu password undefined)
        const pwd = ttTaikhoan.password || '';
        const star = pwd.replace(/./g, '*');
        
        // Render a minimal dropdown with three choices as requested by the UI spec:
        // - Tài khoản của tôi -> taikhoancuatoi.html
        // - Đổi mật khẩu -> taikhoancuatoi.html#doiMK (will open change-password section)
        // - Đăng xuất -> dngxuat.html (we also call doLogout to clear localStorage)
        const $tt = $("#ttTaikhoan");
        if ($tt.length) {
            // Render as a simple list of links to match the not-logged-in dropdown style
            $tt.empty();
            $tt.append(`
                <a href="taikhoancuatoi.html">Tài khoản của tôi</a>
                <a href="taikhoancuatoi.html#doiMK">Đổi mật khẩu</a>
                <a href="#" id="dropdownDangXuat">Đăng xuất</a>
            `);
            // Bind logout: clear storage then navigate to logout landing
            $tt.find('#dropdownDangXuat').on('click', function(e){ e.preventDefault(); doLogout(); });
        }

    } else {
        $("#dkdn").show()
        $("#divTaikhoan").hide()
    }
    
    // =================================================================
    // CẬP NHẬT CÁC LIÊN KẾT 'Đăng nhập' TRÊN TOÀN TRANG -> chuyển thành 'Đăng xuất' khi đã đăng nhập
    // =================================================================
    function doLogout() {
        localStorage.removeItem('currentUser'); // Xóa trạng thái đăng nhập
        localStorage.removeItem('tkDangnhap'); // Nếu có key cũ, cũng xóa
        // Cập nhật UI
        $("#dkdn").show();
        $("#divTaikhoan").hide();
        attachLogoutToElements();
        // Chuyển về trang xác nhận đăng xuất (dngxuat.html) nếu có, còn không thì về dangnhap
        const logoutLanding = 'dngxuat.html';
        try {
            // Nếu hiện đang ở trang logout landing thì reload
            if (window.location.pathname.toLowerCase().endsWith(logoutLanding)) {
                window.location.reload();
            } else {
                window.location.href = logoutLanding;
            }
        } catch (e) {
            window.location.href = 'dangnhap.html';
        }
    }

    function attachLogoutToElements() {
        const isLoggedIn = !!localStorage.getItem('currentUser');
        $('a[href="dangnhap.html"]').each(function() {
            const $a = $(this);
            if (isLoggedIn) {
                // lưu href gốc nếu cần khôi phục
                if (!$a.data('orig-href')) $a.data('orig-href', $a.attr('href'));
                $a.attr('href', '#');
                $a.text('Đăng xuất');
                $a.off('click.logout').on('click.logout', function(e) {
                    e.preventDefault();
                    doLogout();
                });
            } else {
                // khôi phục về Đăng nhập
                const orig = $a.data('orig-href') || 'dangnhap.html';
                $a.attr('href', orig);
                $a.text('Đăng nhập');
                $a.off('click.logout');
            }
        });
    }

    // Gọi để cập nhật các liên kết khi load trang
    attachLogoutToElements();
    
    // =================================================================
    // 1. Toggle dropdown khi click vào avatar (taikhoan)
    //    - Click vào #taikhoan sẽ bật/tắt class 'show' trên #divTaikhoan
    //    - Click ra ngoài sẽ đóng dropdown
    // =================================================================
    // Make click handling robust: delegate from document so handler attaches even if
    // element is replaced later. Also add console logs to help debugging.
    $(document).on('click', '#taikhoan', function(e) {
        e.stopPropagation();
        // Toggle visible state
        $('#divTaikhoan').toggleClass('show');
        const isOpen = $('#divTaikhoan').hasClass('show');
        // accessibility hint
        $(this).attr('aria-expanded', isOpen ? 'true' : 'false');
        console.log('taikhoan clicked, dropdown open=', isOpen);
    });

    // Ngăn sự kiện click bên trong dropdown làm đóng nó
    $(document).on('click', '#ttTaikhoan', function(e) { e.stopPropagation(); });

    // Click ra ngoài sẽ đóng dropdown
    $(document).on('click', function() { $('#divTaikhoan').removeClass('show'); $('#taikhoan').attr('aria-expanded','false'); });
    
    // =================================================================
    // 3. XỬ LÝ ĐĂNG XUẤT
    // =================================================================
    $("#dangXuat").on('click', function() {
        doLogout();
    });
});