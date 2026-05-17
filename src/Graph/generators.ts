import { Edge } from "./Edge";
import { Graph } from "./Graph";
import { Vector } from "../vector/Vector";
import { Vertex } from "./Vertex";
import { GraphLayout } from "../render/GraphRenderer";

export interface GraphWithLayout {
  graph: Graph;
  layout: GraphLayout;
}

/**
 * Random geometric graph
 * Generates a random geometric graph with a specified number of vertices and a distance threshold for edge creation.
 * Each vertex is assigned a random position in a 2D unit square, and edges are created between vertices that are within the specified distance threshold.
 */
export const randomGeometricGraph = (
  vertexCount: number,
  distanceThreshold: number,
): GraphWithLayout => {
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
  return {
    graph: new Graph(vertices, edges),
    layout: {
      vertexPosition: (vertexIndex) => positions.get(vertexIndex) ?? new Vector(0, 0),
    },
  };
};

/**
 * Lattice graph
 * Generates a lattice graph with a specified number of rows and columns.
 * Each vertex is assigned a position within [0,1]x[0,1] based on its row and column index, and edges are created between adjacent vertices (horizontally and vertically).
 * The resulting graph will have rows * cols vertices and (rows - 1) * cols + rows * (cols - 1) edges.
 * For example, a 3x3 lattice graph will have 9 vertices and 12 edges.
 * The vertex at row i and column j will have a position of (j/(cols-1), i/(rows-1)).
 */
export const latticeGraph = (rows: number, cols: number): GraphWithLayout => {
  const vertices: Vertex[] = [];
  const positions = new Map<number, Vector>();
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const index = i * cols + j;
      const position = new Vector(j / (cols - 1), i / (rows - 1)); // x corresponds to column, y corresponds to row
      vertices.push(new Vertex(index));
      positions.set(index, position);
    }
  }
  const edges: Edge[] = [];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const index = i * cols + j;
      if (j < cols - 1) {
        edges.push(new Edge(index, index + 1)); // horizontal edge
      }
      if (i < rows - 1) {
        edges.push(new Edge(index, index + cols)); // vertical edge
      }
    }
  }
  return {
    graph: new Graph(vertices, edges),
    layout: {
      vertexPosition: (vertexIndex) => positions.get(vertexIndex) ?? new Vector(0, 0),
    },
  };
};
