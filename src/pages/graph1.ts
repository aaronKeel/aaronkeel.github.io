import { GraphRenderer } from "../GraphRenderer";
import { latticeGraph } from "../Graph/generators";

const graph = latticeGraph(10, 10);

const renderer = new GraphRenderer(40, "canvas", graph);
renderer.render();
