import { GraphRenderer } from "../GraphRenderer";
import { randomGeometricGraph } from "../Graph/generators";

const VERTEX_COUNT = 100;
const DISTANCE_THRESHOLD = 0.15;
const graph = randomGeometricGraph(VERTEX_COUNT, DISTANCE_THRESHOLD);

const renderer = new GraphRenderer(40, "canvas", graph);
renderer.render();
