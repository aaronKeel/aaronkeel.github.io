import { Agent } from "./agents";
import { WorldConfig } from "./types";

export class World {
  predators: Agent[];
  prey: Agent[];
  config: WorldConfig;

  constructor(config: WorldConfig) {
    this.predators = [];
    this.prey = [];
    this.config = config;
  }

  addAgent(agent: Agent): void {
    if (agent.state.type === "predator") {
      this.predators.push(agent);
    } else if (agent.state.type === "prey") {
      this.prey.push(agent);
    }
  }

  step(): void {
    this.prey.forEach(agent => {
      agent.act(this.config, this.predators, this.prey);
    });
    this.predators.forEach(agent => {
      agent.act(this.config, this.predators, this.prey);
    });
    this.predators = this.predators.filter(agent => agent.state.alive);
    this.prey = this.prey.filter(agent => agent.state.alive);
  }
}