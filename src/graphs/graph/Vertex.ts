/**
 * Vertex
 * Represents a vertex in a graph, which can be connected to other vertices via edges.
 * Each vertex has a unique index.
 */
export class Vertex {
  // The unique index of the vertex within the graph.
  public readonly index: number;

  constructor(index: number) {
    this.index = index;
  }
}
