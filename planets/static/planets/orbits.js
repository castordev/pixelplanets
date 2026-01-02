// Obtener posiciones desde Django
const positions = JSON.parse(document.getElementById('positions-data').textContent);
const center = 1600 / 2;

window.addEventListener('DOMContentLoaded', () => {
    // Use SVG orbit radii when available so planets align with drawn orbits
    const orbitEls = document.querySelectorAll('.orbit');
    const planetOrder = ['mercury','venus','earth','mars','jupiter','saturn','uranus','neptune'];
    const radiusMap = {};
    planetOrder.forEach((p, i) => {
        const orbitEl = orbitEls[i];
        if (orbitEl && orbitEl.getAttribute('r')) radiusMap[p] = parseFloat(orbitEl.getAttribute('r'));
        else if (positions[p] && positions[p].radius) radiusMap[p] = positions[p].radius;
    });

    for (let planet in positions) {
        const el = document.getElementById(planet);
        if (!el) continue;

        const pos = positions[planet];
        const r = (radiusMap[planet] !== undefined) ? radiusMap[planet] : pos.radius;
        const cx = center + r * Math.cos(pos.angle);
        const cy = center - r * Math.sin(pos.angle);

        // Support both <circle> (cx/cy) and <image> (x/y)
        const tag = (el.tagName || '').toLowerCase();
        if (tag === 'image') {
            const w = parseFloat(el.getAttribute('width')) || 24;
            const h = parseFloat(el.getAttribute('height')) || 24;
            el.setAttribute('x', cx - (w / 2));
            el.setAttribute('y', cy - (h / 2));
        } else {
            el.setAttribute('cx', cx);
            el.setAttribute('cy', cy);
        }
    }

    // Generar cinturón de asteroides entre Marte y Júpiter
    function generateAsteroidBelt(count = 250, gap = 40) {
        const beltGroup = document.getElementById('asteroid-belt');
        if (!beltGroup) return;
        while (beltGroup.firstChild) beltGroup.removeChild(beltGroup.firstChild);

        // Prefer fixed orbit radii from SVG so belt is independent of the date
        const orbitEls = document.querySelectorAll('.orbit');
        let marsR = null, jupiterR = null;
        if (orbitEls && orbitEls.length >= 5) {
            // order: mercury, venus, earth, mars, jupiter, ... (0-based)
            marsR = parseFloat(orbitEls[3].getAttribute('r'));
            jupiterR = parseFloat(orbitEls[4].getAttribute('r'));
        }
        // fallback to positions if SVG not present
        if (!marsR) marsR = positions.mars && positions.mars.radius ? positions.mars.radius : 288;
        if (!jupiterR) jupiterR = positions.jupiter && positions.jupiter.radius ? positions.jupiter.radius : 360;

        let minR = Math.min(marsR, jupiterR) + gap;
        let maxR = Math.max(marsR, jupiterR) - gap;
        if (minR >= maxR) {
            const fallbackGap = Math.max(10, Math.floor(gap / 2));
            minR = Math.min(marsR, jupiterR) + fallbackGap;
            maxR = Math.max(marsR, jupiterR) - fallbackGap;
        }

        const SVG_NS = 'http://www.w3.org/2000/svg';
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = minR + Math.random() * Math.max(0, (maxR - minR));
            const cx = center + r * Math.cos(angle);
            const cy = center - r * Math.sin(angle);
            const dot = document.createElementNS(SVG_NS, 'circle');
            dot.setAttribute('cx', cx);
            dot.setAttribute('cy', cy);
            const rr = (Math.random() * 1.4) + 0.6;
            dot.setAttribute('r', rr);
            dot.setAttribute('fill', '#9e9e9e');
            dot.setAttribute('opacity', '0.95');
            beltGroup.appendChild(dot);
        }
    }

    generateAsteroidBelt(250, 40);

    // Botón para establecer fecha de hoy
    const todayBtn = document.getElementById('today-btn');
    const dateInput = document.getElementById('date');
    const dateForm = document.getElementById('date-form');
    const calendarBtn = document.getElementById('calendar-btn');
    const customPicker = document.getElementById('custom-datepicker');

    if (todayBtn && dateInput) {
        todayBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const today = new Date().toISOString().split('T')[0];
            dateInput.value = today;
            if (dateForm) dateForm.submit();
        });
    }

    function formatDateYMD(d) {
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${d.getFullYear()}-${mm}-${dd}`;
    }

    function renderDatepicker(monthDate) {
        const year = monthDate.getFullYear();
        const month = monthDate.getMonth();
        const first = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

        let html = `
          <div class="dp-header">
            <button type="button" class="dp-nav-btn" data-action="prev">◀</button>
            <div class="dp-title">${monthNames[month]} ${year}</div>
            <button type="button" class="dp-nav-btn" data-action="next">▶</button>
          </div>
          <div class="dp-weekdays"><div>L</div><div>M</div><div>X</div><div>J</div><div>V</div><div>S</div><div>D</div></div>
          <div class="dp-grid">
        `;

        const firstWeekday = (first.getDay() + 6) % 7;
        for (let i = 0; i < firstWeekday; i++) html += `<div></div>`;

        for (let d = 1; d <= daysInMonth; d++) {
            const cur = new Date(year, month, d);
            const isToday = dateInput.value === formatDateYMD(cur);
            html += `<button type="button" class="dp-day" data-day="${d}" ${isToday? 'aria-current="date"':''}>${d}</button>`;
        }

        html += `</div>`;
        customPicker.innerHTML = html;

        // nav buttons: change month
        customPicker.querySelectorAll('.dp-nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.getAttribute('data-action');
                const newMonthDate = new Date(year, month + (action === 'next' ? 1 : -1), 1);
                renderDatepicker(newMonthDate);
            });
        });

        customPicker.querySelectorAll('.dp-day').forEach(btn => {
            btn.addEventListener('click', () => {
                const day = Number(btn.getAttribute('data-day'));
                const chosen = new Date(year, month, day);
                dateInput.value = formatDateYMD(chosen);
                hideDatepicker();
                if (dateForm) dateForm.submit();
            });
        });
    }

    function showDatepicker() {
        if (!customPicker) return;
        const base = dateInput && dateInput.value ? new Date(dateInput.value) : new Date();
        renderDatepicker(base);
        customPicker.classList.add('open');
        customPicker.setAttribute('aria-hidden', 'false');
        document.addEventListener('click', outsideClickHandler);
    }

    function hideDatepicker() {
        if (!customPicker) return;
        customPicker.classList.remove('open');
        customPicker.setAttribute('aria-hidden', 'true');
        document.removeEventListener('click', outsideClickHandler);
    }

    function outsideClickHandler(e) {
        if (!customPicker) return;
        if (customPicker.contains(e.target) || (calendarBtn && calendarBtn.contains(e.target)) || (dateInput && dateInput.contains(e.target))) return;
        hideDatepicker();
    }

    if (calendarBtn) {
        calendarBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (customPicker && customPicker.classList.contains('open')) hideDatepicker(); else showDatepicker();
        });
    }

    function normalizeAndValidateDate() {
        if (!dateInput) return false;
        const v = dateInput.value.trim();
        if (!v) return false;
        // Try to parse user input into a Date
        const parsed = new Date(v);
        if (isNaN(parsed.getTime())) {
            return false;
        }
        dateInput.value = formatDateYMD(parsed);
        return true;
    }

    if (dateInput) {
        dateInput.addEventListener('change', () => {
            if (normalizeAndValidateDate()) {
                if (dateForm) dateForm.submit();
            } else {
                // leave value for user to correct
            }
        });
        if (dateForm) {
            dateForm.addEventListener('submit', (e) => {
                if (!normalizeAndValidateDate()) {
                    e.preventDefault();
                    alert('Fecha inválida. Usa el formato YYYY-MM-DD o una fecha reconocible.');
                }
            });
        }
    }

    // Botones de navegación de fecha: anterior / hoy / siguiente
    const prevBtn = document.getElementById('prev-day-btn');
    const nextBtn = document.getElementById('next-day-btn');

    function changeDateBy(days) {
        if (!dateInput) return;
        const base = dateInput.value ? new Date(dateInput.value) : new Date();
        base.setDate(base.getDate() + days);
        dateInput.value = base.toISOString().split('T')[0];
        if (dateForm) dateForm.submit();
    }

    if (prevBtn) prevBtn.addEventListener('click', (e) => { e.preventDefault(); changeDateBy(-1); });
    if (nextBtn) nextBtn.addEventListener('click', (e) => { e.preventDefault(); changeDateBy(1); });
});
