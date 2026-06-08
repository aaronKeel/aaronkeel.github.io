import { Graph } from "../../graph/Graph";
import { Vector } from "../../vector/Vector";
import {
  DEFAULT_CENTER,
  DEFAULT_EDGE_MIN_DISTANCE,
  DEFAULT_MAX_DELTA_MS,
  ZERO,
} from "./constants";
import { collectForces } from "./forces";
import { clampToBounds } from "./bounds";
import { getPosition } from "./state";
import {
  ForceComputation,
  ForceSimulationStepOptions,
  PreparedStepContext,
  StepRuntimeParams,
} from "./types";

export const resolveStepRuntimeParams = (
  options: ForceSimulationStepOptions,
): StepRuntimeParams => ({
  center: options.center ?? DEFAULT_CENTER,
  edgeMinDistance: options.edgeMinDistance ?? DEFAULT_EDGE_MIN_DISTANCE,
  maxDeltaMs: options.maxDeltaMs ?? DEFAULT_MAX_DELTA_MS,
});

export const capDeltaMs = (deltaMs: number, maxDeltaMs: number): number =>
  Math.min(maxDeltaMs, Math.max(0, deltaMs));

const applySpeedLimit = (velocity: Vector, maxSpeed: number): Vector => {
  const speed = velocity.length();
  if (speed <= maxSpeed) {
    return velocity;
  }

  return velocity.scale(maxSpeed / speed);
};

const integrateVelocity = (
  velocity: Vector,
  force: Vector,
  dt: number,
  damping: number,
  maxSpeed: number,
): Vector => {
  const dampedVelocity = velocity.add(force.scale(dt)).scale(damping);
  return applySpeedLimit(dampedVelocity, maxSpeed);
};

const integrateVertexState = (
  index: number,
  positions: Map<number, Vector>,
  velocities: Map<number, Vector>,
  forces: Map<number, Vector>,
  context: PreparedStepContext,
): void => {
  const { dt, damping, maxSpeed, boundsPadding, center } = context;
  const velocity = velocities.get(index) ?? ZERO;
  const force = forces.get(index) ?? ZERO;
  const nextVelocity = integrateVelocity(velocity, force, dt, damping, maxSpeed);
  const position = getPosition(positions, index, center);
  const nextPosition = position.add(nextVelocity.scale(dt));
  const [clampedPosition, clampedVelocity] = clampToBounds(
    nextPosition,
    nextVelocity,
    boundsPadding,
  );

  positions.set(index, clampedPosition);
  velocities.set(index, clampedVelocity);
};

export const prepareStepContext = (
  graph: Graph,
  deltaMs: number,
  options: ForceSimulationStepOptions,
): PreparedStepContext | null => {
  const { center, edgeMinDistance, maxDeltaMs } = resolveStepRuntimeParams(options);
  const cappedDeltaMs = capDeltaMs(deltaMs, maxDeltaMs);
  if (cappedDeltaMs <= 0 || graph.vertices.length === 0) {
    return null;
  }

  const dt = cappedDeltaMs / 1000;
  return {
    dt,
    center,
    edgeMinDistance,
    damping: Math.pow(options.damping, dt * 60),
    maxSpeed: options.maxSpeed,
    boundsPadding: options.boundsPadding,
  };
};

export const computeForces = (
  graph: Graph,
  positions: Map<number, Vector>,
  options: ForceSimulationStepOptions,
  context: PreparedStepContext,
): ForceComputation => ({
  graph,
  forces: collectForces(graph, positions, options, context),
  context,
});

export const integrateForces = (
  positions: Map<number, Vector>,
  velocities: Map<number, Vector>,
  computation: ForceComputation,
): void => {
  const { graph, forces, context } = computation;
  for (const vertex of graph.vertices) {
    integrateVertexState(
      vertex.index,
      positions,
      velocities,
      forces,
      context,
    );
  }
};

export const stepForceSimulation = (
  graph: Graph,
  positions: Map<number, Vector>,
  velocities: Map<number, Vector>,
  deltaMs: number,
  options: ForceSimulationStepOptions,
): void => {
  const context = prepareStepContext(graph, deltaMs, options);
  if (!context) {
    return;
  }

  const computation = computeForces(graph, positions, options, context);
  integrateForces(positions, velocities, computation);
};
