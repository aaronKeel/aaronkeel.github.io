import { Edge } from "../graph/Edge";
import { Graph } from "../graph/Graph";
import { Vertex } from "../graph/Vertex";
import { GraphLayout } from "./GraphLayout";
import { Vector } from "../vector/Vector";
import {
  clampToBounds,
  pickWeighted,
  stepForceSimulation,
} from "./forceSimulation/forceSimulation";

export interface AnimatedGrowthOptions {
  growthIntervalMs?: number;
  maxVertices?: number;
  repulsion?: number;
  attraction?: number;
  damping?: number;
  maxSpeed?: number;
  preferredEdgeLength?: number;
  boundsPadding?: number;
  spawnDistance?: number;
  centering?: number;
}

const DEFAULT_OPTIONS: Required<AnimatedGrowthOptions> = {
  growthIntervalMs: 1000,
  maxVertices: 120,
  repulsion: 0.0004,
  attraction: 3.2,
  damping: 0.88,
  maxSpeed: 0.45,
  preferredEdgeLength: 0.09,
  boundsPadding: 0.05,
  spawnDistance: 0.03,
  centering: 0.2,
};

export class AnimatedGrowthSimulation {
  private graph: Graph;
  private readonly positions = new Map<number, Vector>();
  private readonly velocities = new Map<number, Vector>();
  private readonly options: Required<AnimatedGrowthOptions>;
  private lastGrowthAtMs: number | null = null;

  constructor(initialGraph: Graph, options: AnimatedGrowthOptions = {}) {
    this.graph = initialGraph;
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.initializeState(initialGraph);
  }

  public getGraph(): Graph {
    return this.graph;
  }

  public getLayout(): GraphLayout {
    return {
      vertexPosition: (vertexIndex: number) =>
        this.positions.get(vertexIndex) ?? new Vector(0.5, 0.5),
    };
  }

  public step(deltaMs: number): void {
    stepForceSimulation(this.graph, this.positions, this.velocities, deltaMs, {
      centering: this.options.centering,
      repulsion: this.options.repulsion,
      attraction: this.options.attraction,
      damping: this.options.damping,
      maxSpeed: this.options.maxSpeed,
      preferredEdgeLength: this.options.preferredEdgeLength,
      boundsPadding: this.options.boundsPadding,
      repulsionMinDistance: 0.005,
      edgeMinDistance: 0.001,
      maxDeltaMs: 50,
    });
  }

  public maybeGrow(nowMs: number): boolean {
    if (this.graph.vertices.length >= this.options.maxVertices) {
      return false;
    }

    if (this.lastGrowthAtMs === null) {
      this.lastGrowthAtMs = nowMs;
      return false;
    }

    if (nowMs - this.lastGrowthAtMs < this.options.growthIntervalMs) {
      return false;
    }

    if (this.graph.vertices.length === 0) {
      const firstVertex = new Vertex(0);
      this.graph = new Graph([firstVertex], []);
      this.positions.set(0, new Vector(0.5, 0.5));
      this.velocities.set(0, new Vector(0, 0));
      this.lastGrowthAtMs = nowMs;
      return true;
    }

    const parent = this.chooseFrontierParent();
    const parentPosition = this.positions.get(parent.index) ?? new Vector(0.5, 0.5);
    const newIndex = this.graph.vertices.length;
    const angle = Math.random() * Math.PI * 2;
    const radius = this.options.spawnDistance * (0.7 + Math.random() * 0.6);

    const spawnPosition = new Vector(
      parentPosition.x + Math.cos(angle) * radius,
      parentPosition.y + Math.sin(angle) * radius,
    );

    const [boundedSpawn] = clampToBounds(
      spawnPosition,
      new Vector(0, 0),
      this.options.boundsPadding,
    );

    this.positions.set(newIndex, boundedSpawn);
    this.velocities.set(newIndex, new Vector(0, 0));

    this.graph = new Graph(
      [...this.graph.vertices, new Vertex(newIndex)],
      [...this.graph.edges, new Edge(parent.index, newIndex)],
    );

    this.lastGrowthAtMs = nowMs;
    return true;
  }

  private chooseFrontierParent(): Vertex {
    if (this.graph.vertices.length === 1) {
      return this.graph.vertices[0];
    }

    const degrees = new Map<number, number>();
    for (const edge of this.graph.edges) {
      degrees.set(edge.startIndex, (degrees.get(edge.startIndex) ?? 0) + 1);
      degrees.set(edge.endIndex, (degrees.get(edge.endIndex) ?? 0) + 1);
    }

    const scoredVertices = this.graph.vertices.map((vertex) => {
      const position = this.positions.get(vertex.index) ?? new Vector(0.5, 0.5);
      const dx = position.x - 0.5;
      const dy = position.y - 0.5;
      const radialDistance = Math.sqrt(dx * dx + dy * dy);
      const degree = degrees.get(vertex.index) ?? 0;
      const weight = Math.pow(radialDistance + 0.02, 2.25) / (1 + degree);

      return { vertex, weight };
    });

    return (
      pickWeighted(scoredVertices, (entry) => entry.weight)?.vertex ??
      this.graph.vertices[this.graph.vertices.length - 1]
    );
  }

  private initializeState(graph: Graph): void {
    const count = graph.vertices.length;
    if (count === 0) {
      return;
    }

    if (count === 1) {
      const index = graph.vertices[0].index;
      this.positions.set(index, new Vector(0.5, 0.5));
      this.velocities.set(index, new Vector(0, 0));
      return;
    }

    for (let i = 0; i < count; i++) {
      const index = graph.vertices[i].index;
      const angle = (2 * Math.PI * i) / count;
      this.positions.set(
        index,
        new Vector(0.5 + 0.15 * Math.cos(angle), 0.5 + 0.15 * Math.sin(angle)),
      );
      this.velocities.set(index, new Vector(0, 0));
    }
  }

}
