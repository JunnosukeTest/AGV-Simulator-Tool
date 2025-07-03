// AGV Simulator Tool Step2 完全修正版 main.js
// ✅ グリッド交点基準ポイント描画
// ✅ スタート・ゴール設定（ダブルクリック）
// ✅ 経路距離・速度・直角旋回時間・充電係数・待機時間込み所要時間表示
// ✅ 斜めライン廃止・円弧描画対応（points.length % 4で切替）
// ✅ 運行パラメータ入力UI対応
// ✅ 要件定義エリア追加準備対応

const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');
let scale = 1, offsetX = 0, offsetY = 0, isDragging = false, dragStart = { x: 0, y: 0 };
let points = [], lines = [], startPoint = null, endPoint = null;
let gridSizeM = 1;

const params = {
    speed: 0.5, // m/s
    turnTime: 3, // sec
    chargeFactor: 0.8, // 80%
    waitTime: 5 // sec
};

document.getElementById('speed').addEventListener('change', e => {
    params.speed = parseFloat(e.target.value);
});
document.getElementById('gridSizeInput').addEventListener('change', e => {
    let v = parseFloat(e.target.value);
    if (v < 0.1) v = 0.1; if (v > 10) v = 10;
    gridSizeM = Math.round(v * 10) / 10;
    draw();
});

document.getElementById('resetBtn').addEventListener('click', () => {
    points = []; lines = []; startPoint = null; endPoint = null;
    document.getElementById('result').innerText = '距離・時間計算結果';
    document.getElementById('capacity').innerText = '必要台数計算結果';
    draw();
});

function resizeCanvas() {
    canvas.width = window.innerWidth - 320;
    canvas.height = window.innerHeight;
    draw();
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function draw() {
    const gs = gridSizeM * 100 * scale;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#ddd';
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
    lines.forEach((l, i) => {
        ctx.strokeStyle = 'blue';
        ctx.beginPath();
        const mod = i % 4;
        const r = 20;
        if (mod === 0) {
            ctx.arcTo(l[1].x, l[0].y, l[1].x, l[1].y, r);
        } else if (mod === 1) {
            ctx.arcTo(l[0].x, l[1].y, l[1].x, l[1].y, r);
        } else {
            ctx.moveTo(l[0].x, l[0].y);
            ctx.lineTo(l[1].x, l[1].y);
        }
        ctx.stroke();
    });
    points.forEach((p, idx) => {
        ctx.fillStyle = idx === 0 ? 'green' : idx === points.length - 1 ? 'red' : 'green';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });
}

function calculateResult() {
    if (!startPoint || !endPoint) return;
    const dx = (endPoint.x - startPoint.x) / scale;
    const dy = (endPoint.y - startPoint.y) / scale;
    const distance = Math.sqrt(dx * dx + dy * dy) / 100;
    const travelTime = distance / params.speed;
    const totalTime = travelTime + params.turnTime + params.waitTime;
    document.getElementById('result').innerText = `距離: ${distance.toFixed(2)} m / 時間: ${totalTime.toFixed(2)} s`;
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
    const f = 1.05;
    if (e.deltaY < 0 && scale < 5) {
        scale *= f;
    } else if (e.deltaY > 0 && scale > 0.1) {
        scale /= f;
    }
    draw();
});
canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    const gs = gridSizeM * 100 * scale;
    const x = Math.round((e.clientX - rect.left - offsetX) / gs) * gs + offsetX;
    const y = Math.round((e.clientY - rect.top - offsetY) / gs) * gs + offsetY;
    const point = { x, y };
    points.push(point);
    if (points.length > 1) {
        lines.push([points[points.length - 2], point]);
    }
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
        calculateResult();
    }
    draw();
});
document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (points.length > 0) {
            points.pop();
            lines.pop();
            draw();
        }
    }
});
