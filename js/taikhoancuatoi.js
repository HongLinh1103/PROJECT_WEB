// -- helper: đóng tất cả dropdowns
function closeAllDropdowns() {
  $('#myDropdown').hide();
  $('#ttTaikhoan').hide();
}

// -- toggle function cho menu đăng ký/đăng nhập (khi chưa login)
function toggle_dropdown() {
  const el = $('#myDropdown');
  el.toggle();
  $('#ttTaikhoan').hide();
}

// HÀM ĐĂNG XUẤT TOÀN CỤC - DÙNG CHUNG CHO TẤT CẢ TRANG
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

    // 3. Thông báo
    alert('Bạn đã đăng xuất thành công!');
    
    // 4. Chuyển hướng về trang chủ
    setTimeout(() => {
        window.location.href = 'trangchu.html';
    }, 500);
}

// Hàm cập nhật UI sau khi đăng xuất
function updateUIAfterLogout() {
  // Ẩn phần tài khoản, hiển thị phần đăng ký/đăng nhập
  $('#divTaikhoan').hide();
  $('#dkdn').show();
  
  // Reset avatar
  $('#taikhoan').text('?');
  
  // Cập nhật nội dung profile details
  $('#profileDetails').html('<p style="text-align:center;">Bạn chưa đăng nhập. Vui lòng <a href="dangnhap.html">Đăng nhập</a>.</p>');
  
  // Ẩn các nút hành động
  $('.action-buttons').hide();
}

