import { Graph } from "../../graph/Graph";
import { Vector } from "../../vector/Vector";
import { getPosition, addForce } from "./state";
import { PreparedStepContext, ForceSimulationStepOptions } from "./types";

const createCenterPull = (
  position: Vector,
  center: Vector,
  centering: number,
): Vector =>
  new Vector(
    (center.x - position.x) * centering,
    (center.y - position.y) * centering,
  );

const computeRepulsionForce = (
  firstPosition: Vector,
  secondPosition: Vector,
  repulsion: number,
  repulsionMinDistance: number,
): Vector => {
  const delta = new Vector(
    firstPosition.x - secondPosition.x,
    firstPosition.y - secondPosition.y,
  );
  const distance = Math.max(repulsionMinDistance, delta.length());
  const direction = delta.scale(1 / distance);
  const magnitude = repulsion / (distance * distance);

  return direction.scale(magnitude);
};

const computeEdgeAttractionForce = (
  startPosition: Vector,
  endPosition: Vector,
  preferredEdgeLength: number,
  attraction: number,
  edgeMinDistance: number,
): Vector => {
  const delta = new Vector(
    endPosition.x - startPosition.x,
    endPosition.y - startPosition.y,
  );
  const distance = Math.max(edgeMinDistance, delta.length());
  const direction = delta.scale(1 / distance);
  const stretch = distance - preferredEdgeLength;

  return direction.scale(stretch * attraction);
};

const initializeCenterForces = (
  graph: Graph,
  positions: Map<number, Vector>,
  center: Vector,
  centering: number,
): Map<number, Vector> => {
  const forces = new Map<number, Vector>();

  for (const vertex of graph.vertices) {
    const position = getPosition(positions, vertex.index, center);
    forces.set(vertex.index, createCenterPull(position, center, centering));
  }

  return forces;
};

const accumulateRepulsionForces = (
  graph: Graph,
  positions: Map<number, Vector>,
  forces: Map<number, Vector>,
  center: Vector,
  repulsion: number,
  repulsionMinDistance: number,
): void => {
  const vertices = graph.vertices;
  for (let i = 0; i < vertices.length; i++) {
    const firstIndex = vertices[i].index;
    const firstPosition = getPosition(positions, firstIndex, center);

    for (let j = i + 1; j < vertices.length; j++) {
      const secondIndex = vertices[j].index;
      const secondPosition = getPosition(positions, secondIndex, center);
      const repulsionForce = computeRepulsionForce(
        firstPosition,
        secondPosition,
        repulsion,
        repulsionMinDistance,
      );

      addForce(forces, firstIndex, repulsionForce);
      addForce(forces, secondIndex, repulsionForce.scale(-1));
    }
  }
};

const accumulateEdgeForces = (
  graph: Graph,
  positions: Map<number, Vector>,
  forces: Map<number, Vector>,
  center: Vector,
  preferredEdgeLength: number,
  attraction: number,
  edgeMinDistance: number,
): void => {
  for (const edge of graph.edges) {
    const startPosition = getPosition(positions, edge.startIndex, center);
    const endPosition = getPosition(positions, edge.endIndex, center);
    const attractionForce = computeEdgeAttractionForce(
      startPosition,
      endPosition,
      preferredEdgeLength,
      attraction,
      edgeMinDistance,
    );

    addForce(forces, edge.startIndex, attractionForce);
    addForce(forces, edge.endIndex, attractionForce.scale(-1));
  }
};

export const collectForces = (
  graph: Graph,
  positions: Map<number, Vector>,
  options: ForceSimulationStepOptions,
  context: PreparedStepContext,
): Map<number, Vector> => {
  const { center, edgeMinDistance } = context;
  const forces = initializeCenterForces(
    graph,
    positions,
    center,
    options.centering,
  );

  accumulateRepulsionForces(
    graph,
    positions,
    forces,
    center,
    options.repulsion,
    options.repulsionMinDistance,
  );
  accumulateEdgeForces(
    graph,
    positions,
    forces,
    center,
    options.preferredEdgeLength,
    options.attraction,
    edgeMinDistance,
  );

  return forces;
};
