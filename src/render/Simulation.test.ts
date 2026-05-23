import { describe, expect, it, vi } from "vitest";
import { Edge } from "@/graph/Edge";
import { Graph } from "@/graph/Graph";
import { Vertex } from "@/graph/Vertex";
import { createSimulation } from "@/render/Simulation";

type FutureSimulationHandle = ReturnType<typeof createSimulation> & {
  start?: () => void;
  stop?: () => void;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  off?: (event: string, handler: (...args: unknown[]) => void) => void;
  updateGraph?: (patch: {
    addNodes?: Array<{ id: number; x: number; y: number }>;
    addEdges?: Array<{
      source: number;
      target: number;
      length?: number;
      stiffness?: number;
      weight?: number;
    }>;
  }) => void;
  setNodeFixed?: (nodeId: number, fixed: boolean, position?: { x: number; y: number }) => void;
  reheat?: (alpha?: number) => void;
  getMetrics?: () => { energy: number; tickDuration: number };
  dispose?: () => void;
};

function makeTinyGraph(): Graph {
  return new Graph(
    [new Vertex(0), new Vertex(1), new Vertex(2)],
    [new Edge(0, 1), new Edge(1, 2)]
  );
}

describe("createSimulation", () => {
  it("is deterministic, keeps values finite, moves non-fixed nodes, and keeps fixed nodes in place", () => {
    const graph = makeTinyGraph();
    const config = {
      seed: 123,
      fixedNodeIds: [0],
      initialPositions: {
        0: { x: 0, y: 0 },
        1: { x: 100, y: 0 },
        2: { x: 200, y: 0 },
      },
    };

    const simA = createSimulation(graph, config);
    const simB = createSimulation(graph, config);

    const before = simA.getState();

    simA.step(10);
    simB.step(10);

    const stateA = simA.getState();
    const stateB = simB.getState();

    expect(stateA).toEqual(stateB);

    const hasFiniteValues = stateA.nodes.every(
      (node) =>
        Number.isFinite(node.x) &&
        Number.isFinite(node.y) &&
        Number.isFinite(node.vx) &&
        Number.isFinite(node.vy)
    );
    expect(hasFiniteValues).toBe(true);

    const fixedBefore = before.nodes.find((node) => node.id === 0);
    const fixedAfter = stateA.nodes.find((node) => node.id === 0);
    expect(fixedBefore).toBeDefined();
    expect(fixedAfter).toBeDefined();
    expect(fixedAfter?.x).toBe(fixedBefore?.x);
    expect(fixedAfter?.y).toBe(fixedBefore?.y);

    const movedNonFixed = stateA.nodes
      .filter((node) => !node.fixed)
      .some((node) => {
        const start = before.nodes.find((candidate) => candidate.id === node.id);
        return start !== undefined && (node.x !== start.x || node.y !== start.y);
      });

    expect(movedNonFixed).toBe(true);
  });

  it("starts and stops continuous ticking", () => {
    const graph = makeTinyGraph();
    const simulation = createSimulation(graph, {
      initialPositions: {
        0: { x: 0, y: 0 },
        1: { x: 100, y: 0 },
        2: { x: 200, y: 0 },
      },
    }) as FutureSimulationHandle;

    expect(typeof simulation.start).toBe("function");
    expect(typeof simulation.stop).toBe("function");

    simulation.start?.();
    simulation.start?.();
    simulation.stop?.();
    expect(simulation.getState().nodes).toHaveLength(3);
  });

  it("subscribes and unsubscribes event handlers", () => {
    const graph = makeTinyGraph();
    const simulation = createSimulation(graph) as FutureSimulationHandle;

    const handler = vi.fn();

    expect(typeof simulation.on).toBe("function");
    expect(typeof simulation.off).toBe("function");

    simulation.on?.("tick", handler);
    simulation.step(1);
    simulation.off?.("tick", handler);

    expect(handler).toHaveBeenCalled();
  });

  it.skip("updates graph structure and node fixed state at runtime", () => {
    const graph = makeTinyGraph();
    const simulation = createSimulation(graph) as FutureSimulationHandle;

    expect(typeof simulation.updateGraph).toBe("function");
    expect(typeof simulation.setNodeFixed).toBe("function");

    simulation.updateGraph?.({
      addNodes: [{ id: 3, x: 300, y: 0 }],
      addEdges: [{ source: 2, target: 3, length: 80, stiffness: 0.015 }],
    });
    simulation.setNodeFixed?.(1, true, { x: 100, y: 0 });

    const state = simulation.getState();
    expect(state.nodes.some((node) => node.id === 3)).toBe(true);
    expect(state.nodes.find((node) => node.id === 1)?.fixed).toBe(true);
  });

  it.skip("reheats the simulation and exposes metrics", () => {
    const graph = makeTinyGraph();
    const simulation = createSimulation(graph) as FutureSimulationHandle;

    expect(typeof simulation.reheat).toBe("function");
    expect(typeof simulation.getMetrics).toBe("function");

    simulation.reheat?.(0.5);
    const metrics = simulation.getMetrics?.();

    expect(metrics).toHaveProperty("energy");
    expect(metrics).toHaveProperty("tickDuration");
  });

  it.skip("disposes internal resources", () => {
    const graph = makeTinyGraph();
    const simulation = createSimulation(graph) as FutureSimulationHandle;

    expect(typeof simulation.dispose).toBe("function");

    simulation.dispose?.();

    expect(() => simulation.step(1)).not.toThrow();
  });

  it("returns defensive state copies and treats non-positive steps as no-ops", () => {
    const graph = makeTinyGraph();
    const simulation = createSimulation(graph, {
      initialPositions: {
        0: { x: 10, y: 20 },
        1: { x: 30, y: 40 },
        2: { x: 50, y: 60 },
      },
    });

    const before = simulation.getState();
    before.nodes[0].x = 999;
    before.nodes[1].vy = 777;

    const afterMutation = simulation.getState();
    expect(afterMutation.nodes[0].x).toBe(10);
    expect(afterMutation.nodes[1].vy).toBe(0);

    simulation.step(0);
    simulation.step(-3);

    expect(simulation.getState()).toEqual(afterMutation);
  });

  it("keeps fixed nodes anchored while the rest of the graph continues to evolve", () => {
    const graph = makeTinyGraph();
    const simulation = createSimulation(graph, {
      fixedNodeIds: [0, 2],
      initialPositions: {
        0: { x: 0, y: 0 },
        1: { x: 100, y: 0 },
        2: { x: 200, y: 0 },
      },
    });

    const before = simulation.getState();
    simulation.step(25);
    const after = simulation.getState();

    const fixedIds = new Set([0, 2]);
    after.nodes
      .filter((node) => fixedIds.has(node.id))
      .forEach((node) => {
        const start = before.nodes.find((candidate) => candidate.id === node.id);
        expect(start).toBeDefined();
        expect(node.x).toBe(start?.x);
        expect(node.y).toBe(start?.y);
        expect(node.vx).toBe(0);
        expect(node.vy).toBe(0);
      });

    const movingNode = after.nodes.find((node) => node.id === 1);
    const movingStart = before.nodes.find((candidate) => candidate.id === 1);
    expect(movingNode).toBeDefined();
    expect(movingStart).toBeDefined();
    expect(movingNode?.x).not.toBe(movingStart?.x);
  });

  it("ignores edges that point at vertices outside the graph", () => {
    const graph = new Graph(
      [new Vertex(0), new Vertex(1)],
      [new Edge(0, 1), new Edge(1, 99)]
    );
    const simulation = createSimulation(graph, {
      initialPositions: {
        0: { x: 0, y: 0 },
        1: { x: 100, y: 0 },
      },
    });

    expect(() => simulation.step(10)).not.toThrow();
    const state = simulation.getState();
    expect(state.nodes).toHaveLength(2);
    expect(
      state.nodes.every((node) => Number.isFinite(node.x) && Number.isFinite(node.y))
    ).toBe(true);
  });
});