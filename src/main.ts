// select canvas by id
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

if (!ctx) {
  throw new Error('Could not get canvas context');
}

// create a set of n random 2d points [x, y] where x and y are between 0 and 1
const n = 700;
const points: [number, number][] = [];
for (let i = 0; i < n; i++) {
  points.push([Math.random(), Math.random()]);
}

// duplicate the points by tiling them in a 3x3 grid around the original points
const tiledPoints: [number, number][] = [];
for (const [x, y] of points) {
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      tiledPoints.push([x + dx, y + dy]);
    }
  }
}

function drawVertices(cssWidth: number, cssHeight: number) {
  ctx!.fillStyle = '#AAA';
  for (const [x, y] of tiledPoints) {
    ctx!.beginPath();
    ctx!.arc(x * cssWidth, y * cssHeight, 2, 0, 2 * Math.PI);
    ctx!.fill();
  }
}

function drawEdges(cssWidth: number, cssHeight: number) {
  const distanceThreshold = 0.1;
  ctx!.strokeStyle = '#AAA';
  for (let i = 0; i < tiledPoints.length; i++) {
    const [x1, y1] = tiledPoints[i];
    for (let j = i + 1; j < tiledPoints.length; j++) {
      const [x2, y2] = tiledPoints[j];
      const dx = x2 - x1;
      const dy = y2 - y1;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < distanceThreshold) {
        ctx!.beginPath();
        ctx!.moveTo(x1 * cssWidth, y1 * cssHeight);
        ctx!.lineTo(x2 * cssWidth, y2 * cssHeight);
        ctx!.stroke();
      }
    }
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
