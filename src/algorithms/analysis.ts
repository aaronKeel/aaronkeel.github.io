import { Graph } from "../graph/Graph";

export const buildAdjacency = (graph: Graph): Map<number, number[]> => {
  const adjacency = new Map<number, number[]>();
  for (const vertex of graph.vertices) {
    adjacency.set(vertex.index, []);
  }
  for (const edge of graph.edges) {
    adjacency.get(edge.startIndex)?.push(edge.endIndex);
    adjacency.get(edge.endIndex)?.push(edge.startIndex);
  }
  return adjacency;
};

export const vertexDegree = (graph: Graph, vertexIndex: number): number => {
  return buildAdjacency(graph).get(vertexIndex)?.length ?? 0;
};

export const vertexDegrees = (graph: Graph): Map<number, number> => {
  const adjacency = buildAdjacency(graph);
  const degrees = new Map<number, number>();

  for (const vertex of graph.vertices) {
    degrees.set(vertex.index, adjacency.get(vertex.index)?.length ?? 0);
  }

  return degrees;
};

export const greedyVertexColoring = (
  graph: Graph,
  palette: string[],
): Map<number, string> => {
  const adjacency = buildAdjacency(graph);
  const vertexColors = new Map<number, string>();

  for (const vertex of graph.vertices) {
    const usedColors = new Set<string>();
    for (const neighborIndex of adjacency.get(vertex.index) ?? []) {
      const neighborColor = vertexColors.get(neighborIndex);
      if (neighborColor) {
        usedColors.add(neighborColor);
      }
    }

    for (const color of palette) {
      if (!usedColors.has(color)) {
        vertexColors.set(vertex.index, color);
        break;
      }
    }
  }

  return vertexColors;
};