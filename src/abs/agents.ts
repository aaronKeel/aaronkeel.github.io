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
  act(worldConfig: WorldConfig, predatorsList: Agent[], preyList: Agent[]): void {
    /**
     * Move logic
     */
    this.move(worldConfig);

    /**
     * Preditor logic
     */
    if (this.state.type === "predator") {
      // Preditor logic: Check for nearby prey and "eat" them
      this.predatorAct(preyList, predatorsList);
    }

    if (this.state.type === "prey") {
      // Age the prey
      this.preyAct(preyList);
    }
  }

  private preyAct(preyList: Agent[]) {
    this.state.age += Math.floor(Math.log(preyList.length + 1) / Math.log(1000)); // Age increases logarithmically with the number of prey

    // Prey die of old age after 50 steps
    if (this.state.age > 50) {
      this.state.alive = false;
    }
    // Prey reproduce over time
    if (Math.random() < 0.05) {
      const offspringState: AgentState = {
        position: new Vector2d(
          this.state.position.x + Math.random() * 10 - 5,
          this.state.position.y + Math.random() * 10 - 5
        ),
        energy: 100,
        alive: true,
        type: "prey",
        age: 0,
      };
      const offspring = new Agent(offspringState);
      preyList.push(offspring);
    }
  }

  private predatorAct(preyList: Agent[], predatorsList: Agent[]) {
    for (const prey of preyList) {
      if (prey.state.alive && this.state.position.inRadius(prey.state.position, 10)) {
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
    if (this.state.age > 500) {
      this.state.alive = false;
    }
    // Predators reproduce if they have enough energy
    if (this.state.energy > 100) {
      this.state.energy -= 50; // Energy cost for reproduction
      const offspringState: AgentState = {
        position: new Vector2d(
          this.state.position.x + Math.random() * 10 - 5,
          this.state.position.y + Math.random() * 10 - 5
        ),
        energy: 100,
        alive: true,
        type: "predator",
        age: 0,
      };
      const offspring = new Agent(offspringState);
      predatorsList.push(offspring);
    }
  }

  private move(worldConfig: WorldConfig) {
    const newPosition = this.computeNewPosition(); // Move by a small step

    if (newPosition.x < 0) {
      newPosition.x = -newPosition.x; // Reflect off the left wall
    }
    if (newPosition.x > worldConfig.width) {
      newPosition.x = 2 * worldConfig.width - newPosition.x; // Reflect off the right wall
    }
    if (newPosition.y < 0) {
      newPosition.y = -newPosition.y; // Reflect off the top wall
    }
    if (newPosition.y > worldConfig.height) {
      newPosition.y = 2 * worldConfig.height - newPosition.y; // Reflect off the bottom wall
    }
    this.state.position = newPosition;
  }
}
