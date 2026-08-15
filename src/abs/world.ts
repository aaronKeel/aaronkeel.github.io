import { Agent } from "./agents";
import { WorldConfig } from "./types";

export class World {
  agents: Agent[];
  config: WorldConfig;

  constructor(config: WorldConfig) {
    this.agents = [];
    this.config = config;
  }

  addAgent(agent: Agent): void {
    this.agents.push(agent);
  }

  step(): void {
    this.agents.forEach(agent => {
      agent.act(this.config, this.agents);
    });
    this.agents = this.agents.filter(agent => agent.state.alive); // Remove dead agents
  }
}