import { Vector } from "./vector";

export class Point {
  // position
  public position: Vector;
  // velocity
  public velocity: Vector;
  // acceleration
  public acceleration: Vector;

  constructor(position: Vector, velocity: Vector = new Vector(0, 0), acceleration: Vector = new Vector(0, 0)) {
    this.position = position;
    this.velocity = velocity;
    this.acceleration = acceleration;
  }
}