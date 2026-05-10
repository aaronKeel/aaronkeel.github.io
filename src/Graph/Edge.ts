/**
 * Edge
 * Represents a connection between two vertices in a graph.
 * Each edge connects two vertices, identified by their indices.
 */
export class Edge {
  public readonly startIndex: number;
  public readonly endIndex: number;
  public color: string;

  constructor(startIndex: number, endIndex: number) {
    this.startIndex = startIndex;
    this.endIndex = endIndex;
    this.color = "#AAA";
  }

  public setColor(color: string) {
    this.color = color;
  }
}