// -- document ready
$(function() {
  console.log('=== TRANG TÀI KHOẢN ĐANG LOAD ===');
  
  // Kiểm tra đăng nhập - nếu chưa đăng nhập thì chuyển hướng
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) {
      alert('Vui lòng đăng nhập để xem trang này!');
      window.location.href = 'dangnhap.html';
      return;
  }

  // tránh xung đột: đảm bảo chỉ 1 #dkdn hiện
  $('#myDropdown').hide();
  $('#ttTaikhoan').hide();

  // Lấy user từ localStorage (expected structure: currentUser = { username, fullname, email, password, phone, ... })
  const currentUserData = localStorage.getItem('currentUser');
  const $profileDetails = $('#profileDetails');

  function renderProfileUI(user) {
    // populate profile details area
    $profileDetails.html(`
      <div><strong>Tên đăng nhập:</strong> ${user.username}</div>
      <div><strong>Email:</strong> ${user.email || 'Chưa cập nhật'}</div>
      <div><strong>Họ và tên:</strong> ${user.fullname || 'Chưa cập nhật'}</div>
      <div><strong>Số điện thoại:</strong> ${user.phone || 'Chưa cập nhật'}</div>
      <div><strong>Giới tính:</strong> ${user.gioiTinh || 'Chưa cập nhật'}</div>
      <div><strong>Địa chỉ:</strong> ${user.diaChi || 'Chưa cập nhật'}</div>
    `);

    $('#tenDangnhap').text(user.username || '-');
    $('#hoten').text(user.fullname || '-');
    $('#email').text(user.email || '-');

    // set avatar first char
    const name = (user.fullname && user.fullname.trim()) ? user.fullname.trim() : (user.username || '?');
    $('#taikhoan').text(name.charAt(0).toUpperCase());

    // show avatar, hide dkdn menu
    $('#divTaikhoan').show();
    $('#dkdn').hide();
    $('.action-buttons').show();
  }

  function showLoggedOutUI() {
    // not logged in
    $('#divTaikhoan').hide();
    $('#dkdn').show();
    $profileDetails.html('<p style="text-align:center;">Bạn chưa đăng nhập. Vui lòng <a href="dangnhap.html">Đăng nhập</a>.</p>');
    $('.action-buttons').hide();
  }

  // Kiểm tra trạng thái đăng nhập khi trang load
  function checkLoginStatus() {
    const currentUserData = localStorage.getItem('currentUser');
    
    if (currentUserData) {
      try {
        const user = JSON.parse(currentUserData);
        renderProfileUI(user);
      } catch (e) {
        console.error('Có lỗi khi parse currentUser', e);
        showLoggedOutUI();
      }
    } else {
      showLoggedOutUI();
    }
  }

  // Gọi hàm kiểm tra đăng nhập
  checkLoginStatus();

  // ---------- Dropdown behaviours ----------
  // click avatar: toggle its dropdown
  $('#taikhoan').on('click', function(e) {
    e.stopPropagation();
    $('#ttTaikhoan').toggle();
    $('#myDropdown').hide();
  });

  // click dkdn button
  $('#dkdnBtn').on('click', function(e) {
    e.stopPropagation();
    $('#myDropdown').toggle();
    $('#ttTaikhoan').hide();
  });

  // click outside -> close dropdowns
  $(document).on('click', function() {
    closeAllDropdowns();
  });

  // prevent clicks inside dropdown from closing
  $('#ttTaikhoan, #myDropdown').on('click', function(e) {
    e.stopPropagation();
  });

  // ---------- Edit profile ----------
  $('#btnEditProfile').on('click', function() {
    const cur = localStorage.getItem('currentUser');
    if (!cur) { window.location.href = 'dangnhap.html'; return; }
    const user = JSON.parse(cur);
    // show form inline inside profileDetails
    $profileDetails.html(`
      <form id="editProfileForm">
        <div><strong>Tên đăng nhập:</strong> ${user.username}</div>
        <div><strong>Email:</strong> ${user.email || ''}</div>
        <div><strong>Họ và tên:</strong> <input type="text" name="fullname" value="${user.fullname || ''}" required></div>
        <div><strong>Số điện thoại:</strong> <input type="text" name="phone" value="${user.phone || ''}"></div>
        <div><strong>Giới tính:</strong>
          <select name="gioiTinh">
            <option value="">-- Chọn --</option>
            <option value="Nam"${user.gioiTinh==='Nam'?' selected':''}>Nam</option>
            <option value="Nữ"${user.gioiTinh==='Nữ'?' selected':''}>Nữ</option>
            <option value="Khác"${user.gioiTinh==='Khác'?' selected':''}>Khác</option>
          </select>
        </div>
        <div><strong>Địa chỉ:</strong> <input type="text" name="diaChi" value="${user.diaChi || ''}"></div>
        <div style="margin-top:12px;"><button type="button" id="saveProfileBtn" style="padding:8px 12px;border-radius:6px;border:none;background:#007bff;color:#fff;">Lưu</button>
        <button type="button" id="cancelEditBtn" style="padding:8px 12px;border-radius:6px;border:1px solid #ccc;margin-left:8px;">Hủy</button></div>
      </form>
    `);
  });

  // Save profile (delegated because form is dynamic)
  $(document).on('click', '#saveProfileBtn', function() {
    const cur = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const $f = $('#editProfileForm');
    const fullname = $f.find('input[name="fullname"]').val().trim();
    if (!fullname) { alert('Họ và tên không được để trống'); return; }
    cur.fullname = fullname;
    cur.phone = $f.find('input[name="phone"]').val().trim();
    cur.gioiTinh = $f.find('select[name="gioiTinh"]').val();
    cur.diaChi = $f.find('input[name="diaChi"]').val().trim();
    localStorage.setItem('currentUser', JSON.stringify(cur));
    alert('Cập nhật thông tin thành công');
    // re-render UI
    $('#taikhoan').text(cur.fullname.charAt(0).toUpperCase());
    // re-render profile details
    $('#profileDetails').html(`
      <div><strong>Tên đăng nhập:</strong> ${cur.username}</div>
      <div><strong>Email:</strong> ${cur.email || ''}</div>
      <div><strong>Họ và tên:</strong> ${cur.fullname}</div>
      <div><strong>Số điện thoại:</strong> ${cur.phone || ''}</div>
      <div><strong>Giới tính:</strong> ${cur.gioiTinh || ''}</div>
      <div><strong>Địa chỉ:</strong> ${cur.diaChi || ''}</div>
    `);
  });

  // cancel edit
  $(document).on('click', '#cancelEditBtn', function() {
    const cur = JSON.parse(localStorage.getItem('currentUser') || '{}');
    // re-render normal profile
    if (cur && cur.username) {
      $('#profileDetails').html(`
        <div><strong>Tên đăng nhập:</strong> ${cur.username}</div>
        <div><strong>Email:</strong> ${cur.email || ''}</div>
        <div><strong>Họ và tên:</strong> ${cur.fullname || ''}</div>
        <div><strong>Số điện thoại:</strong> ${cur.phone || ''}</div>
        <div><strong>Giới tính:</strong> ${cur.gioiTinh || ''}</div>
        <div><strong>Địa chỉ:</strong> ${cur.diaChi || ''}</div>
      `);
    } else {
      $profileDetails.html('<p style="text-align:center;">Vui lòng đăng nhập</p>');
    }
  });

  // ---------- Change password ----------
  function showChangePasswordForm() {
    $('#profileDetails').html(`
      <form id="changePasswordForm">
        <div><strong>Mật khẩu hiện tại:</strong> <input type="password" name="oldPassword" required></div>
        <div><strong>Mật khẩu mới:</strong> <input type="password" name="newPassword" required></div>
        <div><strong>Nhập lại mật khẩu mới:</strong> <input type="password" name="confirmPassword" required></div>
        <div style="margin-top:12px;">
          <button type="button" id="savePwdBtn" style="padding:8px 12px;border-radius:6px;border:none;background:#007bff;color:#fff;">Lưu mật khẩu</button>
          <button type="button" id="cancelPwdBtn" style="padding:8px 12px;border-radius:6px;border:1px solid #ccc;margin-left:8px;">Hủy</button>
        </div>
      </form>
    `);
  }

  $('#btnDoiMK, #doiMK').on('click', function() {
    const cur = localStorage.getItem('currentUser');
    if (!cur) { alert('Vui lòng đăng nhập để đổi mật khẩu'); window.location.href='dangnhap.html'; return; }
    showChangePasswordForm();
  });

  // save new password (delegated)
  $(document).on('click', '#savePwdBtn', function() {
    const cur = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const $f = $('#changePasswordForm');
    const oldP = $f.find('input[name="oldPassword"]').val();
    const newP = $f.find('input[name="newPassword"]').val();
    const conf = $f.find('input[name="confirmPassword"]').val();
    if (oldP !== cur.password) { alert('Mật khẩu hiện tại không đúng'); return; }
    if (newP.length < 6) { alert('Mật khẩu mới phải >= 6 ký tự'); return; }
    if (newP !== conf) { alert('Mật khẩu nhập lại không khớp'); return; }
    // update
    cur.password = newP;
    localStorage.setItem('currentUser', JSON.stringify(cur));
    // if dsUser exists, update there too
    const dsUser = JSON.parse(localStorage.getItem('dsUser') || '[]');
    const idx = dsUser.findIndex(u => u.username === cur.username);
    if (idx !== -1) { dsUser[idx].password = newP; localStorage.setItem('dsUser', JSON.stringify(dsUser)); }
    alert('Đổi mật khẩu thành công');
    // re-render profile view
    $('#profileDetails').html(`
      <div><strong>Tên đăng nhập:</strong> ${cur.username}</div>
      <div><strong>Email:</strong> ${cur.email || ''}</div>
      <div><strong>Họ và tên:</strong> ${cur.fullname || ''}</div>
    `);
  });

  // cancel change pwd
  $(document).on('click', '#cancelPwdBtn', function() {
    const cur = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (cur && cur.username) {
      // simply re-render profile summary
      $('#profileDetails').html(`
        <div><strong>Tên đăng nhập:</strong> ${cur.username}</div>
        <div><strong>Email:</strong> ${cur.email || ''}</div>
        <div><strong>Họ và tên:</strong> ${cur.fullname || ''}</div>
        <div><strong>Số điện thoại:</strong> ${cur.phone || ''}</div>
        <div><strong>Giới tính:</strong> ${cur.gioiTinh || ''}</div>
        <div><strong>Địa chỉ:</strong> ${cur.diaChi || ''}</div>
      `);
    } else {
      $('#profileDetails').html('<p style="text-align:center;">Vui lòng đăng nhập</p>');
    }
  });

  // ---------- Logout ----------
  // SỬ DỤNG HÀM ĐĂNG XUẤT TOÀN CỤC DUY NHẤT
  $('#btnDangXuat, #dangXuat, #dropdownDangXuat').on('click', function(e) {
    e.preventDefault();
    console.log('Nút đăng xuất được click');
    doLogout();
  });

  // small UX: close dropdowns on escape
  $(document).on('keydown', function(e) {
    if (e.key === 'Escape') closeAllDropdowns();
  });

  // prevent form submission default (search)
  $('#formSearch').on('submit', function(e){ e.preventDefault(); });

  console.log('=== TRANG TÀI KHOẢN LOAD HOÀN TẤT ===');
}); // end ready