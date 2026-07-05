import { GraphLayout } from "./GraphLayout";
import { Vector } from "../vector/Vector";

export const circleLayout = (vertexCount: number): GraphLayout => {
  return {
    vertexPosition: (vertexIndex) => {
      if (vertexCount <= 0) {
        return new Vector(0, 0);
      }

      const angle = (2 * Math.PI * vertexIndex) / vertexCount;
      const radius = 0.4;
      return new Vector(
        0.5 + radius * Math.cos(angle),
        0.5 + radius * Math.sin(angle),
      );
    },
  };
};

export const gridLayout = (rows: number, cols: number): GraphLayout => {
  return {
    vertexPosition: (vertexIndex) => {
      if (rows <= 1 || cols <= 1) {
        return new Vector(0.5, 0.5);
      }

      const row = Math.floor(vertexIndex / cols);
      const col = vertexIndex % cols;
      return new Vector(col / (cols - 1), row / (rows - 1));
    },
  };
};