import { GraphRenderer } from "../render/GraphRenderer";
import { latticeGraph } from "../algorithms/generators";
import { gridLayout } from "../layout/staticLayouts";

const rows = 10;
const cols = 10;
const graph = latticeGraph(rows, cols);
const layout = gridLayout(rows, cols);

const renderer = new GraphRenderer(40, "canvas", graph, layout);
renderer.render();
