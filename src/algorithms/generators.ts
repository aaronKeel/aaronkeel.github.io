import { Edge } from "../graph/Edge";
import { Graph } from "../graph/Graph";
import { Vertex } from "../graph/Vertex";
import { Vector } from "../vector/Vector";

/**
 * Random geometric graph
 * Generates a random geometric graph with a specified number of vertices and a distance threshold for edge creation.
 * Each vertex is assigned a position in a 2D unit square, and edges are created between vertices that are within the specified distance threshold.
 */
export const randomGeometricGraph = (
  vertexCount: number,
  distanceThreshold: number,
): Graph => {
  const vertices: Vertex[] = [];
  const positions = new Map<number, Vector>();
  for (let i = 0; i < vertexCount; i++) {
    const position = new Vector(Math.random(), Math.random());
    vertices.push(new Vertex(i));
    positions.set(i, position);
  }
  const edges: Edge[] = [];
  for (let i = 0; i < vertexCount; i++) {
    for (let j = i + 1; j < vertexCount; j++) {
      const firstPosition = positions.get(i);
      const secondPosition = positions.get(j);
      if (
        firstPosition &&
        secondPosition &&
        firstPosition.distanceTo(secondPosition) <= distanceThreshold
      ) {
        edges.push(new Edge(i, j));
      }
    }
  }
  return new Graph(vertices, edges);
};

/**
 * Lattice graph
 * Generates a lattice graph with a specified number of rows and columns.
 * The result is topology only; layout is handled separately.
 */
export const latticeGraph = (rows: number, cols: number): Graph => {
  const vertices: Vertex[] = [];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const index = i * cols + j;
      vertices.push(new Vertex(index));
    }
  }
  const edges: Edge[] = [];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const index = i * cols + j;
      if (j < cols - 1) {
        edges.push(new Edge(index, index + 1));
      }
      if (i < rows - 1) {
        edges.push(new Edge(index, index + cols));
      }
    }
  }
  return new Graph(vertices, edges);
};

/**
 * Erdős–Rényi random graph
 * Generates a random graph with n vertices where each pair of vertices is connected with independent probability p.
 * This is the G(n, p) model of random graph generation.
 * Expected number of edges: n * (n-1) / 2 * p
 */
export const erdosRenyiGraph = (n: number, p: number): Graph => {
  const vertices: Vertex[] = [];
  for (let i = 0; i < n; i++) {
    vertices.push(new Vertex(i));
  }
  const edges: Edge[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (Math.random() < p) {
        edges.push(new Edge(i, j));
      }
    }
  }
  return new Graph(vertices, edges);
};

/**
 * Triangles graph (triangle-expansion / 3-tree style growth)
 * Starts from K3 and repeatedly adds one vertex adjacent to all three vertices of a chosen triangle.
 */
export const trianglesGraph = (n: number): Graph => {
  if (n < 3) {
    throw new RangeError("trianglesGraph requires n >= 3");
  }

  const vertices: Vertex[] = [new Vertex(0), new Vertex(1), new Vertex(2)];
  const edges: Edge[] = [new Edge(0, 1), new Edge(0, 2), new Edge(1, 2)];
  const adjacency = new Map<number, Set<number>>([
    [0, new Set([1, 2])],
    [1, new Set([0, 2])],
    [2, new Set([0, 1])],
  ]);

  const addEdge = (a: number, b: number): void => {
    const start = Math.min(a, b);
    const end = Math.max(a, b);
    edges.push(new Edge(start, end));
    adjacency.get(start)?.add(end);
    adjacency.get(end)?.add(start);
  };

  let k = 3;
  while (k < n) {
    const triangles: Array<[number, number, number]> = [];

    // Enumerate all current triangles i < j < m.
    for (let i = 0; i < k; i++) {
      const neighborsI = adjacency.get(i);
      if (!neighborsI) {
        continue;
      }
      for (let j = i + 1; j < k; j++) {
        if (!neighborsI.has(j)) {
          continue;
        }
        for (let m = j + 1; m < k; m++) {
          if (neighborsI.has(m) && adjacency.get(j)?.has(m)) {
            triangles.push([i, j, m]);
          }
        }
      }
    }

    if (triangles.length === 0) {
      throw new Error("No triangle found during trianglesGraph generation");
    }

    const triangle = triangles[Math.floor(Math.random() * triangles.length)];
    const newIndex = k;
    vertices.push(new Vertex(newIndex));
    adjacency.set(newIndex, new Set<number>());

    addEdge(newIndex, triangle[0]);
    addEdge(newIndex, triangle[1]);
    addEdge(newIndex, triangle[2]);

    k += 1;
  }

  return new Graph(vertices, edges);
};

