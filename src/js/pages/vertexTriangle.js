import REGL from 'regl';

import { drawVertexTriangle } from '../regl/commands/drawVertexTriangle';

const main = document.getElementById('main');

const container = document.createElement('div');
const containerWidth = 900;
const containerHeight = 900;
container.id = 'canvas-container';
container.style.width = `${containerWidth}px`;
container.style.height = `${containerHeight}px`;
container.style.border = '1px solid #999';
container.style.margin = '5px';

main.appendChild(container);

const regl = REGL({
  container: '#canvas-container',
});

const draw = () => {
  drawVertexTriangle(regl)();
};

draw();
