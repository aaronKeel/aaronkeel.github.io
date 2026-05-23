import { describe, expect, it } from "vitest";
import { Edge } from "@/graph/Edge";
import { Graph } from "@/graph/Graph";
import { Vertex } from "@/graph/Vertex";
import { createSimulation } from "@/render/Simulation";

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
});