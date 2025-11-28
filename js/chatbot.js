(function () {

  // Helper DOM
  function $(s) { return document.querySelector(s) }
  function $all(s) { return Array.from(document.querySelectorAll(s)) }

  // Khởi tạo chatbot (tránh double-init)
  function init() {
    if (document.querySelector('.chatbot-root')) return

    const root = document.createElement('div')
    root.className = 'chatbot-root'

    // Tải giao diện chatbot từ file HTML ngoài
    fetch(window.chatbotHtmlPath || 'html/chatbot.html')

      .then(res => {
        if (!res.ok) throw new Error('Không tải được chatbot HTML: ' + res.status)
        return res.text()
      })
      .then(html => {
        root.innerHTML = html
        document.body.appendChild(root)
        attachChatbotEvents(root)
      })
      .catch(err => {
        console.error(err)
        document.body.appendChild(root)
      })

    // Dự phòng attach nếu phần HTML đã có sẵn
    attachChatbotEvents(root)
  }

  // Gắn sự kiện cho UI chatbot
  function attachChatbotEvents(root) {
    try {
      const toggle = document.getElementById('chatbotToggle')
      const windowEl = document.getElementById('chatbotWindow')
      const closeBtn = document.getElementById('chatbotClose')
      const btnCalc = document.getElementById('cbCalc')
      const btnClear = document.getElementById('cbClear')

      // Mở & đóng widget
      if (toggle && windowEl)
        toggle.addEventListener('click', () => {
          windowEl.style.display = 'flex'
          toggle.style.display = 'none'
        })

      if (closeBtn && toggle && windowEl)
        closeBtn.addEventListener('click', () => {
          windowEl.style.display = 'none'
          toggle.style.display = 'inline-flex'
        })

      // Nút tính toán & làm mới
      if (btnClear) btnClear.addEventListener('click', clearForm)
      if (btnCalc) btnCalc.addEventListener('click', calculate)

      // Xử lý nút gợi ý nhanh
      const pills = root.querySelectorAll('.suggest-pill')
      pills.forEach(b => {
        b.addEventListener('click', () => {
          const key = b.getAttribute('data-suggest')
          const res = document.getElementById('cbResult')
          if (!res) return

          res.style.display = 'block'
          if (key === 'top')
            res.innerHTML = '<strong>Gợi ý:</strong> Hiển thị danh sách "Top bán chạy" trên trang sản phẩm.'
          else if (key === 'price')
            res.innerHTML = '<strong>Gợi ý:</strong> Lọc theo giá: Dưới 7tr / 7–9tr / 9–12tr / 12–15tr / Trên 15tr.'
          else if (key === 'promo')
            res.innerHTML = '<strong>Gợi ý:</strong> Hiển thị các chương trình khuyến mãi hiện có.'
        })
      })

      // Giá trị mặc định
      const cbArea = document.getElementById('cbArea')
      const cbHeight = document.getElementById('cbHeight')
      if (cbArea) cbArea.value = ''
      if (cbHeight) cbHeight.value = '2.8'

    } catch (err) {
      console.error('Chatbot init error:', err)
    }
  }

  // Reset toàn bộ form
  function clearForm() {
    ['cbArea', 'cbHeight', 'cbPeople', 'cbDevices', 'cbSun'].forEach(id => {
      const e = document.getElementById(id)
      if (!e) return
      e.value =
        id === 'cbHeight' ? '2.8'
          : id === 'cbPeople' ? '1'
            : '0'
    })

    const res = document.getElementById('cbResult')
    if (res) {
      res.style.display = 'none'
      res.innerHTML = ''
    }
  }

  // Thuật toán ước tính công suất
  function calculate() {
    const area = parseFloat(document.getElementById('cbArea').value) || 0
    const height = parseFloat(document.getElementById('cbHeight').value) || 2.8
    const sun = document.getElementById('cbSun').value
    const people = parseInt(document.getElementById('cbPeople').value) || 0
    const devices = parseInt(document.getElementById('cbDevices').value) || 0

    if (area <= 0) {
      alert('Vui lòng nhập diện tích (m²) hợp lệ')
      return
    }

    // Công thức ước lượng:
    const basePerM2 = 150                     // Nhiệt tải cơ bản trên mỗi m²
    const peopleW = people * 100              // Mỗi người tăng ~100W
    const deviceW = devices * 300             // Mỗi thiết bị sinh nhiệt ~300W

    const sunFactor = (sun === 'heavy') ? 1.2 : (sun === 'moderate') ? 1.1 : 1.0
    const heightFactor = height / 2.8         // Trần cao → thể tích lớn hơn

    // Tổng công suất W
    let totalW = (area * basePerM2 + peopleW + deviceW) * sunFactor * heightFactor

    const kw = totalW / 1000                 // W → kW
    const hpNeeded = kw / 2.6                // kW → HP (tham khảo)

    const options = [1, 1.5, 2]              // HP thương mại phổ biến
    let chosen = options.reduce((closest, o) =>
      Math.abs(o - hpNeeded) < Math.abs(closest - hpNeeded) ? o : closest
    )

    const resEl = document.getElementById('cbResult')
    resEl.style.display = 'block'
    resEl.innerHTML = `
      <div><strong>Yêu cầu làm lạnh (ước tính):</strong> ${kw.toFixed(2)} kW (~${hpNeeded.toFixed(2)} HP)</div>
      <div style="margin-top:6px"><strong>Đề xuất:</strong> <span style="color:#0b5ed7">${chosen} HP</span></div>
      <div style="margin-top:8px;color:#374151;font-size:13px">
        Ghi chú: Kết quả chỉ mang tính ước lượng. Nếu phòng có cửa sổ hướng Tây, nhiều thiết bị tỏa nhiệt,
        hoặc yêu cầu lắp đặt đặc biệt, hãy tham khảo kỹ thuật viên.
      </div>
    `
  }

  // Đảm bảo chạy khi DOM đã sẵn sàng
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', init)
  else
    init()

})();
