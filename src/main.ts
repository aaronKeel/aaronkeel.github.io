import { Graph } from "./Graph";

// select canvas by id
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

if (!ctx) {
  throw new Error('Could not get canvas context');
}

const graph = new Graph(700, 0.1);

function drawVertices(cssWidth: number, cssHeight: number) {
  ctx!.fillStyle = '#AAA';
  for (const [x, y] of graph.tiledPoints) {
    ctx!.beginPath();
    ctx!.arc(x * cssWidth, y * cssHeight, 5, 0, 2 * Math.PI);
    ctx!.fill();
  }
}

function drawEdges(cssWidth: number, cssHeight: number) {
  ctx!.strokeStyle = '#AAA';
  for (const [startIndex, endIndex] of graph.edges) {
    const [x1, y1] = graph.tiledPoints[startIndex];
    const [x2, y2] = graph.tiledPoints[endIndex];
    ctx!.beginPath();
    ctx!.moveTo(x1 * cssWidth, y1 * cssHeight);
    ctx!.lineTo(x2 * cssWidth, y2 * cssHeight);
    ctx!.stroke();
  }
}

function resizeCanvasToViewport() {
  const dpr = window.devicePixelRatio ?? 1;
  const cssWidth = window.innerWidth;
  const cssHeight = window.innerHeight;

  // resize canvas backing store to match viewport at physical resolution
  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;
  ctx!.scale(dpr, dpr);

  return { cssWidth, cssHeight };
}

function draw() {
  const { cssWidth, cssHeight } = resizeCanvasToViewport();

  drawVertices(cssWidth, cssHeight);
  drawEdges(cssWidth, cssHeight);
}

draw();
window.addEventListener('resize', draw);
