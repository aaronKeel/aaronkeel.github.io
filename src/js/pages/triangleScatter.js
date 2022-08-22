import REGL from 'regl';
import { randomNormal } from 'd3-random';

import { drawTriangleScatter } from '../regl/commands/drawTriangleScatter';
import { randColor } from '../utils/randColor';
import { button } from '../components/button';

import '../../css/triangles.css';

const rNorm = randomNormal(0, 0.5);

const main = document.getElementById('main');

const container = document.createElement('div');
const containerWidth = 900;
const containerHeight = 900;
container.id = 'canvas-container';
container.style.width = `${containerWidth}px`;
container.style.height = `${containerHeight}px`;
container.style.border = '1px solid #999';

main.appendChild(container);

const regl = REGL({
  container: '#canvas-container',
});

const draw = () => {
  const pointCoords = Array(30).fill(1).map(() => ([
    rNorm(),
    rNorm(),
  ]));

  const data = pointCoords.map((coords) => ({
    offset: coords,
    color: randColor(),
    sizeScale: 0.3,
    height: containerHeight * 2,
    width: containerWidth * 2,
  }));

  drawTriangleScatter(regl)(data);
};

draw();

container.appendChild(button({
  id: 'change-button',
  className: 'change-button',
  onClick: draw,
  text: 'Dreams come true',
}));
