$(window).ready(function () {
    // Hỗ trợ 2 khóa trước kia: 'tkDangnhap' (cũ) và 'currentUser' (mới)
    let currentUser = localStorage.getItem("currentUser");
    if (!currentUser && localStorage.getItem('tkDangnhap')) {
        // Nếu có dữ liệu cũ, migrate sang key mới để thống nhất
        localStorage.setItem('currentUser', localStorage.getItem('tkDangnhap'));
        currentUser = localStorage.getItem('currentUser');
    }
    
    // 1. XỬ LÝ HIỂN THỊ TÀI KHOẢN TRÊN HEADER
    function updateUI() {
        if (currentUser != null) {
            // ĐÃ ĐĂNG NHẬP: Hiện avatar, ẩn nút đăng ký/đăng nhập
            $("#dkdn").hide();
            $("#divTaikhoan").show();

            // Hiện liên kết 'Đơn hàng của tôi'
            try { $("#donhangNav").show(); } catch (e) { /* no-op if element absent */ }

            const ttTaikhoan = JSON.parse(currentUser);
            
            // Lấy chữ cái đầu của tên để hiển thị trên avatar
            const nameSource = ttTaikhoan.fullname || ttTaikhoan.username || '';
            const hoten = nameSource.split(" ");
            const ten = hoten[hoten.length - 1] || '';
            const kytuDauCuaTen = ten ? ten[0] : (nameSource ? nameSource[0] : '?');
            $("#taikhoan").text(kytuDauCuaTen.toUpperCase());

            // CẬP NHẬT DROPDOWN CHO TRẠNG THÁI ĐÃ ĐĂNG NHẬP
            const $tt = $("#ttTaikhoan");
            if ($tt.length) {
                $tt.empty();
                $tt.append(`
                    <a href="taikhoancuatoi.html"><i class="fa fa-user"></i> Tài khoản của tôi</a>
                    <a href="taikhoancuatoi.html#doiMK"><i class="fa fa-key"></i> Đổi mật khẩu</a>
                    <a href="#" id="dropdownDangXuat"><i class="fa fa-sign-out"></i> Đăng xuất</a>
                `);
                // Bind logout
                $tt.find('#dropdownDangXuat').on('click', function(e){ 
                    e.preventDefault(); 
                    doLogout(); 
                });
            }

        } else {
            // CHƯA ĐĂNG NHẬP: Hiện nút đăng ký/đăng nhập, ẩn avatar
            $("#dkdn").show();
            $("#divTaikhoan").hide();
            
            // Ẩn liên kết 'Đơn hàng của tôi'
            try { $("#donhangNav").hide(); } catch (e) { /* no-op if element absent */ }

            // CẬP NHẬT DROPDOWN CHO TRẠNG THÁI CHƯA ĐĂNG NHẬP
            const $myDropdown = $("#myDropdown");
            if ($myDropdown.length) {
                $myDropdown.empty();
                $myDropdown.append(`
                    <a href="dangky.html"><i class="fa fa-user-plus"></i> Đăng ký</a>
                    <a href="dangnhap.html"><i class="fa fa-sign-in"></i> Đăng nhập</a>
                `);
            }
        }
        
        // Cập nhật các liên kết đăng nhập/đăng xuất trong toàn bộ trang
        attachLogoutToElements();
    }

    // Gọi hàm cập nhật UI khi trang load
    updateUI();
    
    function doLogout() {
        console.log('Đang đăng xuất...');
        
        // 1. Xóa TẤT CẢ key phiên làm việc
        localStorage.removeItem('currentUser');
        localStorage.removeItem('tkDangnhap');

        // 2. Xóa TẤT CẢ key lưu trữ DỮ LIỆU CÁ NHÂN
        localStorage.removeItem('userAddress');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userFullname');
        localStorage.removeItem('userPhone');

        // 3. Cập nhật UI ngay lập tức
        $("#dkdn").show();      
        $("#divTaikhoan").hide(); 
        $('#ttTaikhoan').removeClass('show');
        $('#myDropdown').removeClass('show');

        // 4. Thông báo và chuyển hướng
        alert('Bạn đã đăng xuất thành công!');
        
        // 5. Reload để đảm bảo UI được cập nhật hoàn toàn
        setTimeout(() => {
            if (window.location.pathname.includes('taikhoan') || 
                window.location.pathname.includes('dangnhap') ||
                window.location.pathname.includes('dangky')) {
                window.location.href = 'trangchu.html';
            } else {
                window.location.reload();
            }
        }, 500);
    }

    function attachLogoutToElements() {
        const isLoggedIn = !!localStorage.getItem('currentUser');
        
        $('a[href="dangnhap.html"]').each(function() {
            const $a = $(this);
            if (isLoggedIn) {
                // ĐÃ đăng nhập: chuyển thành Đăng xuất
                if (!$a.data('orig-href')) $a.data('orig-href', $a.attr('href'));
                $a.attr('href', '#');
                $a.html('<i class="fa fa-sign-out"></i> Đăng xuất');
                $a.off('click.logout').on('click.logout', function(e) {
                    e.preventDefault();
                    doLogout();
                });
            } else {
                // CHƯA đăng nhập: hiện Đăng nhập
                const orig = $a.data('orig-href') || 'dangnhap.html';
                $a.attr('href', orig);
                $a.html('<i class="fa fa-sign-in"></i> Đăng nhập');
                $a.off('click.logout');
            }
        });
    }
    
    // 2. XỬ LÝ DROPDOWN BEHAVIORS
    $(document).on('click', '#taikhoan', function(e) {
        e.stopPropagation();
        $('#divTaikhoan').toggleClass('show');
        $('#myDropdown').removeClass('show'); // Đảm bảo chỉ 1 dropdown hiện
        const isOpen = $('#divTaikhoan').hasClass('show');
        $(this).attr('aria-expanded', isOpen ? 'true' : 'false');
    });

    $(document).on('click', '#dkdnBtn', function(e) {
        e.stopPropagation();
        $('#myDropdown').toggleClass('show');
        $('#divTaikhoan').removeClass('show'); // Đảm bảo chỉ 1 dropdown hiện
        const isOpen = $('#myDropdown').hasClass('show');
        $(this).attr('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Ngăn sự kiện click bên trong dropdown làm đóng nó
    $(document).on('click', '#ttTaikhoan, #myDropdown', function(e) { 
        e.stopPropagation(); 
    });

    // Click ra ngoài sẽ đóng dropdown
    $(document).on('click', function() { 
        $('#divTaikhoan').removeClass('show'); 
        $('#myDropdown').removeClass('show');
        $('#taikhoan').attr('aria-expanded','false');
        $('#dkdnBtn').attr('aria-expanded','false');
    });
    
    // 3. XỬ LÝ ĐĂNG XUẤT TỪ CÁC NÚT KHÁC
    $(document).on('click', '#dangXuat, #btnDangXuat', function(e) {
        e.preventDefault();
        doLogout();
    });

    // 4. XỬ LÝ PHÍM ESC ĐỂ ĐÓNG DROPDOWN
    $(document).on('keydown', function(e) {
        if (e.key === 'Escape') {
            $('#divTaikhoan').removeClass('show');
            $('#myDropdown').removeClass('show');
        }
    });
});