import { GraphLayout } from "./GraphLayout";
import { Vector } from "../vector/Vector";

export const degreeRadialLayout = (
  degreeMap: Map<number, number>,
  vertexCount: number,
): GraphLayout => {
  const sortedVertexIndices = Array.from(degreeMap.entries())
    .sort((first, second) => {
      if (second[1] !== first[1]) {
        return second[1] - first[1];
      }
      return first[0] - second[0];
    })
    .map(([vertexIndex]) => vertexIndex);

  const maxDegree = Math.max(...degreeMap.values(), 0);
  const shellCount = Math.min(6, Math.max(3, Math.ceil(Math.sqrt(vertexCount))));
  const shellSize = Math.max(1, Math.ceil(vertexCount / shellCount));

  const shellMembers = Array.from({ length: shellCount }, () => [] as number[]);
  const shellByVertex = new Map<number, number>();

  sortedVertexIndices.forEach((vertexIndex, rank) => {
    const shellIndex = Math.min(shellCount - 1, Math.floor(rank / shellSize));
    shellMembers[shellIndex].push(vertexIndex);
    shellByVertex.set(vertexIndex, shellIndex);
  });

  const vertexOrderInShell = new Map<number, number>();
  shellMembers.forEach((members) => {
    members.forEach((vertexIndex, index) => {
      vertexOrderInShell.set(vertexIndex, index);
    });
  });

  return {
    vertexPosition: (vertexIndex) => {
      if (vertexCount <= 0) {
        return new Vector(0, 0);
      }

      const degree = degreeMap.get(vertexIndex) ?? 0;
      const normalizedDegree =
        maxDegree > 0 ? degree / maxDegree : 0;
      const shellIndex = shellByVertex.get(vertexIndex) ?? 0;
      const shellPosition = vertexOrderInShell.get(vertexIndex) ?? 0;
      const shellPopulation = shellMembers[shellIndex]?.length ?? 1;
      const shellProgress =
        shellCount <= 1 ? 0 : shellIndex / (shellCount - 1);
      const degreeWeight = 1 - normalizedDegree;
      const radius = 0.1 + 0.35 * Math.max(shellProgress, degreeWeight);
      const angleOffset = (shellIndex * Math.PI) / shellCount;
      const angle = angleOffset + (2 * Math.PI * shellPosition) / shellPopulation;

      return new Vector(
        0.5 + radius * Math.cos(angle),
        0.5 + radius * Math.sin(angle),
      );
    },
  };
};

/**
 * Color partite layout
 * Organizes vertices into vertical columns based on their color class from graph coloring.
 * Vertices sharing a color (an independent set) are grouped into the same column,
 * producing a k-partite style visualization.
 */
export const colorPartiteLayout = (
  colorMap: Map<number, string>,
): GraphLayout => {
  const colorGroups = new Map<string, number[]>();
  for (const [vertexIndex, color] of colorMap.entries()) {
    if (!colorGroups.has(color)) {
      colorGroups.set(color, []);
    }
    colorGroups.get(color)!.push(vertexIndex);
  }

  const colorColumns = new Map<string, number>();
  let columnIndex = 0;
  for (const color of colorGroups.keys()) {
    colorColumns.set(color, columnIndex++);
  }
  const totalColumns = colorGroups.size;

  const positions = new Map<number, Vector>();
  for (const [color, members] of colorGroups.entries()) {
    const colIdx = colorColumns.get(color) ?? 0;
    const x = totalColumns <= 1 ? 0.5 : 0.1 + 0.8 * (colIdx / (totalColumns - 1));
    members.forEach((vIndex, posInCol) => {
      const colSize = members.length;
      const y = colSize <= 1 ? 0.5 : 0.1 + 0.8 * (posInCol / (colSize - 1));
      positions.set(vIndex, new Vector(x, y));
    });
  }

  return {
    vertexPosition: (vertexIndex) =>
      positions.get(vertexIndex) ?? new Vector(0.5, 0.5),
  };
};