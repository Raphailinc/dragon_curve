const svg = document.getElementById("fractal");
const iterationsInput = document.getElementById("iterations");
const iterationsValue = document.getElementById("iterations-value");
const speedInput = document.getElementById("speed");
const speedValue = document.getElementById("speed-value");
const dirSelect = document.getElementById("direction");
const colorInput = document.getElementById("color");
const thicknessInput = document.getElementById("thickness");

let timeoutId = null;
let paths = [];

const DIR_VECTORS = {
  right: [1, 0],
  left: [-1, 0],
  up: [0, -1],
  down: [0, 1]
};

function clearSvg() {
  paths.forEach((p) => p.remove());
  paths = [];
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function normalize(v) {
  const len = Math.hypot(v[0], v[1]);
  return len === 0 ? [0, 0] : [v[0] / len, v[1] / len];
}

function rotate90(v, left = true) {
  return left ? [-v[1], v[0]] : [v[1], -v[0]];
}

function addVec(a, b) {
  return [a[0] + b[0], a[1] + b[1]];
}

function scale(v, k) {
  return [v[0] * k, v[1] * k];
}

function createPath(a, b, color, width) {
  const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
  p.setAttribute("d", `M${a[0]} ${a[1]} L${b[0]} ${b[1]}`);
  p.setAttribute("stroke", color);
  p.setAttribute("stroke-width", width);
  p.setAttribute("fill", "none");
  svg.appendChild(p);
  paths.push(p);
}

function dragonPoints(start, end, depth, leftTurn) {
  if (depth === 0) return [start, end];
  const dir = normalize([end[0] - start[0], end[1] - start[1]]);
  const mid = addVec(start, scale(dir, 0.5));
  const perp = rotate90(dir, leftTurn);
  const bend = addVec(mid, scale(perp, 0.5 * Math.hypot(end[0] - start[0], end[1] - start[1])));
  const first = dragonPoints(start, bend, depth - 1, true);
  const second = dragonPoints(bend, end, depth - 1, false);
  return [...first.slice(0, -1), ...second];
}

function fitToView(points) {
  const padding = 20;
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const minX = Math.min(...xs) - padding;
  const maxX = Math.max(...xs) + padding;
  const minY = Math.min(...ys) - padding;
  const maxY = Math.max(...ys) + padding;
  const width = svg.clientWidth || 700;
  const height = svg.clientHeight || 500;

  const scaleX = width / (maxX - minX);
  const scaleY = height / (maxY - minY);
  const s = Math.min(scaleX, scaleY);

  return points.map(([x, y]) => [
    (x - minX) * s,
    (y - minY) * s
  ]);
}

function animateLines(points, color, width, speed) {
  if (timeoutId) clearTimeout(timeoutId);
  clearSvg();
  let i = 0;

  const step = () => {
    if (i >= points.length - 1) return;
    createPath(points[i], points[i + 1], color, width);
    i += 1;
    timeoutId = setTimeout(step, speed);
  };

  step();
}

function render() {
  const iterations = Number(iterationsInput.value);
  const speed = Number(speedInput.value);
  const color = colorInput.value;
  const thickness = Number(thicknessInput.value);
  const dir = DIR_VECTORS[dirSelect.value] || DIR_VECTORS.right;

  iterationsValue.textContent = iterations;
  speedValue.textContent = speed;

  const start = [0, 0];
  const end = scale(dir, 1);

  let points = dragonPoints(start, end, iterations, true);
  points = fitToView(points);
  animateLines(points, color, thickness, speed);
}

iterationsInput.addEventListener("input", render);
speedInput.addEventListener("input", render);
dirSelect.addEventListener("change", render);
colorInput.addEventListener("input", render);
thicknessInput.addEventListener("input", render);

document.getElementById("reset").addEventListener("click", () => {
  iterationsInput.value = 12;
  speedInput.value = 20;
  dirSelect.value = "right";
  colorInput.value = "#38bdf8";
  thicknessInput.value = 2;
  render();
});

document.getElementById("download").addEventListener("click", () => {
  const clone = svg.cloneNode(true);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const blob = new Blob([new XMLSerializer().serializeToString(clone)], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "dragon_curve.svg";
  a.click();
  URL.revokeObjectURL(url);
});

window.addEventListener("resize", () => render());

render();
