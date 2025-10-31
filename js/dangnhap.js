$(document).ready(function() {
    
    // =================================================================
    // 0. HÀM HIỂN THỊ/ẨN THÔNG BÁO CHUNG
    // =================================================================
    function showFormMessage(message, type) {
        const $msgBox = $('#formMessage');
        $msgBox.text(message)
               .removeClass('success error')
               .addClass(type)
               .slideDown(300); 
        $('html, body').animate({ scrollTop: $msgBox.offset().top - 20 }, 500);

        // Tự động ẩn sau 5 giây (nếu thành công)
        if (type === 'success') {
            setTimeout(() => {
                $msgBox.slideUp(300);
            }, 5000);
        }
    }

    function hideFormMessage() {
        $('#formMessage').slideUp(300);
    }
    
    // =================================================================
    // 1. CHỨC NĂNG ẨN/HIỆN MẬT KHẨU
    // =================================================================
    
    function setupPasswordToggle(inputId, buttonId) {
        const $passwordInput = $('#' + inputId);
        const $toggleButton = $('#' + buttonId);

        $toggleButton.on('click', function() {
            const type = $passwordInput.attr('type') === 'password' ? 'text' : 'password';
            $passwordInput.attr('type', type);
            $(this).toggleClass('hide-pass');
        });
    }

    setupPasswordToggle('txtMatkhau', 'togglePassword');


    // =================================================================
    // 2. HÀM VALIDATION CHO TỪNG TRƯỜNG
    // =================================================================
    
    function showMessage(elementId, message) { $('#' + elementId).text(message).show(); }
    function hideMessage(elementId) { $('#' + elementId).text('').hide(); }

    function checkUserEmail() {
        const input = $('#txtUserEmail').val().trim();
        if (input === '') {
            showMessage('messUserEmail', 'Tên đăng nhập hoặc Email không được để trống.');
            return false;
        }
        hideMessage('messUserEmail');
        return true;
    }

    function checkMatKhau() {
        const password = $('#txtMatkhau').val();
        if (password === '') {
            showMessage('messMatkhau', 'Mật khẩu không được để trống.');
            return false;
        }
        hideMessage('messMatkhau');
        return true;
    }

    // =================================================================
    // 3. GÁN SỰ KIỆN KIỂM TRA LỖI KHI NHẬP LIỆU (ON BLUR)
    // =================================================================

    $('#txtUserEmail').on('blur', checkUserEmail);
    $('#txtMatkhau').on('blur', checkMatKhau);

    // =================================================================
    // 4. XỬ LÝ SỰ KIỆN SUBMIT FORM ĐĂNG NHẬP
    // =================================================================

    $('#formDangnhap').on('submit', function(e) {
        e.preventDefault(); 
        hideFormMessage();
        
        const isUserEmailValid = checkUserEmail();
        const isPassValid = checkMatKhau();
        
        const isFormValid = isUserEmailValid && isPassValid;

        if (!isFormValid) {
            showFormMessage("Vui lòng điền đầy đủ Tên đăng nhập/Email và Mật khẩu.", 'error');
        } else {
            
            // Lấy dữ liệu từ form Đăng nhập
            const inputIdentifier = $('#txtUserEmail').val().trim();
            const inputPassword = $('#txtMatkhau').val();
            
            // B1. Lấy danh sách tài khoản từ Local Storage
            const accounts = JSON.parse(localStorage.getItem('registeredAccounts')) || [];

            // B2. Tìm tài khoản khớp
            const foundAccount = accounts.find(account => 
                (account.username === inputIdentifier || account.email === inputIdentifier) && 
                account.password === inputPassword
            );

            if (foundAccount) {
                // Đăng nhập thành công
                showFormMessage(`🎉 Chào mừng ${foundAccount.fullname || foundAccount.username}! Đăng nhập thành công.`, 'success');
                
                // LƯU THÔNG TIN TÀI KHOẢN HIỆN TẠI (ĐỂ TAISHOAN.JS SỬ DỤNG)
                localStorage.setItem('currentUser', JSON.stringify(foundAccount)); 
                // Lưu thêm dưới key cũ 'tkDangnhap' để tương thích với các script cũ (sanpham.js, giohang.js...)
                try {
                    const legacy = {
                        ten_dangnhap: foundAccount.username || foundAccount.ten_dangnhap || '',
                        hoTen: foundAccount.fullname || foundAccount.hoTen || '',
                        dienThoai: foundAccount.phone || foundAccount.dienThoai || '',
                        diaChi: foundAccount.diaChi || foundAccount.diaChi || '',
                        gioiTinh: foundAccount.gioiTinh || foundAccount.gioiTinh || ''
                    };
                    localStorage.setItem('tkDangnhap', JSON.stringify(legacy));
                } catch (e) { console.warn('Không thể lưu tkDangnhap (legacy)', e); }

                // Chuyển hướng sau 3 giây
                setTimeout(() => {
                     window.location.href = "trangchu.html"; 
                }, 3000); 
            } else {
                // Đăng nhập thất bại
                showFormMessage("Tên đăng nhập, Email hoặc Mật khẩu không chính xác. Vui lòng thử lại.", 'error');
            }
        }
    });
});