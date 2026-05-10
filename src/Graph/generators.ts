import { Edge } from "./Edge";
import { Graph } from "./Graph";
import { Vector } from "./Vector";
import { Vertex } from "./Vertex";

/**
 * Random geometric graph
 * Generates a random geometric graph with a specified number of vertices and a distance threshold for edge creation.
 * Each vertex is assigned a random position in a 2D unit square, and edges are created between vertices that are within the specified distance threshold.
 */
export const randomGeometricGraph = (
  vertexCount: number,
  distanceThreshold: number,
): Graph => {
  const vertices: Vertex[] = [];
  for (let i = 0; i < vertexCount; i++) {
    const position = new Vector(Math.random(), Math.random());
    vertices.push(new Vertex(i, position));
  }
  const edges: Edge[] = [];
  for (let i = 0; i < vertexCount; i++) {
    for (let j = i + 1; j < vertexCount; j++) {
      if (vertices[i].position.distanceTo(vertices[j].position) <= distanceThreshold) {
        edges.push(new Edge(i, j));
      }
    }
  }
  return new Graph(vertices, edges);
};

