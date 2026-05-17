import { Vector } from "./Vector";

/**
 * Vertex
 * Represents a vertex in a graph, which can be connected to other vertices via edges.
 * Each vertex has a unique index and a position in 2D space.
 */
export class Vertex {
  // The unique index of the vertex within the graph.
  public readonly index: number;

  // The position of the vertex in 2D space, represented as a Vector.
  public readonly position: Vector;

  constructor(index: number, position: Vector) {
    this.index = index;
    this.position = position;
  }
}
