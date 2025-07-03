const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');
let scale = 1, offsetX = 0, offsetY = 0, isDragging = false, dragStart = { x: 0, y: 0 };
let points = [], lines = [], startPoint = null, endPoint = null;
let gridSizeM = 1;

function resizeCanvas() {
    canvas.width = window.innerWidth - 320;
    canvas.height = window.innerHeight;
    draw();
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

document.getElementById('speed').addEventListener('input', e => {
    params.speed = parseFloat(e.target.value);
});

document.getElementById('gridSizeInput').addEventListener('input', e => {
    let v = parseFloat(e.target.value);
    if (v < 0.1) v = 0.1; if (v > 10) v = 10;
    gridSizeM = v;
    draw();
});

document.getElementById('resetBtn').addEventListener('click', () => {
    points = []; lines = []; startPoint = null; endPoint = null;
    document.getElementById('result').innerText = '距離・時間計算結果';
    draw();
});

function draw() {
    const gs = gridSizeM * 100 * scale;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = offsetX % gs; x < canvas.width; x += gs) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
    }
    for (let y = offsetY % gs; y < canvas.height; y += gs) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
    }
    ctx.stroke();

    ctx.lineWidth = 2;
    lines.forEach(l => {
        ctx.strokeStyle = 'blue';
        ctx.beginPath();
        ctx.moveTo(l[0].x, l[0].y);
        ctx.lineTo(l[1].x, l[1].y);
        ctx.stroke();
    });

    points.forEach((p, idx) => {
        ctx.fillStyle = idx === 0 ? 'green' : idx === points.length - 1 ? 'red' : 'orange';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });
}

canvas.addEventListener('mousedown', e => {
    isDragging = true;
    dragStart.x = e.clientX;
    dragStart.y = e.clientY;
    canvas.style.cursor = 'grabbing';
});
canvas.addEventListener('mouseup', () => {
    isDragging = false;
    canvas.style.cursor = 'grab';
});
canvas.addEventListener('mousemove', e => {
    if (isDragging) {
        offsetX += e.clientX - dragStart.x;
        offsetY += e.clientY - dragStart.y;
        dragStart.x = e.clientX;
        dragStart.y = e.clientY;
        draw();
    }
});
canvas.addEventListener('wheel', e => {
    e.preventDefault();
    const factor = 1.05;
    if (e.deltaY < 0 && scale < 5) scale *= factor;
    else if (e.deltaY > 0 && scale > 0.1) scale /= factor;
    draw();
});

canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    const gs = gridSizeM * 100 * scale;
    const x = Math.round((e.clientX - rect.left - offsetX) / gs) * gs + offsetX;
    const y = Math.round((e.clientY - rect.top - offsetY) / gs) * gs + offsetY;
    const p = { x, y };
    points.push(p);
    if (points.length > 1) lines.push([points[points.length - 2], p]);
    draw();
});

canvas.addEventListener('dblclick', e => {
    const rect = canvas.getBoundingClientRect();
    const gs = gridSizeM * 100 * scale;
    const x = Math.round((e.clientX - rect.left - offsetX) / gs) * gs + offsetX;
    const y = Math.round((e.clientY - rect.top - offsetY) / gs) * gs + offsetY;
    if (!startPoint) {
        startPoint = { x, y };
        points.push(startPoint);
    } else if (!endPoint) {
        endPoint = { x, y };
        points.push(endPoint);
        calculate();
    }
    draw();
});

function calculate() {
    if (!startPoint || !endPoint) return;
    const dx = (endPoint.x - startPoint.x) / scale / 100;
    const dy = (endPoint.y - startPoint.y) / scale / 100;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const speed = parseFloat(document.getElementById('speed').value);
    const time = distance / speed;
    document.getElementById('result').innerText = `距離: ${distance.toFixed(2)} m / 時間: ${time.toFixed(2)} s`;
}
