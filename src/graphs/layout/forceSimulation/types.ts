import { Graph } from "../../graph/Graph";
import { Vector } from "../../vector/Vector";

export interface ForceSimulationStepOptions {
  centering: number;
  repulsion: number;
  attraction: number;
  damping: number;
  maxSpeed: number;
  preferredEdgeLength: number;
  boundsPadding: number;
  repulsionMinDistance: number;
  edgeMinDistance?: number;
  maxDeltaMs?: number;
  center?: Vector;
}

export interface StepRuntimeParams {
  center: Vector;
  edgeMinDistance: number;
  maxDeltaMs: number;
}

export interface PreparedStepContext {
  dt: number;
  center: Vector;
  edgeMinDistance: number;
  damping: number;
  maxSpeed: number;
  boundsPadding: number;
}

export interface ForceComputation {
  graph: Graph;
  forces: Map<number, Vector>;
  context: PreparedStepContext;
}
