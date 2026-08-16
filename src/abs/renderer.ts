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

  // Apply a fade effect by drawing a semi-transparent rectangle over the entire canvas
  fade(fadeAmount: number): void {
    this.context.fillStyle = `rgba(0, 0, 0, ${fadeAmount})`;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  render(predators: Agent[], prey: Agent[]): void {
    this.context.fillStyle = "blue";
    for (const agent of prey) {
      this.context.beginPath();
      this.context.rect(agent.state.position.x, agent.state.position.y, 5, 5);
      this.context.fill();
    }
    this.context.fillStyle = "red";
    for (const agent of predators) {
      this.context.beginPath();
      this.context.rect(agent.state.position.x, agent.state.position.y, 5, 5);
      this.context.fill();
    }
  }
}
