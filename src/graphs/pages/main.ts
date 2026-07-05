import { greedyVertexColoring } from "../algorithms/analysis";
import { GraphRenderer, GraphStyleConfig } from "../render/GraphRenderer";
import { Graph } from "../graph/Graph";
import { Vertex } from "../graph/Vertex";
import { Edge } from "../graph/Edge";
import { GraphLayout } from "../layout/GraphLayout";
import { b20Colors, black } from "../utils/colors";
import { Vector } from "../vector/Vector";

const VERTEX_COUNT = 50;
const DISTANCE_THRESHOLD = 0.15;
const MIN_VERTEX_SPACING = 0.05;
const MAX_POSITION_ATTEMPTS = 200;

const createLandingDemoGraph = (
  vertexCount: number,
  distanceThreshold: number,
): { graph: Graph; positions: Map<number, Vector> } => {
  const vertices: Vertex[] = [];
  const positions = new Map<number, Vector>();

  for (let i = 0; i < vertexCount; i++) {
    vertices.push(new Vertex(i));

    let chosenPosition: Vector | null = null;
    for (let attempt = 0; attempt < MAX_POSITION_ATTEMPTS; attempt++) {
      const candidate = new Vector(Math.random(), Math.random());
      const isFarEnoughFromOthers = Array.from(positions.values()).every(
        (existing) => existing.distanceTo(candidate) >= MIN_VERTEX_SPACING,
      );
      if (isFarEnoughFromOthers) {
        chosenPosition = candidate;
        break;
      }
    }

    // Fallback to avoid infinite retries when space becomes crowded.
    positions.set(
      i,
      chosenPosition ?? new Vector(Math.random(), Math.random()),
    );
  }

  const edges: Edge[] = [];
  for (let i = 0; i < vertexCount; i++) {
    for (let j = i + 1; j < vertexCount; j++) {
      const first = positions.get(i);
      const second = positions.get(j);
      if (first && second && first.distanceTo(second) <= distanceThreshold) {
        edges.push(new Edge(i, j));
      }
    }
  }

  return { graph: new Graph(vertices, edges), positions };
};

const { graph, positions } = createLandingDemoGraph(
  VERTEX_COUNT,
  DISTANCE_THRESHOLD,
);
const layout: GraphLayout = {
  vertexPosition: (vertexIndex: number) =>
    positions.get(vertexIndex) ?? new Vector(0.5, 0.5),
};
const vertexColors = greedyVertexColoring(graph, b20Colors);

const graphStyles: Partial<GraphStyleConfig> = {
  vertexColor: (vertex) => vertexColors.get(vertex.index) ?? b20Colors[0],
  vertexSize: 10,
  vertexStroke: black,
  vertexStrokeWidth: 3,
  edgeColor: b20Colors[1],
  edgeWidth: 2,
};

const renderer = new GraphRenderer(40, "canvas", graph, layout, graphStyles);
renderer.render();
