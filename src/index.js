import REGL from 'regl';
import { drawBatch } from './js/commands/drawBatch';

const regl = REGL({
  container: '#main',
});

drawBatch(regl)([
  { offset: [-0.5, -0.5] },
  { offset: [-0.5, 0] },
  { offset: [-0.5, 0.5] },
  { offset: [0, -0.5] },
  { offset: [0, 0] },
  { offset: [0, 0.5] },
  { offset: [0.5, -0.5] },
  { offset: [0.5, 0] },
  { offset: [0.5, 0.5] },
]);
