import { renderBasicLinkList } from '../components/link';
import '../../css/index.css';

const main = document.getElementById('main');

if (main) {
  renderBasicLinkList({
    listData: [
      {
        text: 'Triangles',
        href: './triangles.html',
      },
      {
        text: 'Triangle Scatter',
        href: './triangleScatter.html',
      },
      {
        text: 'Vertex Triangle',
        href: './vertexTriangle.html',
      },
    ],
    parentElement: main,
  });
}
