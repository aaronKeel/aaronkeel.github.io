import type { Agent } from "./agents";

export class Renderer {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  constructor(canvasId: string) {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) {
      throw new Error(`Canvas with id ${canvasId} not found`);
    }
    this.canvas = canvas;
    const context = this.canvas.getContext("2d");
    if (!context) {
      throw new Error("Failed to get 2D context from canvas");
    }
    this.context = context;
  }

  clear(): void {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  render(agents: Agent[]): void {
    for (const agent of agents) {
      this.context.fillStyle = agent.state.type === "prey" ? "blue" : "red";
      this.context.beginPath();
      this.context.rect(agent.state.position.x, agent.state.position.y, 5, 5);
      this.context.fill();
    }
  }
}
