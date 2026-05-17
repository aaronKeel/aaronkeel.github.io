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