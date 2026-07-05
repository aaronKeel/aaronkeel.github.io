import { Graph } from "../graph/Graph";
import { Vertex } from "../graph/Vertex";
import { AnimatedGrowthSimulation } from "../layout/animatedGrowth";
import { GraphRenderer, GraphStyleConfig } from "../render/GraphRenderer";
import { b20Colors, black } from "../utils/colors";

const initialGraph = new Graph([new Vertex(0)], []);

const simulation = new AnimatedGrowthSimulation(initialGraph, {
  growthIntervalMs: 300,
  maxVertices: 50,
});

const graphStyles: Partial<GraphStyleConfig> = {
  vertexColor: b20Colors[0],
  vertexSize: 10,
  vertexStroke: black,
  vertexStrokeWidth: 3,
  edgeColor: b20Colors[1],
  edgeWidth: 2,
};

const renderer = new GraphRenderer(
  40,
  "canvas",
  simulation.getGraph(),
  simulation.getLayout(),
  graphStyles,
);

let previousFrameMs: number | null = null;

const animate = (nowMs: number) => {
  if (previousFrameMs === null) {
    previousFrameMs = nowMs;
  }

  const deltaMs = nowMs - previousFrameMs;
  previousFrameMs = nowMs;

  simulation.step(deltaMs);
  const didGrow = simulation.maybeGrow(nowMs);
  if (didGrow) {
    renderer.setGraph(simulation.getGraph());
  }

  renderer.render();
  window.requestAnimationFrame(animate);
};

window.requestAnimationFrame(animate);
