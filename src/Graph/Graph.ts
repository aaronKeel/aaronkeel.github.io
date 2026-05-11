import { Vertex } from "./Vertex";
import { Edge } from "./Edge";

/**
 * Graph
 */
export class Graph {
  public readonly vertices: Vertex[];
  public readonly edges: Edge[];

  constructor(vertices: Vertex[], edges: Edge[]) {
    this.vertices = vertices;
    this.edges = edges;
  }

  vertexDegree(vertexIndex: number): number {
    let degree = 0;
    for (const edge of this.edges) {
      if (edge.startIndex === vertexIndex || edge.endIndex === vertexIndex) {
        degree++;
      }
    }
    return degree;
  }
}
