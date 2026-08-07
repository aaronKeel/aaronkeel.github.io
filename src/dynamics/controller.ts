import { Model } from "./model";
import { View } from "./view";

export class Controller {
  private model: Model;
  private view: View;

  constructor(model: Model, view: View) {
    this.model = model;
    this.view = view;
  }

  run(): void {
    this.model.simulate();
    this.view.setDatasets(this.model.datasets);
    this.view.render({ axes: true });
  }
}