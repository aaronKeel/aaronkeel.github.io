import { Graph } from "../graph/Graph";

/**
 * Builds an undirected adjacency list for the given graph.
 *
 * Each key is a vertex index and each value is the list of neighboring vertex
 * indices connected by an edge.
 *
 * @param graph Graph to analyze.
 * @returns Mapping of vertex index to its neighboring vertex indices.
 */
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

/**
 * Computes the degree of a single vertex.
 *
 * Degree is the number of incident edges for the specified vertex.
 *
 * @param graph Graph to analyze.
 * @param vertexIndex Index of the vertex.
 * @returns Degree of the vertex, or 0 if the vertex is not present.
 */
export const vertexDegree = (graph: Graph, vertexIndex: number): number => {
  return buildAdjacency(graph).get(vertexIndex)?.length ?? 0;
};

/**
 * Computes the degree of every vertex in the graph.
 *
 * @param graph Graph to analyze.
 * @returns Mapping of vertex index to degree.
 */
export const vertexDegrees = (graph: Graph): Map<number, number> => {
  const adjacency = buildAdjacency(graph);
  const degrees = new Map<number, number>();

  for (const vertex of graph.vertices) {
    degrees.set(vertex.index, adjacency.get(vertex.index)?.length ?? 0);
  }

  return degrees;
};

/**
 * Colors vertices using a greedy first-fit strategy.
 *
 * Vertices are processed in their existing order. For each vertex, the first
 * palette color not used by already-colored neighbors is selected.
 *
 * @param graph Graph to color.
 * @param palette Ordered list of candidate colors.
 * @returns Mapping of vertex index to assigned color.
 */
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

/**
 * Colors vertices with a balanced greedy strategy.
 *
 * Vertices are processed in descending degree order (Welsh-Powell). At each
 * step, among valid colors, the one with the smallest current class size is
 * chosen to keep color classes as even as possible.
 *
 * @param graph Graph to color.
 * @param palette Ordered list of candidate colors.
 * @returns Mapping of vertex index to assigned color.
 */
export const equitableVertexColoring = (
  graph: Graph,
  palette: string[],
): Map<number, string> => {
  const adjacency = buildAdjacency(graph);
  const colorCounts = new Map<string, number>();
  for (const color of palette) {
    colorCounts.set(color, 0);
  }

  const sortedVertices = [...graph.vertices].sort(
    (a, b) =>
      (adjacency.get(b.index)?.length ?? 0) -
      (adjacency.get(a.index)?.length ?? 0),
  );

  const vertexColors = new Map<number, string>();
  for (const vertex of sortedVertices) {
    const usedColors = new Set<string>();
    for (const neighborIndex of adjacency.get(vertex.index) ?? []) {
      const neighborColor = vertexColors.get(neighborIndex);
      if (neighborColor) {
        usedColors.add(neighborColor);
      }
    }

    let bestColor: string | undefined;
    let bestCount = Infinity;
    for (const color of palette) {
      if (!usedColors.has(color)) {
        const count = colorCounts.get(color) ?? 0;
        if (count < bestCount) {
          bestCount = count;
          bestColor = color;
        }
      }
    }

    if (bestColor !== undefined) {
      vertexColors.set(vertex.index, bestColor);
      colorCounts.set(bestColor, bestCount + 1);
    }
  }

  return vertexColors;
};