import { lightGray } from "../utils/colors";
import { Vector } from "./Vector";

/**
 * Vertex
 * Represents a vertex in a graph, which can be connected to other vertices via edges.
 * Each vertex has a unique index and a position in 2D space.
 */
export class Vertex {
  public readonly index: number;
  public readonly position: Vector;
  public color: string;

  constructor(index: number, position: Vector) {
    this.index = index;
    this.position = position;
    this.color = lightGray;
  }

  setColor(color: string) {
    this.color = color;
  }
}
