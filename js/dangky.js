$(document).ready(function() {
    
    // 0. HÀM HIỂN THỊ/ẨN THÔNG BÁO CHUNG
    function showFormMessage(message, type) {
        const $msgBox = $('#formMessage');
        $msgBox.text(message)
               .removeClass('success error')
               .addClass(type)
               .slideDown(300); 
        $('html, body').animate({ scrollTop: $msgBox.offset().top - 20 }, 500);
    }

    function hideFormMessage() {
        $('#formMessage').slideUp(300);
    }

    // 1. TẢI DỮ LIỆU TỰ ĐỘNG (NGÀY/THÁNG/NĂM)
    function loadDateOptions() {
        const $ngay = $('#ngay');
        const $thang = $('#thang');
        const $nam = $('#nam');

        $ngay.empty().append('<option value="">Ngày</option>');
        $thang.empty().append('<option value="">Tháng</option>');
        $nam.empty().append('<option value="">Năm</option>');

        for (let i = 1; i <= 31; i++) {
            $ngay.append(`<option value="${i}">${i}</option>`);
        }
        for (let i = 1; i <= 12; i++) {
            $thang.append(`<option value="${i}">Tháng ${i}</option>`);
        }
        const currentYear = new Date().getFullYear();
        for (let i = currentYear; i >= currentYear - 100; i--) {
            $nam.append(`<option value="${i}">${i}</option>`);
        }
    }

    loadDateOptions();

    // 2. CHỨC NĂNG ẨN/HIỆN MẬT KHẨU
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
    setupPasswordToggle('txtNLMK', 'toggleNLMK');

    // 3. HÀM VALIDATION CHO TỪNG TRƯỜNG
    function showMessage(elementId, message) { 
        $('#' + elementId).text(message).show(); 
    }
    
    function hideMessage(elementId) { 
        $('#' + elementId).text('').hide(); 
    }

    function checkTenDangNhap() {
        const username = $('#txtTenDangnhap').val().trim();
        if (username === '' || username.length < 6 || username.length > 20 || !/^[a-zA-Z0-9._-]+$/.test(username)) {
            showMessage('messTenDangnhap', 'Tên đăng nhập phải từ 6-20 ký tự, chỉ dùng chữ, số, gạch dưới, gạch ngang, dấu chấm.');
            return false;
        }
        hideMessage('messTenDangnhap');
        return true;
    }

    function checkEmail() {
        const email = $('#txtEmail').val().trim();
        const regex = /^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/;

        if (email === '' || !regex.test(email)) {
            showMessage('messEmail', 'Định dạng email không hợp lệ.');
            return false;
        }

        hideMessage('messEmail');
        return true;
    }

    function checkMatKhau() {
        const password = $('#txtMatkhau').val();
        if (password === '' || password.length < 8 || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
            showMessage('messMatkhau', 'Mật khẩu phải có tối thiểu 8 ký tự, chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số.');
            return false;
        }
        hideMessage('messMatkhau');
        return true;
    }

    function checkNLMK() {
        const password = $('#txtMatkhau').val();
        const confirmPassword = $('#txtNLMK').val();
        
        if (confirmPassword === '') {
            showMessage('messNLMK', 'Vui lòng nhập lại mật khẩu.');
            return false;
        }
        if (password !== confirmPassword) {
            showMessage('messNLMK', 'Mật khẩu nhập lại không khớp.');
            return false;
        }
        hideMessage('messNLMK');
        return true;
    }
    
    function checkHoTen() {
        const hoten = $('#txtHoten').val().trim();
        const regex = /^([A-Z]{1}[a-z]*)(\s[A-Z]{1}[a-z]*)*$/;

        if (hoten === '' || !regex.test(hoten)) {
            showMessage('messHoten', 'Họ tên phải viết hoa chữ cái đầu mỗi từ và không chứa dấu.');
            return false;
        }

        hideMessage('messHoten');
        return true;
    }
    
    function checkSDT() {
        const sdt = $('#txtDT').val().trim();
        const regex = /^(09|03)\d{8}$/;

        if (sdt === '' || !regex.test(sdt)) {
            showMessage('messDT', 'Số điện thoại phải bắt đầu bằng 09 hoặc 03 và có 10 số.');
            return false;
        }

        hideMessage('messDT');
        return true;
    }
    
    function checkDiaChi() {
        const diachi = $('#txtDiachi').val().trim();
        const regex = /^\d+\s+[\w\s]+$/;

        if (diachi === '' || !regex.test(diachi)) {
            showMessage('messDiachi', 'Địa chỉ không hợp lệ. Ví dụ: 123 Đường ABC, Ấp XYZ, Huyện DEF');
            return false;
        }

        hideMessage('messDiachi');
        return true;
    }
    
    function checkTinhThanhPho() {
        const ttp = $('#tinhThanhPho').val().trim();
        if (ttp === '' || ttp.length < 3) {
            showMessage('messTTP', 'Tên Tỉnh/Thành phố không được để trống.');
            return false;
        }
        hideMessage('messTTP');
        return true;
    }

    function checkNgaySinh() {
        const ngay = $('#ngay').val();
        const thang = $('#thang').val();
        const nam = $('#nam').val();
        
        if (ngay === '' && thang === '' && nam === '') {
            hideMessage('messNgaySinh');
            return true;
        }
        
        if (ngay === '' || thang === '' || nam === '') {
            showMessage('messNgaySinh', 'Vui lòng chọn đầy đủ Ngày/Tháng/Năm.');
            return false;
        }
        
        const date = new Date(nam, thang - 1, ngay);
        if (date.getFullYear() != nam || date.getMonth() + 1 != thang || date.getDate() != ngay) {
            showMessage('messNgaySinh', 'Ngày sinh không hợp lệ.');
            return false;
        }
        
        hideMessage('messNgaySinh');
        return true;
    }

    // 4. GÁN SỰ KIỆN KIỂM TRA LỖI KHI NHẬP LIỆU (ON BLUR/CHANGE)
    $('#txtTenDangnhap').on('blur', checkTenDangNhap);
    $('#txtEmail').on('blur', checkEmail);
    $('#txtMatkhau').on('blur', checkMatKhau);
    $('#txtNLMK').on('blur', checkNLMK);
    $('#txtHoten').on('blur', checkHoTen);
    $('#txtDT').on('blur', checkSDT);
    $('#txtDiachi').on('blur', checkDiaChi);
    $('#tinhThanhPho').on('blur', checkTinhThanhPho); 
    $('#ngay, #thang, #nam').on('change', checkNgaySinh);

    // 5. KIỂM TRA FORM HỢP LỆ
    function isFormValid() {
        const validations = [
            checkTenDangNhap(),
            checkEmail(),
            checkMatKhau(),
            checkNLMK(),
            checkHoTen(),
            checkSDT(),
            checkDiaChi(),
            checkTinhThanhPho(),
            checkNgaySinh()
        ];
        
        return validations.every(valid => valid === true);
    }

    // 6. KIỂM TRA TRÙNG LẶP TÀI KHOẢN
    function checkDuplicateAccount(username, email) {
        const accounts = JSON.parse(localStorage.getItem('dsUser')) || [];
        
        const existingUser = accounts.find(account => 
            account.username === username || account.email === email
        );
        
        return existingUser;
    }

    // 7. XỬ LÝ SỰ KIỆN SUBMIT FORM VÀ LƯU VÀO LOCAL STORAGE
    $('#formDangky').on('submit', function(e) {
        e.preventDefault(); 
        hideFormMessage();

        // Kiểm tra form hợp lệ
        if (!isFormValid()) {
            showFormMessage("Vui lòng kiểm tra lại các trường bị lỗi và điền đầy đủ các thông tin bắt buộc (*).", 'error');
            return;
        }

        // Lấy dữ liệu đăng ký
        const newUsername = $('#txtTenDangnhap').val().trim();
        const newEmail = $('#txtEmail').val().trim();
        const newPassword = $('#txtMatkhau').val();
        const newHoTen = $('#txtHoten').val().trim();
        const newSDT = $('#txtDT').val().trim();
        const newDiaChi = $('#txtDiachi').val().trim();
        const newTinhThanhPho = $('#tinhThanhPho').val().trim();
        const ngay = $('#ngay').val();
        const thang = $('#thang').val();
        const nam = $('#nam').val();
        const newNgaySinh = (ngay && thang && nam) ? `${ngay}/${thang}/${nam}` : '';

        // Kiểm tra trùng lặp tài khoản
        const existingUser = checkDuplicateAccount(newUsername, newEmail);
        if (existingUser) {
            if (existingUser.username === newUsername) {
                showFormMessage("Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.", 'error');
                return;
            }
            if (existingUser.email === newEmail) {
                showFormMessage("Email đã được sử dụng. Vui lòng sử dụng email khác.", 'error');
                return;
            }
        }

        // Lấy danh sách tài khoản hiện tại
        let accounts = JSON.parse(localStorage.getItem('dsUser')) || [];

        // Thêm tài khoản mới
        const newAccount = {
            username: newUsername,
            email: newEmail,
            password: newPassword,
            fullname: newHoTen,
            phone: newSDT,
            diaChi: newDiaChi,
            tinhThanh: newTinhThanhPho,
            ngaySinh: newNgaySinh,
            gioiTinh: $('#txtGioitinh').val() || '',
            ngayDangKy: new Date().toISOString().split('T')[0]
        };

        accounts.push(newAccount);

        // Lưu lại danh sách tài khoản
        localStorage.setItem('dsUser', JSON.stringify(accounts));

        // Hiển thị thông báo thành công
        showFormMessage("🎉 Đăng ký thành công! Bạn sẽ được chuyển đến trang đăng nhập...", 'success');

        // Chuyển hướng đến trang đăng nhập sau 2 giây
        setTimeout(() => {
            window.location.href = 'dangnhap.html';
        }, 2000);
    });

    // 8. RESET FORM KHI CLICK NÚT RESET
    $('#btnReset').on('click', function() {
        hideFormMessage();
        // Ẩn tất cả thông báo lỗi
        $('[id^="mess"]').text('').hide();
    });
});