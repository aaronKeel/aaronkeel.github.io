import { Vector2d } from "../vector";
import { AgentState, WorldConfig } from "./types";

export class Agent {
  state: AgentState;

  constructor(state: AgentState) {
    this.state = state;
  }

  act(worldConfig: WorldConfig): void {
    const currentPosition = this.state.position;
    const center = new Vector2d(worldConfig.width / 2, worldConfig.height / 2);
    const distFromCenter = currentPosition.distanceTo(center);
    const dV = Vector2d.randomUnitVector(); // Random direction
    const change = center.subtract(currentPosition).scale(0.3 / (distFromCenter + 1)); // Attraction towards center
    const newDirection = dV.add(change).normalize(); // New direction considering attraction
    const newPosition = currentPosition.add(newDirection.scale(20)); // Move by a small step
    this.state.position = newPosition;
  }
}