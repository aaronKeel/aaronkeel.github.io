import { GraphRenderer } from "../render/GraphRenderer";
import { latticeGraph } from "../graph/generators";

const { graph, layout } = latticeGraph(10, 10);

const renderer = new GraphRenderer(40, "canvas", graph, layout);
renderer.render();
