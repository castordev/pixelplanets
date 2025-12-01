// Obtener posiciones desde Django
const positions = JSON.parse(document.getElementById('positions-data').textContent);
const center = 1100 / 2;

window.addEventListener('DOMContentLoaded', () => {
    for (let planet in positions) {
        const el = document.getElementById(planet);
        if (!el) continue;

        const pos = positions[planet];
        const cx = center + pos.radius * Math.cos(pos.angle);
        const cy = center + pos.radius * Math.sin(pos.angle);

        el.setAttribute('cx', cx);
        el.setAttribute('cy', cy);
    }
});
