import { Vector2d } from "../vector";
import { AgentState, WorldConfig } from "./types";

const idGenerator = (() => {
  let currentId = 0;
  return {
    nextId: () => currentId++,
  };
})();

export class Agent {
  state: AgentState;
  id: number;

  constructor(state: AgentState) {
    this.state = state;
    this.id = idGenerator.nextId();
  }

  computeNewPosition() {
    const currentPosition = this.state.position;
    const dV = Vector2d.randomUnitVector();
    return currentPosition.add(dV.scale(8));
  }

  // some bowl shit logic for the agent to act in the world, including moving, eating, reproducing, and dying
  act(worldConfig: WorldConfig, agents: Agent[]): void {
    /**
     * Move logic
     */
    let newPosition = this.computeNewPosition(); // Move by a small step

    while (
      newPosition.x < 0 ||
      newPosition.x > worldConfig.width ||
      newPosition.y < 0 ||
      newPosition.y > worldConfig.height
    ) {
      newPosition = this.computeNewPosition(); // Recompute if out of bounds
    }
    this.state.position = newPosition;

    /**
     * Preditor logic
     */
    if (this.state.type === "predator") {
      // Preditor logic: Check for nearby prey and "eat" them
      const preyAgents = agents.filter(
        (agent) => agent.state.type === "prey" && agent.state.alive,
      );
      for (const prey of preyAgents) {
        const distance = this.state.position.distanceTo(prey.state.position);
        if (distance < 10) {
          prey.state.alive = false; // "Eat" the prey
          this.state.energy += 20; // Gain energy from eating
          break; // Only eat one prey at a time
        }
      }
      // Preditor loses energy over time
      this.state.energy -= 1;
      if (this.state.energy <= 0) {
        this.state.alive = false; // Predator dies if energy runs out
      }
      // Age the predator
      this.state.age += 1;
      // Predators die of old age after 1000 steps
      if (this.state.age > 1000) {
        this.state.alive = false;
      }
      // Predators reproduce if they have enough energy
      if (this.state.energy > 100) {
        this.state.energy -= 50; // Energy cost for reproduction
        const offspringState: AgentState = {
          position: new Vector2d(
            this.state.position.x + Math.random() * 10 - 5,
            this.state.position.y + Math.random() * 10 - 5,
          ),
          energy: 100,
          alive: true,
          type: "predator",
          age: 0,
        };
        const offspring = new Agent(offspringState);
        agents.push(offspring);
      }
    }

    if (this.state.type === "prey") {
      // Age the prey
      this.state.age += 1;
      // Prey die of old age after 500 steps
      if (this.state.age > 100) {
        this.state.alive = false;
      }
      // Prey reproduce over time
      if (this.state.age % 10 === 0 && Math.random() < 0.5) {
        const offspringState: AgentState = {
          position: new Vector2d(
            this.state.position.x + Math.random() * 10 - 5,
            this.state.position.y + Math.random() * 10 - 5,
          ),
          energy: 100,
          alive: true,
          type: "prey",
          age: 0,
        };
        const offspring = new Agent(offspringState);
        agents.push(offspring);
      }
    }
  }
}
