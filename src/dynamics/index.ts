import { Model } from "./model";
import { View } from "./view";
import {Controller} from "./controller";

// Example usage
const model = new Model();
const view = new View("canvas");
const controller = new Controller(model, view);

controller.run();
