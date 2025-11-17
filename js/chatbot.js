// Simple client-side "AI" (heuristic) to calculate recommended AC capacity
// Exposed as a floating chatbot widget: collects room inputs and outputs suggestion.

(function () {
    function $(s) { return document.querySelector(s) }
    function $all(s) { return Array.from(document.querySelectorAll(s)) }

    function init() {
      // Prevent double-initialization when script is loaded more than once
      if (document.querySelector('.chatbot-root')) return

      const root = document.createElement('div')
      root.className = 'chatbot-root'
      root.innerHTML = `
      <div class="chatbot-window" id="chatbotWindow">
        <div class="chatbot-header">
          <h4>ChatBot tư vấn công suất</h4>
          <button class="chatbot-close" id="chatbotClose">×</button>
        </div>
        <div class="chatbot-body">
          <div class="chatbot-message">Nhập các thông tin về phòng, tôi sẽ đề xuất công suất phù hợp.</div>

          <!-- Suggestions: quick actions and categories -->
          <div class="chatbot-suggestions">
            <div class="suggest-card">
              <div class="suggest-title">Máy lạnh</div>
              <div class="suggest-tags">
                <button class="suggest-pill" data-suggest="top">🏆 Top bán chạy</button>
                <button class="suggest-pill" data-suggest="price">💰 Top theo phân khúc giá</button>
                <button class="suggest-pill" data-suggest="promo">🔥 Khuyến mãi hot nhất</button>
              </div>
            </div>
          </div>

          <div class="chatbot-row">
            <div style="width:48%">
              <div class="chatbot-label">Diện tích (m²)</div>
              <input id="cbArea" class="chatbot-input" type="number" min="1" placeholder="Ví dụ: 20">
            </div>
            <div style="width:48%">
              <div class="chatbot-label">Độ cao trần (m)</div>
              <input id="cbHeight" class="chatbot-input" type="number" step="0.1" min="1" placeholder="Ví dụ: 2.8">
            </div>
          </div>
          <div class="chatbot-row">
            <div style="width:48%">
              <div class="chatbot-label">Hướng nắng</div>
              <select id="cbSun" class="chatbot-select">
                <option value="none">Ít/không</option>
                <option value="moderate">Trung bình</option>
                <option value="heavy">Nắng mạnh</option>
              </select>
            </div>
            <div style="width:48%">
              <div class="chatbot-label">Số người</div>
              <input id="cbPeople" class="chatbot-input" type="number" min="0" value="1">
            </div>
          </div>
          <div class="chatbot-row">
            <div style="width:100%">
              <div class="chatbot-label">Số thiết bị tỏa nhiệt (TV, bếp, PC...)</div>
              <input id="cbDevices" class="chatbot-input" type="number" min="0" value="0">
            </div>
          </div>

          <div id="cbResult" class="chatbot-result" style="display:none"></div>
        </div>
        <div class="chatbot-actions">
          <button class="btn-clear" id="cbClear">Xóa</button>
          <button class="btn-calc" id="cbCalc">Tính công suất</button>
        </div>
      </div>
      <button class="chatbot-button" id="chatbotToggle" title="Tư vấn công suất">
        <i class="fa-solid fa-robot" aria-hidden="true"></i>
        <!-- inline SVG fallback (will be removed if Font Awesome is present) -->
        <svg class="chatbot-fallback-icon" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
          <g fill="none" fill-rule="evenodd">
            <circle cx="12" cy="12" r="10" fill="#00AEEF" />
            <rect x="7" y="8" width="2" height="2" rx="0.4" fill="#fff" />
            <rect x="15" y="8" width="2" height="2" rx="0.4" fill="#fff" />
            <path d="M8 15c.8-1 2-2 4-2s3.2 1 4 2" stroke="#fff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
          </g>
        </svg>
      </button>
    `
        document.body.appendChild(root)

        // Bind events (guard each element in case of odd DOM state)
        try {
          const toggle = document.getElementById('chatbotToggle')
          const windowEl = document.getElementById('chatbotWindow')
          const closeBtn = document.getElementById('chatbotClose')
          const btnCalc = document.getElementById('cbCalc')
          const btnClear = document.getElementById('cbClear')
          const resultEl = document.getElementById('cbResult')

            if (toggle && windowEl) toggle.addEventListener('click', () => { windowEl.style.display = 'flex'; toggle.style.display = 'none'; })
            if (closeBtn && toggle && windowEl) closeBtn.addEventListener('click', () => { windowEl.style.display = 'none'; toggle.style.display = 'inline-flex'; })
          if (btnClear) btnClear.addEventListener('click', clearForm)
          if (btnCalc) btnCalc.addEventListener('click', calculate)

            // suggestion pill handlers (delegated)
            const pillButtons = root.querySelectorAll('.suggest-pill')
            pillButtons.forEach(b => {
              b.addEventListener('click', (ev) => {
                const key = b.getAttribute('data-suggest')
                // simple behavior: fill area with example values or show a quick message
                if (key === 'top') {
                  const res = document.getElementById('cbResult')
                  if (res) { res.style.display = 'block'; res.innerHTML = '<strong>Gợi ý:</strong> Danh sách "Top bán chạy" sẽ được hiển thị trên trang sản phẩm.' }
                } else if (key === 'price') {
                  const res = document.getElementById('cbResult')
                  if (res) { res.style.display = 'block'; res.innerHTML = '<strong>Gợi ý:</strong> Lọc theo phân khúc giá: Dưới 7tr / 7-9tr / 9-12tr / 12-15tr / Trên 15tr.' }
                } else if (key === 'promo') {
                  const res = document.getElementById('cbResult')
                  if (res) { res.style.display = 'block'; res.innerHTML = '<strong>Gợi ý:</strong> Hiển thị các chương trình khuyến mãi nổi bật hiện có.' }
                }
              })
            })

          // prefill some sensible defaults if inputs exist
          const cbArea = document.getElementById('cbArea')
          const cbHeight = document.getElementById('cbHeight')
          if (cbArea) cbArea.value = ''
          if (cbHeight) cbHeight.value = '2.8'
        } catch (err) {
          console.error('Chatbot init error:', err)
        }
        // After attaching, detect if Font Awesome loaded; ensure the DOM still contains the <i> tag
        // If FA is present, remove the inline SVG fallback to avoid duplicate visuals.
        // If FA is NOT present, move the SVG markup inside the <i> (so the <i> tag remains as requested)
        try {
          const btnI = root.querySelector('.chatbot-button i')
          const btnSvg = root.querySelector('.chatbot-button svg')
          if (btnI) {
            const ff = window.getComputedStyle(btnI).getPropertyValue('font-family') || ''
            const faLoaded = /Font ?Awesome|FontAwesome|fa-/.test(ff)
            if (faLoaded) {
              if (btnSvg) btnSvg.remove()
            } else {
              // Font Awesome not loaded: keep the <i> element but use the SVG as its content
              if (btnSvg) {
                try {
                  btnI.innerHTML = btnSvg.outerHTML
                  btnSvg.remove()
                } catch (innerErr) {
                  // fallback: do nothing
                }
              }
            }
          } else if (btnSvg) {
            // No <i> found (unexpected) -> ensure svg remains visible
            // nothing to do
          }
        } catch (e) {
          // silent
        }
    }

    function clearForm() {
        ['cbArea', 'cbHeight', 'cbPeople', 'cbDevices', 'cbSun'].forEach(id => { const e = document.getElementById(id); if (e) e.value = (id === 'cbHeight' ? '2.8' : (id === 'cbPeople' ? '1' : '0')) })
        const res = document.getElementById('cbResult'); if (res) { res.style.display = 'none'; res.innerHTML = '' }
    }

    function calculate() {
        const area = parseFloat(document.getElementById('cbArea').value) || 0
        const height = parseFloat(document.getElementById('cbHeight').value) || 2.8
        const sun = document.getElementById('cbSun').value
        const people = parseInt(document.getElementById('cbPeople').value) || 0
        const devices = parseInt(document.getElementById('cbDevices').value) || 0

        if (area <= 0) { alert('Vui lòng nhập diện tích (m²) hợp lệ'); return }

        // Heuristic calculation (client-side):
        // base watt per m2 (typical): 150 W/m²
        const basePerM2 = 150
        // people and devices additions
        const peopleW = people * 100
        const deviceW = devices * 300

        // sun exposure factor
        const sunFactor = (sun === 'heavy') ? 1.2 : (sun === 'moderate') ? 1.1 : 1.0
        // height factor (higher ceiling -> larger volume)
        const heightFactor = height / 2.8

        let totalW = (area * basePerM2 + peopleW + deviceW) * sunFactor * heightFactor
        // convert W to kW
        const kw = totalW / 1000
        // approximate 1 HP (AC) cooling ≈ 2.6 kW (typical household approximation)
        const hpNeeded = kw / 2.6

        // choose nearest option among 1, 1.5, 2
        const options = [1, 1.5, 2]
        let chosen = options[0]
        let minDiff = Math.abs(hpNeeded - options[0])
        for (let i = 1; i < options.length; i++) { const d = Math.abs(hpNeeded - options[i]); if (d < minDiff) { minDiff = d; chosen = options[i] } }

        const resEl = document.getElementById('cbResult')
        const formattedKW = (kw).toFixed(2)
        const hpText = chosen + ' HP'
        resEl.style.display = 'block'
        resEl.innerHTML = `
      <div><strong>Yêu cầu làm lạnh (ước tính):</strong> ${formattedKW} kW (~${hpNeeded.toFixed(2)} HP)</div>
      <div style="margin-top:6px"><strong>Đề xuất:</strong> <span style="color:#0b5ed7">${hpText}</span></div>
      <div style="margin-top:8px;color:#374151;font-size:13px">Ghi chú: Đây là ước tính sơ bộ dựa trên các thông số bạn cung cấp. Nếu phòng của bạn có cửa sổ lớn hướng Tây, nhiều thiết bị tỏa nhiệt, hoặc yêu cầu lắp đặt kĩ thuật đặc biệt, hãy tham khảo tư vấn kỹ thuật viên để chọn công suất chính xác hơn.</div>
    `
    }

    // initialize on DOM ready
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init)
    else init()

})();
