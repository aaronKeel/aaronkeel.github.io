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
}
