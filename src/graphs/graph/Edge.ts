/**
 * Edge
 * Represents a connection between two vertices in a graph.
 * Each edge connects two vertices, identified by their indices.
 */
export class Edge {
  // The index of the starting vertex of the edge.
  public readonly startIndex: number;

  // The index of the ending vertex of the edge.
  public readonly endIndex: number;

  constructor(startIndex: number, endIndex: number) {
    this.startIndex = startIndex;
    this.endIndex = endIndex;
  }
}
