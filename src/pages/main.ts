import { GraphRenderer, GraphRendererConfig } from "../render/GraphRenderer";
import { randomGeometricGraph } from "../graph/generators";
import { b20Colors, black } from "../utils/colors";
import { Graph } from "../graph/Graph";

const VERTEX_COUNT = 80;
const DISTANCE_THRESHOLD = 0.15;
const graph = randomGeometricGraph(VERTEX_COUNT, DISTANCE_THRESHOLD);
const vertexColors = new Map<number, string>();

/**
 * Algorithm to assign colors where each vertex is colored differently from its neighbors. This is a greedy coloring algorithm that iterates through each vertex and assigns it the first available color that is not used by its adjacent vertices. The colors are chosen from the b20Colors palette, and if there are more vertices than colors, it will cycle through the palette again. This method does not guarantee an optimal coloring (i.e., using the minimum number of colors), but it provides a simple way to achieve a visually distinct coloring for most graphs.
 * The function modifies the graph in place by setting the color property of each vertex. It uses the adjacency information from the graph to determine which colors are already used by neighboring vertices and selects an appropriate color for each vertex accordingly.
 */
const colorVertices = (graph: Graph): Map<number, string> => {
  const adjacency = new Map<number, number[]>();
  for (const vertex of graph.vertices) {
    adjacency.set(vertex.index, []);
  }
  for (const edge of graph.edges) {
    adjacency.get(edge.startIndex)?.push(edge.endIndex);
    adjacency.get(edge.endIndex)?.push(edge.startIndex);
  }

  for (const vertex of graph.vertices) {
    const usedColors = new Set<string>();
    for (const neighborIndex of adjacency.get(vertex.index) ?? []) {
      const neighborColor = vertexColors.get(neighborIndex);
      if (neighborColor) {
        usedColors.add(neighborColor);
      }
    }

    for (const color of b20Colors) {
      if (!usedColors.has(color)) {
        vertexColors.set(vertex.index, color);
        break;
      }
    }
  }

  return vertexColors;
};

const graphStyles: Partial<GraphRendererConfig> = {
  vertexColor: (vertex) => vertexColors.get(vertex.index) ?? b20Colors[0],
  vertexSize: 10,
  vertexStroke: black,
  vertexStrokeWidth: 3,
  edgeColor: b20Colors[1],
  edgeWidth: 2,
};

colorVertices(graph);

const renderer = new GraphRenderer(40, "canvas", graph, graphStyles);
renderer.render();
