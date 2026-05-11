import { GraphRenderer } from "../GraphRenderer";
import { Graph } from "../Graph/Graph";
import { Edge } from "../Graph/Edge";
import { randomGeometricGraph } from "../Graph/generators";
import { lightGray } from "../utils/colors";

const VERTEX_COUNT = 300;
const DISTANCE_THRESHOLD = 0.15;
const MST_EDGE_COLORS = [
  "#ff6b6b",
  "#4dabf7",
  "#51cf66",
  "#ffd43b",
  "#845ef7",
  "#ff922b",
];
const DEFAULT_EDGE_COLOR = lightGray;

const graph = computeMinSpanTree(
  randomGeometricGraph(VERTEX_COUNT, DISTANCE_THRESHOLD),
);
const renderer = new GraphRenderer(40, "canvas", graph);
renderer.render();

/**
 * Runs a component-wise Prim's algorithm and colors the resulting MST edges.
 */
function computeMinSpanTree(graph: Graph): Graph {
  for (const edge of graph.edges) {
    edge.color = DEFAULT_EDGE_COLOR;
  }

  const adjacency = new Map<number, Edge[]>();
  for (const vertex of graph.vertices) {
    adjacency.set(vertex.index, []);
  }
  for (const edge of graph.edges) {
    adjacency.get(edge.startIndex)?.push(edge);
    adjacency.get(edge.endIndex)?.push(edge);
  }

  const visited = new Set<number>();

  for (const vertex of graph.vertices) {
    if (visited.has(vertex.index)) {
      continue;
    }

    const componentVertices: number[] = [];
    const stack = [vertex.index];
    visited.add(vertex.index);

    while (stack.length > 0) {
      const current = stack.pop();
      if (current === undefined) {
        continue;
      }

      componentVertices.push(current);
      for (const edge of adjacency.get(current) ?? []) {
        const neighbor =
          edge.startIndex === current ? edge.endIndex : edge.startIndex;
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          stack.push(neighbor);
        }
      }
    }

    if (componentVertices.length <= 1) {
      continue;
    }

    const componentSet = new Set(componentVertices);
    const componentColor =
      MST_EDGE_COLORS[componentVertices[0] % MST_EDGE_COLORS.length];
    const treeVertices = new Set<number>([componentVertices[0]]);

    while (treeVertices.size < componentVertices.length) {
      let bestEdge: Edge | null = null;
      let bestWeight = Infinity;
      let bestNeighbor = -1;

      for (const treeVertex of treeVertices) {
        for (const edge of adjacency.get(treeVertex) ?? []) {
          const neighbor =
            edge.startIndex === treeVertex ? edge.endIndex : edge.startIndex;
          if (!componentSet.has(neighbor) || treeVertices.has(neighbor)) {
            continue;
          }

          const start = graph.vertices[edge.startIndex].position;
          const end = graph.vertices[edge.endIndex].position;
          const weight = start.distanceTo(end);
          if (weight < bestWeight) {
            bestWeight = weight;
            bestEdge = edge;
            bestNeighbor = neighbor;
          }
        }
      }

      if (!bestEdge || bestNeighbor === -1) {
        break;
      }

      bestEdge.color = componentColor;
      treeVertices.add(bestNeighbor);
    }
  }

  return graph;
}
