import { Vector } from "../../vector/Vector";
import { ZERO } from "./constants";

export const addForce = (
  forces: Map<number, Vector>,
  vertexIndex: number,
  delta: Vector,
): void => {
  forces.set(vertexIndex, (forces.get(vertexIndex) ?? ZERO).add(delta));
};

export const getPosition = (
  positions: Map<number, Vector>,
  index: number,
  center: Vector,
): Vector => positions.get(index) ?? center;
