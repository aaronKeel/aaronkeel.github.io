import { Vector } from "../vector/Vector";

/**
 * GraphLayout
 * Provides a layout strategy for mapping vertex indices to 2D positions.
 */
export interface GraphLayout {
  vertexPosition(vertexIndex: number): Vector;
}