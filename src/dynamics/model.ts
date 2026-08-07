import { Point } from "./point";
import { Vector } from "./vector";

export class Model {
  public datasets: Point[][];

  constructor() {
    this.datasets = [];
  }

  public simulate(): void {
    for (let i = 0; i < 3; i++) {
      const dataset: Point[] = [];
      const position = new Vector(0, 0);
      const velocity = new Vector(Math.random() * 0.5, Math.random() * 0.5);
      const acceleration = new Vector(0, Math.random() * -0.01);
      dataset.push(new Point(position, velocity, acceleration));
      for (let t = 0; t < 100; t++) {
        const lastPoint = dataset[dataset.length - 1];
        const newPosition = lastPoint.position.add(lastPoint.velocity);
        const newVelocity = lastPoint.velocity.add(lastPoint.acceleration);
        dataset.push(new Point(newPosition, newVelocity, lastPoint.acceleration));
      }
      this.datasets.push(dataset);
    }
  }
}