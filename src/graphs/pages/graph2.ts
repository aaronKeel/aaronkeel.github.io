import { vertexDegrees, greedyVertexColoring } from "../algorithms/analysis";
import { GraphRenderer, GraphStyleConfig } from "../render/GraphRenderer";
import { randomGeometricGraph } from "../algorithms/generators";
import { degreeRadialLayout } from "../layout/derivedLayouts";
import { b20Colors, black } from "../utils/colors";

const VERTEX_COUNT = 80;
const DISTANCE_THRESHOLD = 0.15;
const graph = randomGeometricGraph(VERTEX_COUNT, DISTANCE_THRESHOLD);
const degreeMap = vertexDegrees(graph);
const layout = degreeRadialLayout(degreeMap, graph.vertices.length);
const vertexColors = greedyVertexColoring(graph, b20Colors);

const graphStyles: Partial<GraphStyleConfig> = {
  vertexColor: (vertex) => vertexColors.get(vertex.index) ?? b20Colors[0],
  vertexSize: 10,
  vertexStroke: black,
  vertexStrokeWidth: 3,
  edgeColor: b20Colors[1],
  edgeWidth: 2,
};

const renderer = new GraphRenderer(40, "canvas", graph, layout, graphStyles);
renderer.render();
