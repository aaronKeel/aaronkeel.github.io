import { Vector2d } from "../vector";

export interface AgentState {
  position: Vector2d;
  energy: number;
  alive: boolean;
  type: "prey" | "predator";
}

export interface WorldConfig {
  width: number;
  height: number;
}
