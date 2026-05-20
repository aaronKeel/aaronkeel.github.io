import { equitableVertexColoring } from "../algorithms/analysis";
import { GraphRenderer, GraphStyleConfig } from "../render/GraphRenderer";
import { erdosRenyiGraph } from "../algorithms/generators";
import { colorPartiteLayout } from "../layout/derivedLayouts";
import { b20Colors, black } from "../utils/colors";

const VERTEX_COUNT = 80;
const EDGE_PROBABILITY = 0.09;
const graph = erdosRenyiGraph(VERTEX_COUNT, EDGE_PROBABILITY);
const vertexColors = equitableVertexColoring(graph, b20Colors);
const layout = colorPartiteLayout(vertexColors);

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
