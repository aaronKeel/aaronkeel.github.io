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