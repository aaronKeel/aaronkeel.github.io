import REGL from 'regl';
import { drawBatch } from './js/commands/drawBatch';
import { randColor } from './js/utils/randColor';

const regl = REGL({
  container: '#main',
});

const offsets = [-1, -0.5, 0, 0.5];

const data = offsets.reduce((acc, x) => {
  const r = offsets.map((y) => ({
    offset: [x, y],
    color: randColor(),
  }));
  return [...acc, ...r];
}, []);

drawBatch(regl)(data);
