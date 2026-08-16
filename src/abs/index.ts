import { Controller } from "./controller";
import { World } from "./world";
import { Agent } from "./agents";
import { AgentState } from "./types";
import { Renderer } from "./renderer";
import { Vector2d } from "../vector";
import * as d3 from "d3";

const world = new World({ width: 800, height: 800 });

const numberOfAgents = 40;
for (let i = 0; i < numberOfAgents; i++) {
  const agentState: AgentState = {
    position: new Vector2d(
      d3.randomUniform(100, world.config.width - 100)(),
      d3.randomUniform(100, world.config.height - 100)(),
    ),
    energy: 90,
    alive: true,
    type: Math.random() < 0.5 ? "prey" : "predator",
    age: 0,
  };
  const agent = new Agent(agentState);
  world.addAgent(agent);
}

const renderer = new Renderer("canvas");
const controller = new Controller(world, renderer);

const dt = 100;
let lastUpdateTime = 0;

// animation loop
function animate(rafTime: number) {
  if (rafTime && rafTime > lastUpdateTime + dt) {
    controller.update();
    lastUpdateTime = rafTime;
  }
  requestAnimationFrame(animate);
}

animate(0);
