import { Point } from "./point";
import { Vector } from "./vector";
import { Dataset } from "./types";
interface ModelState {
  p_A: number;
  p_B: number;
  p: number;
  r: number;
}

const DEFAULT_TIME = 300;

export class Model {
  public datasets: Dataset[];
  public state: ModelState;
  public pointsA: Point[];
  public pointsB: Point[];
  public pointsP: Point[];

  constructor() {
    this.datasets = [];
    this.state = { p_A: 100, p_B: 99, p: 99, r: 0.5 };
    this.pointsA = [new Point(new Vector(0, this.state.p_A))];
    this.pointsB = [new Point(new Vector(0, this.state.p_B))];
    this.pointsP = [new Point(new Vector(0, this.state.p))];
    this.datasets.push({ points: this.pointsA, color: "#d7261e" }); // bauhaus-red
    this.datasets.push({ points: this.pointsB, color: "#0b4fd1" }); // bauhaus-blue
    this.datasets.push({ points: this.pointsP, color: "rgba(245, 196, 0, 0.85)", line: true }); // bauhaus-yellow
  }

  public simulate(): void {
    for (let t = 1; t < DEFAULT_TIME; t++) {
      const next_spread = Math.random();
      const action = Math.random() > this.state.r ? "A" : "B";
      if (action === "A") {
        this.state.r = Math.max(0, this.state.r + 0.01);
        this.state.p_A = this.state.p_B;
        this.state.p_B -= next_spread;
        this.state.p = this.state.p_A;
      } else {
        this.state.r = Math.min(1, this.state.r - 0.01);
        this.state.p_B = this.state.p_A;
        this.state.p_A += next_spread;
        this.state.p = this.state.p_B;
      }
      this.pointsA.push(new Point(new Vector(t, this.state.p_A)));
      this.pointsB.push(new Point(new Vector(t, this.state.p_B)));
      this.pointsP.push(new Point(new Vector(t, this.state.p)));
    }
  }
}
