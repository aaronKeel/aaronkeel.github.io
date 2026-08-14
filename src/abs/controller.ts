import type { World } from "./world";
import type { Renderer } from "./renderer";

export class Controller {
  private world: World;
  private renderer: Renderer;

  constructor(world: World, renderer: Renderer) {
    this.world = world;
    this.renderer = renderer;

    this.renderer.render(this.world.agents);
  }

  update(): void {
    this.world.step();
    this.renderer.clear();
    this.renderer.render(this.world.agents);
  }
}
