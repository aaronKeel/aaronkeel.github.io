import { Vector } from "../../vector/Vector";
import { BOUNDS_BOUNCE_FACTOR } from "./constants";

const clampAxis = (
  value: number,
  velocity: number,
  min: number,
  max: number,
): [number, number] => {
  if (value < min) {
    return [min, velocity * BOUNDS_BOUNCE_FACTOR];
  }

  if (value > max) {
    return [max, velocity * BOUNDS_BOUNCE_FACTOR];
  }

  return [value, velocity];
};

export const clampToBounds = (
  position: Vector,
  velocity: Vector,
  boundsPadding: number,
): [Vector, Vector] => {
  const min = boundsPadding;
  const max = 1 - boundsPadding;

  const [x, vx] = clampAxis(position.x, velocity.x, min, max);
  const [y, vy] = clampAxis(position.y, velocity.y, min, max);

  return [new Vector(x, y), new Vector(vx, vy)];
};
