$(document).ready(function () {

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

    // 1. TẢI DATE
    function loadDateOptions() {
        const $ngay = $('#ngay');
        const $thang = $('#thang');
        const $nam = $('#nam');

        $ngay.empty().append('<option value="">Ngày</option>');
        $thang.empty().append('<option value="">Tháng</option>');
        $nam.empty().append('<option value="">Năm</option>');

        for (let i = 1; i <= 31; i++) $ngay.append(`<option value="${i}">${i}</option>`);
        for (let i = 1; i <= 12; i++) $thang.append(`<option value="${i}">Tháng ${i}</option>`);

        const currentYear = new Date().getFullYear();
        for (let i = currentYear; i >= currentYear - 100; i--)
            $nam.append(`<option value="${i}">${i}</option>`);
    }
    loadDateOptions();

    // 1b. TẢI TỈNH/THÀNH
    function loadProvinces() {
        const provinces = [
            "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu", "Bắc Ninh", "Bến Tre",
            "Bình Định", "Bình Dương", "Bình Phước", "Bình Thuận", "Cà Mau", "Cao Bằng", "Đắk Lắk",
            "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hải Dương",
            "Hậu Giang", "Hòa Bình", "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu",
            "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định", "Nghệ An", "Ninh Bình", "Ninh Thuận",
            "Phú Thọ", "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng",
            "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang",
            "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái", "Hồ Chí Minh", "Hà Nội", "Đà Nẵng"
        ];
        const $datalist = $('#tinhList');
        $datalist.empty();
        provinces.forEach(p => $datalist.append(`<option value="${p}">`));
    }
    loadProvinces();

    // 2. ẨN/HIỆN MẬT KHẨU
    function setupPasswordToggle(inputId, buttonId) {
        const $passwordInput = $('#' + inputId);
        const $toggleButton = $('#' + buttonId);

        $toggleButton.on('click', function () {
            const type = $passwordInput.attr('type') === 'password' ? 'text' : 'password';
            $passwordInput.attr('type', type);
            $(this).toggleClass('hide-pass');
        });
    }
    setupPasswordToggle('txtMatkhau', 'togglePassword');
    setupPasswordToggle('txtNLMK', 'toggleNLMK');

    // 3. VALIDATION
    function showMessage(id, message) {
        $('#' + id).text(message).show();
    }
    function hideMessage(id) {
        $('#' + id).text('').hide();
    }

    function checkTenDangNhap() {
        const username = $('#txtTenDangnhap').val().trim();
        if (username === '' || username.length < 6 || username.length > 20 || !/^[a-zA-Z0-9._-]+$/.test(username)) {
            showMessage('messTenDangnhap', 'Tên đăng nhập phải từ 6-20 ký tự, không ký tự lạ.');
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
        const pw = $('#txtMatkhau').val();
        if (pw === '' || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(pw)) {
            showMessage('messMatkhau', 'Mật khẩu không hợp lệ. Yêu cầu: ≥ 8 ký tự, có chữ hoa, chữ thường và số (ví dụ: Abc12345).');
            return false;
        }
        hideMessage('messMatkhau');
        return true;
    }

    function checkNLMK() {
        const pw = $('#txtMatkhau').val();
        const cf = $('#txtNLMK').val();
        if (cf === '' || pw !== cf) {
            showMessage('messNLMK', 'Mật khẩu nhập lại không khớp.');
            return false;
        }
        hideMessage('messNLMK');
        return true;
    }

    function checkHoTen() {
        const hoten = $('#txtHoten').val().trim();
        const regex = /^([\p{Lu}][\p{Ll}]*)(\s[\p{Lu}][\p{Ll}]*)*$/u;

        if (hoten === '' || !regex.test(hoten)) {
            showMessage('messHoten', 'Họ tên không hợp lệ. Mỗi từ phải bắt đầu bằng chữ cái in hoa, ví dụ: Nguyễn Văn A.');
            return false;
        }
        hideMessage('messHoten');
        return true;
    }

    function checkSDT() {
        const sdt = $('#txtDT').val().trim();
        const regex = /^(09|03)\d{8}$/;

        if (!regex.test(sdt)) {
            showMessage('messDT', 'Số điện thoại phải bắt đầu bằng 09 hoặc 03 (10 số).');
            return false;
        }
        hideMessage('messDT');
        return true;
    }

    function checkDiaChi() {
        const diachi = $('#txtDiachi').val().trim();
        const regex = /^\d+\s+[\p{L}\d\s,]+$/u;

        if (!regex.test(diachi)) {
            showMessage('messDiachi', 'Địa chỉ không hợp lệ.');
            return false;
        }
        hideMessage('messDiachi');
        return true;
    }

    function checkTinhThanhPho() {
        const ttp = $('#tinhThanhPho').val().trim();
        if (ttp === '' || ttp.length < 2) {
            showMessage('messTTP', 'Tên tỉnh không được trống.');
            return false;
        }
        hideMessage('messTTP');
        return true;
    }

    function calculateAge(day, month, year) {
        const today = new Date();
        const birthDate = new Date(year, month - 1, day);

        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;

        return age;
    }

    function checkNgaySinh() {
        const ngay = parseInt($('#ngay').val());
        const thang = parseInt($('#thang').val());
        const nam = parseInt($('#nam').val());

        if (!ngay || !thang || !nam) {
            hideMessage('messNgaySinh');
            return true;
        }

        const date = new Date(nam, thang - 1, ngay);
        if (date.getFullYear() != nam || date.getMonth() + 1 != thang || date.getDate() != ngay) {
            showMessage('messNgaySinh', 'Ngày sinh không hợp lệ.');
            return false;
        }

        const age = calculateAge(ngay, thang, nam);
        if (age < 13) {
            showMessage('messNgaySinh', 'Bạn phải trên 13 tuổi.');
            return false;
        }

        hideMessage('messNgaySinh');
        return true;
    }

    // 4. GÁN SỰ KIỆN BLUR
    $('#txtTenDangnhap').blur(checkTenDangNhap);
    $('#txtEmail').blur(checkEmail);
    $('#txtMatkhau').blur(checkMatKhau);
    $('#txtNLMK').blur(checkNLMK);
    $('#txtHoten').blur(checkHoTen);
    $('#txtDT').blur(checkSDT);
    $('#txtDiachi').blur(checkDiaChi);
    $('#tinhThanhPho').blur(checkTinhThanhPho);
    $('#ngay, #thang, #nam').change(checkNgaySinh);

    // 5. FORM VALID
    function isFormValid() {
        return [
            checkTenDangNhap(),
            checkEmail(),
            checkMatKhau(),
            checkNLMK(),
            checkHoTen(),
            checkSDT(),
            checkDiaChi(),
            checkTinhThanhPho(),
            checkNgaySinh()
        ].every(v => v === true);
    }

    // 6. KIỂM TRA TRÙNG
    function checkDuplicateAccount(username, email, phone) {
        const accounts = JSON.parse(localStorage.getItem('dsUser')) || [];
        return accounts.find(acc =>
            acc.username === username ||
            acc.email === email ||
            acc.phone === phone
        );
    }

    // 7. SUBMIT FORM
    $('#formDangky').submit(function (e) {
        e.preventDefault();
        hideFormMessage();

        if (!isFormValid()) {
            showFormMessage("Vui lòng kiểm tra các trường bị lỗi.", 'error');
            return;
        }

        const newUser = {
            username: $('#txtTenDangnhap').val().trim(),
            email: $('#txtEmail').val().trim(),
            password: $('#txtMatkhau').val(),
            fullname: $('#txtHoten').val().trim(),
            phone: $('#txtDT').val().trim(),
            diaChi: $('#txtDiachi').val().trim(),
            tinhThanh: $('#tinhThanhPho').val().trim(),
            ngaySinh: `${$('#ngay').val()}/${$('#thang').val()}/${$('#nam').val()}`,
            gioiTinh: $('#txtGioitinh').val() || '',
            ngayDangKy: new Date().toISOString().split('T')[0]
        };

        const dup = checkDuplicateAccount(newUser.username, newUser.email, newUser.phone);

        if (dup) {
            if (dup.username === newUser.username) {
                showFormMessage("Tên đăng nhập đã tồn tại.", "error");
                return;
            }
            if (dup.email === newUser.email) {
                showFormMessage("Email đã được sử dụng.", "error");
                return;
            }
            if (dup.phone === newUser.phone) {
                showFormMessage("Số điện thoại đã tồn tại.", "error");
                return;
            }
        }

        const accounts = JSON.parse(localStorage.getItem('dsUser')) || [];
        accounts.push(newUser);
        localStorage.setItem('dsUser', JSON.stringify(accounts));

        showFormMessage("🎉 Đăng ký thành công!", 'success');

        setTimeout(() => window.location.href = 'dangnhap.html', 1500);
    });

    // 8. RESET
    $('#btnReset').click(() => {
        hideFormMessage();
        $('[id^="mess"]').hide().text('');
    });

});
