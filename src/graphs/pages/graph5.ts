import { equitableVertexColoring } from "../algorithms/analysis";
import { GraphRenderer, GraphStyleConfig } from "../render/GraphRenderer";
import { trianglesGraph } from "../algorithms/generators";
import { forceDirectedLayout } from "../layout/derivedLayouts";
import { b20Colors, black } from "../utils/colors";

const VERTEX_COUNT = Math.floor(Math.random() * 40) + 4;
const graph = trianglesGraph(VERTEX_COUNT);
const vertexColors = equitableVertexColoring(graph, b20Colors);
const layout = forceDirectedLayout(graph);

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
