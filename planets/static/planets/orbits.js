// Esperar a que el DOM esté listo
window.addEventListener('DOMContentLoaded', () => {

    const positions = JSON.parse(document.getElementById('positions-data').textContent);
    const periods = JSON.parse(document.getElementById('periods-data').textContent);

    const planets = [];
    for (let p in positions) {
        planets.push({
            id: p,
            radius: positions[p].radius,
            angle: positions[p].angle,
            period: periods[p]
        });
    }

    const center = 450; // centro del SVG

    function animate() {
        planets.forEach(p => {
            const speed = (2*Math.PI)/p.period*0.05; // velocidad visual
            p.angle += speed;
            const cx = center + p.radius * Math.cos(p.angle);
            const cy = center + p.radius * Math.sin(p.angle);
            const el = document.getElementById(p.id);
            if (el) {
                el.setAttribute('cx', cx);
                el.setAttribute('cy', cy);
            }
        });
        requestAnimationFrame(animate);
    }

    animate();
});
