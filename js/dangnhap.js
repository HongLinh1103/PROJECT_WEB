$(document).ready(function() {
   
    // 0. HÀM HIỂN THỊ/ẨN THÔNG BÁO CHUNG
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
    
    // 1. CHỨC NĂNG ẨN/HIỆN MẬT KHẨU
    
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

    // 2. HÀM VALIDATION CHO TỪNG TRƯỜNG
    
    function showMessage(elementId, message) { 
        $('#' + elementId).text(message).show(); 
    }
    
    function hideMessage(elementId) { 
        $('#' + elementId).text('').hide(); 
    }

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

    // 3. GÁN SỰ KIỆN KIỂM TRA LỚI KHI NHẬP LIỆU (ON BLUR)
    $('#txtUserEmail').on('blur', checkUserEmail);
    $('#txtMatkhau').on('blur', checkMatKhau);

    // 4. KIỂM TRA FORM HỢP LỆ
    function isFormValid() {
        return checkUserEmail() && checkMatKhau();
    }

    // 5. XỬ LÝ SỰ KIỆN SUBMIT FORM ĐĂNG NHẬP
    $('#formDangnhap').on('submit', function(e) {
        e.preventDefault(); 
        hideFormMessage();
        
        // Kiểm tra form hợp lệ
        if (!isFormValid()) {
            showFormMessage("Vui lòng điền đầy đủ Tên đăng nhập/Email và Mật khẩu.", 'error');
            return;
        }

        // Lấy dữ liệu từ form Đăng nhập
        const inputIdentifier = $('#txtUserEmail').val().trim();
        const inputPassword = $('#txtMatkhau').val();
        
        // Lấy danh sách tài khoản từ Local Storage
        const accounts = JSON.parse(localStorage.getItem('dsUser')) || [];

        // Tìm tài khoản khớp
        const foundAccount = accounts.find(account => 
            (account.username === inputIdentifier || account.email === inputIdentifier) && 
            account.password === inputPassword
        );

        if (foundAccount) {
            // ĐĂNG NHẬP THÀNH CÔNG
            
            // Lưu thông tin user đăng nhập vào currentUser
            localStorage.setItem('currentUser', JSON.stringify(foundAccount));
            
            // Hiển thị thông báo thành công
            showFormMessage("🎉 Đăng nhập thành công! Chào mừng " + foundAccount.fullname + " quay trở lại!", 'success');
            
            // Chuyển hướng đến trang chủ sau 2 giây
            setTimeout(() => {
                window.location.href = 'trangchu.html';
            }, 2000);
            
        } else {
            // ĐĂNG NHẬP THẤT BẠI
            
            // Kiểm tra xem username/email có tồn tại không
            const userExists = accounts.some(account => 
                account.username === inputIdentifier || account.email === inputIdentifier
            );
            
            if (userExists) {
                showFormMessage(" Mật khẩu không chính xác. Vui lòng thử lại.", 'error');
            } else {
                showFormMessage(" Tên đăng nhập/Email không tồn tại. Vui lòng kiểm tra lại hoặc đăng ký tài khoản mới.", 'error');
            }
        }
    });

    // 6. XỬ LÝ ENTER KEY ĐỂ SUBMIT
    $('#txtUserEmail, #txtMatkhau').on('keypress', function(e) {
        if (e.which === 13) {
            $('#formDangnhap').submit();
        }
    });

    // 7. RESET FORM KHI CLICK NÚT RESET
    $('#btnReset').on('click', function() {
        hideFormMessage();
        // Ẩn tất cả thông báo lỗi
        $('[id^="mess"]').text('').hide();
    });

    // 8. TỰ ĐỘNG FOCUS VÀO Ô INPUT ĐẦU TIÊN
    $('#txtUserEmail').focus();

});