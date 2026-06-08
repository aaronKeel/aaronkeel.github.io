import { Edge } from "../graph/Edge";
import { Graph } from "../graph/Graph";
import { Vertex } from "../graph/Vertex";
import { GraphLayout } from "./GraphLayout";
import { Vector } from "../vector/Vector";
import { pickWeighted, stepForceSimulation } from "./forceSimulation/forceSimulation";

export interface ApollonianGrowthOptions {
  growthIntervalMs?: number;
  maxVertices?: number;
  repulsion?: number;
  attraction?: number;
  damping?: number;
  maxSpeed?: number;
  preferredEdgeLength?: number;
  boundsPadding?: number;
  centering?: number;
}

type TriangleFace = readonly [number, number, number];

const DEFAULT_OPTIONS: Required<ApollonianGrowthOptions> = {
  growthIntervalMs: 1000,
  maxVertices: 120,
  repulsion: 0.00055,
  attraction: 3.15,
  damping: 0.885,
  maxSpeed: 0.42,
  preferredEdgeLength: 0.11,
  boundsPadding: 0.06,
  centering: 0.08,
};

export class ApollonianGrowthSimulation {
  private graph: Graph;
  private readonly positions = new Map<number, Vector>();
  private readonly velocities = new Map<number, Vector>();
  private readonly options: Required<ApollonianGrowthOptions>;
  private faces: TriangleFace[];
  private lastGrowthAtMs: number | null = null;

  constructor(initialGraph: Graph, options: ApollonianGrowthOptions = {}) {
    this.graph = initialGraph;
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.faces = this.initializeFaces(initialGraph);
    this.initializePositions(initialGraph);
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
      repulsionMinDistance: 0.004,
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

    const selectedFace = this.chooseFaceByArea();
    if (!selectedFace) {
      return false;
    }

    const newIndex = this.graph.vertices.length;
    const newVertex = new Vertex(newIndex);
    const newPosition = this.samplePointInsideFace(selectedFace);

    this.positions.set(newIndex, newPosition);
    this.velocities.set(newIndex, new Vector(0, 0));

    this.graph = new Graph(
      [...this.graph.vertices, newVertex],
      [
        ...this.graph.edges,
        new Edge(selectedFace[0], newIndex),
        new Edge(selectedFace[1], newIndex),
        new Edge(selectedFace[2], newIndex),
      ],
    );

    this.faces = this.replaceFaceWithSubdivision(selectedFace, newIndex);
    this.lastGrowthAtMs = nowMs;
    return true;
  }

  private initializeFaces(graph: Graph): TriangleFace[] {
    if (graph.vertices.length < 3) {
      return [];
    }

    return [[graph.vertices[0].index, graph.vertices[1].index, graph.vertices[2].index]];
  }

  private initializePositions(graph: Graph): void {
    const count = graph.vertices.length;
    if (count < 3) {
      return;
    }

    const center = new Vector(0.5, 0.5);
    const radius = 0.22;
    for (let i = 0; i < 3; i++) {
      const angle = (-Math.PI / 2) + (2 * Math.PI * i) / 3;
      const position = new Vector(
        center.x + radius * Math.cos(angle),
        center.y + radius * Math.sin(angle),
      );
      this.positions.set(graph.vertices[i].index, position);
      this.velocities.set(graph.vertices[i].index, new Vector(0, 0));
    }
  }

  private chooseFaceByArea(): TriangleFace | null {
    if (this.faces.length === 0) {
      return null;
    }

    return (
      pickWeighted(this.faces, (face) => Math.max(0.000001, this.faceArea(face))) ??
      null
    );
  }

  private faceArea(face: TriangleFace): number {
    const a = this.positions.get(face[0]);
    const b = this.positions.get(face[1]);
    const c = this.positions.get(face[2]);
    if (!a || !b || !c) {
      return 0;
    }

    return Math.abs(
      (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y)) / 2,
    );
  }

  private samplePointInsideFace(face: TriangleFace): Vector {
    const a = this.positions.get(face[0]) ?? new Vector(0.4, 0.4);
    const b = this.positions.get(face[1]) ?? new Vector(0.6, 0.4);
    const c = this.positions.get(face[2]) ?? new Vector(0.5, 0.65);

    const r1 = Math.random();
    const r2 = Math.random();
    const sqrtR1 = Math.sqrt(r1);
    const w0 = 1 - sqrtR1;
    const w1 = sqrtR1 * (1 - r2);
    const w2 = sqrtR1 * r2;

    return new Vector(
      a.x * w0 + b.x * w1 + c.x * w2,
      a.y * w0 + b.y * w1 + c.y * w2,
    );
  }

  private replaceFaceWithSubdivision(face: TriangleFace, newIndex: number): TriangleFace[] {
    const remainingFaces = this.faces.filter(
      (candidate) => !this.sameFace(candidate, face),
    );

    return [
      ...remainingFaces,
      [face[0], face[1], newIndex],
      [face[1], face[2], newIndex],
      [face[2], face[0], newIndex],
    ];
  }

  private sameFace(first: TriangleFace, second: TriangleFace): boolean {
    return (
      first[0] === second[0] &&
      first[1] === second[1] &&
      first[2] === second[2]
    );
  }

}
