import { GraphLayout } from "./GraphLayout";
import { Graph } from "../graph/Graph";
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

export interface ForceDirectedLayoutOptions {
  iterations?: number;
  cooling?: number;
  repulsion?: number;
  attraction?: number;
  jitter?: number;
}

/**
 * Force-directed layout (Fruchterman-Reingold style)
 * Produces a static layout in the unit square from graph structure.
 */
export const forceDirectedLayout = (
  graph: Graph,
  options: ForceDirectedLayoutOptions = {},
): GraphLayout => {
  const vertexCount = graph.vertices.length;
  const positions = new Map<number, Vector>();

  if (vertexCount === 0) {
    return {
      vertexPosition: () => new Vector(0.5, 0.5),
    };
  }

  const iterations = options.iterations ?? 250;
  const cooling = options.cooling ?? 0.95;
  const repulsion = options.repulsion ?? 1;
  const attraction = options.attraction ?? 1;
  const jitter = options.jitter ?? 0.001;

  // Start on a circle for deterministic, well-spaced initialization.
  for (let i = 0; i < vertexCount; i++) {
    const angle = (2 * Math.PI * i) / vertexCount;
    positions.set(
      graph.vertices[i].index,
      new Vector(0.5 + 0.35 * Math.cos(angle), 0.5 + 0.35 * Math.sin(angle)),
    );
  }

  const area = 1;
  const k = Math.sqrt(area / vertexCount);
  let temperature = 0.12;

  for (let iter = 0; iter < iterations; iter++) {
    const displacement = new Map<number, Vector>();
    for (const vertex of graph.vertices) {
      displacement.set(vertex.index, new Vector(0, 0));
    }

    // Repulsive forces between all vertex pairs.
    for (let i = 0; i < vertexCount; i++) {
      const v = graph.vertices[i].index;
      const posV = positions.get(v) ?? new Vector(0.5, 0.5);
      for (let j = i + 1; j < vertexCount; j++) {
        const u = graph.vertices[j].index;
        const posU = positions.get(u) ?? new Vector(0.5, 0.5);
        let delta = new Vector(posV.x - posU.x, posV.y - posU.y);
        let distance = Math.max(0.001, delta.length());

        if (distance < 0.01) {
          delta = new Vector(
            delta.x + (Math.random() - 0.5) * jitter,
            delta.y + (Math.random() - 0.5) * jitter,
          );
          distance = Math.max(0.001, delta.length());
        }

        const force = (repulsion * k * k) / distance;
        const direction = delta.scale(1 / distance);
        const offset = direction.scale(force);

        displacement.set(v, (displacement.get(v) ?? new Vector(0, 0)).add(offset));
        displacement.set(
          u,
          (displacement.get(u) ?? new Vector(0, 0)).add(offset.scale(-1)),
        );
      }
    }

    // Attractive forces along edges.
    for (const edge of graph.edges) {
      const v = edge.startIndex;
      const u = edge.endIndex;
      const posV = positions.get(v) ?? new Vector(0.5, 0.5);
      const posU = positions.get(u) ?? new Vector(0.5, 0.5);
      const delta = new Vector(posV.x - posU.x, posV.y - posU.y);
      const distance = Math.max(0.001, delta.length());
      const force = (attraction * distance * distance) / k;
      const direction = delta.scale(1 / distance);
      const offset = direction.scale(force);

      displacement.set(v, (displacement.get(v) ?? new Vector(0, 0)).add(offset.scale(-1)));
      displacement.set(u, (displacement.get(u) ?? new Vector(0, 0)).add(offset));
    }

    // Move vertices with capped step size and keep inside unit square.
    for (const vertex of graph.vertices) {
      const index = vertex.index;
      const pos = positions.get(index) ?? new Vector(0.5, 0.5);
      const disp = displacement.get(index) ?? new Vector(0, 0);
      const dispLength = Math.max(0.001, disp.length());
      const step = Math.min(temperature, dispLength);
      const move = disp.scale(step / dispLength);

      const x = Math.min(0.95, Math.max(0.05, pos.x + move.x));
      const y = Math.min(0.95, Math.max(0.05, pos.y + move.y));
      positions.set(index, new Vector(x, y));
    }

    temperature *= cooling;
  }

  return {
    vertexPosition: (vertexIndex) =>
      positions.get(vertexIndex) ?? new Vector(0.5, 0.5),
  };
};