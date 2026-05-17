import { GraphRenderer } from "../render/GraphRenderer";
import { latticeGraph } from "../graph/generators";

const graph = latticeGraph(10, 10);

const renderer = new GraphRenderer(40, "canvas", graph);
renderer.render();
