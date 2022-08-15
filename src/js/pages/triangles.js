import REGL from 'regl';

import { drawBatch } from '../regl/commands/drawBatch';
import { randColor } from '../utils/randColor';
import { button } from '../components/button';

import '../../css/triangles.css';

const regl = REGL({
  container: '#main',
});

const main = document.getElementById('main');

const draw = () => {
  const offsets = [-1, -0.5, 0, 0.5];

  const data = offsets.reduce((acc, x) => {
    const r = offsets.map((y) => ({
      offset: [x, y],
      color: randColor(),
    }));
    return [...acc, ...r];
  }, []);

  drawBatch(regl)(data);
};

draw();

main.appendChild(button({
  id: 'change-button',
  className: 'change-button',
  onClick: draw,
  text: 'Dreams come true',
}));
