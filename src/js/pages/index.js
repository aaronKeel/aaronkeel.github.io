import { linkList, link } from '../components/link';
import '../../css/index.css';

const main = document.getElementById('main');

const links = linkList({
  list: [
    link({
      text: 'Triangles',
      href: './triangles.html',
    }),
  ],
});

main.appendChild(links);
