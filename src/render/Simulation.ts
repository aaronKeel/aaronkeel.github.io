import { Graph } from "@/graph/Graph";

export interface SimulationNodeState {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  fixed: boolean;
}

export interface SimulationState {
  nodes: SimulationNodeState[];
}

export interface SimulationConfig {
  seed?: number;
  fixedNodeIds?: number[];
  initialPositions?: Record<number, { x: number; y: number }>;
  dt?: number;
  damping?: number;
  springLength?: number;
  springStiffness?: number;
  centerStrength?: number;
}

export interface SimulationHandle {
  step: (steps?: number) => void;
  getState: () => SimulationState;
}

export function createSimulation(
  graph: Graph,
  config: SimulationConfig = {}
): SimulationHandle {
  const fixedIds = new Set(config.fixedNodeIds ?? []);
  const nodes: SimulationNodeState[] = graph.vertices.map((vertex) => {
    const initial = config.initialPositions?.[vertex.index];

    return {
      id: vertex.index,
      x: initial?.x ?? vertex.index * 50,
      y: initial?.y ?? 0,
      vx: 0,
      vy: 0,
      fixed: fixedIds.has(vertex.index),
    };
  });

  const state: SimulationState = { nodes };
  const dt = config.dt ?? 0.016;
  const damping = config.damping ?? 0.9;
  const springLength = config.springLength ?? 80;
  const springStiffness = config.springStiffness ?? 0.015;
  const centerStrength = config.centerStrength ?? 0.001;
  const nodeIndexByVertexId = new Map<number, number>(
    state.nodes.map((node, idx) => [node.id, idx])
  );

  function stepOnce(): void {
    const fx = new Array<number>(state.nodes.length).fill(0);
    const fy = new Array<number>(state.nodes.length).fill(0);

    for (const edge of graph.edges) {
      const sourceIdx = nodeIndexByVertexId.get(edge.startIndex);
      const targetIdx = nodeIndexByVertexId.get(edge.endIndex);

      if (sourceIdx === undefined || targetIdx === undefined) {
        continue;
      }

      const source = state.nodes[sourceIdx];
      const target = state.nodes[targetIdx];
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const distance = Math.hypot(dx, dy) || 0.0001;
      const displacement = distance - springLength;
      const force = springStiffness * displacement;
      const ux = dx / distance;
      const uy = dy / distance;
      const fxValue = force * ux;
      const fyValue = force * uy;

      fx[sourceIdx] += fxValue;
      fy[sourceIdx] += fyValue;
      fx[targetIdx] -= fxValue;
      fy[targetIdx] -= fyValue;
    }

    for (let i = 0; i < state.nodes.length; i += 1) {
      const node = state.nodes[i];

      if (node.fixed) {
        node.vx = 0;
        node.vy = 0;
        continue;
      }

      fx[i] += -node.x * centerStrength;
      fy[i] += -node.y * centerStrength;

      node.vx = (node.vx + fx[i] * dt) * damping;
      node.vy = (node.vy + fy[i] * dt) * damping;
      node.x += node.vx * dt;
      node.y += node.vy * dt;

      if (!Number.isFinite(node.x) || !Number.isFinite(node.y)) {
        node.x = 0;
        node.y = 0;
      }

      if (!Number.isFinite(node.vx) || !Number.isFinite(node.vy)) {
        node.vx = 0;
        node.vy = 0;
      }
    }
  }

  return {
    step: (steps = 1): void => {
      const count = Math.max(0, Math.floor(steps));
      for (let i = 0; i < count; i += 1) {
        stepOnce();
      }
    },
    getState: (): SimulationState => ({
      nodes: state.nodes.map((node) => ({ ...node })),
    }),
  };
}