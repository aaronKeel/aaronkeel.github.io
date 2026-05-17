import { Edge } from "../graph/Edge";
import { Graph } from "../graph/Graph";
import { Vertex } from "../graph/Vertex";
import { GraphLayout } from "../layout/GraphLayout";
import { Vector } from "../vector/Vector";
import { lightGray } from "../utils/colors";

/**
 * GraphStyleConfig
 * This interface defines the visual styling options for the GraphRenderer.
 * It allows users to customize the appearance of vertices and edges by
 * providing either static values or functions that return values based on the
 * vertex or edge properties.
 */
export interface GraphStyleConfig {
  vertexColor?: string | ((vertex: Vertex) => string);
  vertexStroke?: string | ((vertex: Vertex) => string);
  vertexStrokeWidth?: number | ((vertex: Vertex) => number);
  vertexSize?: number | ((vertex: Vertex) => number);
  edgeColor?: string | ((edge: Edge) => string);
  edgeWidth?: number | ((edge: Edge) => number);
}

const DEFAULT_LAYOUT: GraphLayout = {
  vertexPosition: () => new Vector(0, 0),
};

const DEFAULT_STYLE_CONFIG: GraphStyleConfig = {
  vertexColor: lightGray,
  vertexStroke: "#333",
  vertexStrokeWidth: 1,
  vertexSize: 5,
  edgeColor: lightGray,
  edgeWidth: 1,
};

/**
 * GraphRenderer
 * This class is responsible for rendering a graph onto an HTML canvas element. It provides methods to draw vertices and edges.
 * The GraphRenderer is a view component that takes a Graph data structure and renders it visually. It handles the conversion of graph coordinates to canvas coordinates, manages the drawing of vertices and edges.
 */
export class GraphRenderer {
  /**
   * Padding around the canvas to ensure vertices and edges are not drawn too close to the edge of the canvas. This can be adjusted as needed to provide better visual spacing.
   */
  private padding: number;

  /**
   * The HTML canvas element where the graph will be rendered. This is initialized when the GraphRenderer is created and is used in all rendering methods to draw vertices and edges on the canvas.
   */
  private canvasElement: HTMLCanvasElement | null = null;

  /**
   * The 2D rendering context of the canvas element. This is where all drawing operations will be performed. It is initialized when the GraphRenderer is created and is used in all rendering methods to draw vertices and edges on the canvas.
   */
  private ctx: CanvasRenderingContext2D | null = null;

  /**
   * The graph data structure that contains the vertices and edges to be rendered. This is passed in when the GraphRenderer is created and is used in the rendering methods to access the vertices and edges for drawing. The GraphRenderer does not modify the graph data; it only reads from it to render the visual representation of the graph on the canvas.
   */
  private graph: Graph;

  private layout: GraphLayout;

  private styleConfig: GraphStyleConfig;

  constructor(
    padding: number = 10,
    canvasId: string = "canvas",
    graph: Graph,
    layout: GraphLayout = DEFAULT_LAYOUT,
    styleConfig: GraphStyleConfig = {},
  ) {
    // Initialize any necessary properties or state here
    this.padding = padding;
    this.graph = graph;
    this.layout = layout;
    this.styleConfig = { ...DEFAULT_STYLE_CONFIG, ...styleConfig };

    this.initCanvasContext(canvasId);

    window.addEventListener("resize", () => {
      this.resizeCanvasToElement();
      this.render();
    });
  }

  private initCanvasContext(canvasId: string) {
    const canvas = document.getElementById(
      canvasId,
    ) as HTMLCanvasElement | null;
    if (!canvas) {
      console.error(`Canvas element with id "${canvasId}" not found.`);
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error(
        `Failed to get 2D context from canvas with id "${canvasId}".`,
      );
      return;
    }
    this.ctx = ctx;
    this.canvasElement = canvas;
  }

  /**
   * Resizes the canvas to match the size of its containing element. This method should be called whenever the window is resized or when the containing element's size changes to ensure that the graph is rendered correctly and maintains its aspect ratio.
   */
  private resizeCanvasToElement() {
    if (!this.canvasElement || !this.ctx) return;
    const dpr = window.devicePixelRatio ?? 1;
    const { width, height } = this.canvasElement.getBoundingClientRect();
    const cssWidth = Math.max(1, Math.floor(width));
    const cssHeight = Math.max(1, Math.floor(height));
    const displayWidth = Math.floor(cssWidth * dpr);
    const displayHeight = Math.floor(cssHeight * dpr);

    if (
      this.canvasElement.width !== displayWidth ||
      this.canvasElement.height !== displayHeight
    ) {
      this.canvasElement.width = displayWidth;
      this.canvasElement.height = displayHeight;
    }

    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    return { cssWidth, cssHeight };
  }

  private toCanvasPoint(
    x: number,
    y: number,
    cssWidth: number,
    cssHeight: number,
  ): [number, number] {
    const drawableWidth = Math.max(0, cssWidth - this.padding * 2);
    const drawableHeight = Math.max(0, cssHeight - this.padding * 2);
    return [
      this.padding + x * drawableWidth,
      this.padding + y * drawableHeight,
    ];
  }

  public render() {
    if (!this.ctx) {
      console.error("Canvas context is not initialized.");
      return;
    }
    const canvas = this.ctx.canvas;
    const { cssWidth, cssHeight } = this.resizeCanvasToElement() ?? {
      cssWidth: canvas.clientWidth,
      cssHeight: canvas.clientHeight,
    };
    this.drawEdges(cssWidth, cssHeight);
    this.drawVertices(cssWidth, cssHeight);
  }

  private drawVertices(cssWidth: number, cssHeight: number) {
    if (!this.ctx) return;
    for (const vertex of this.graph.vertices) {
      const position = this.layout.vertexPosition(vertex.index);
      const [x, y] = [position.x, position.y];
      const [px, py] = this.toCanvasPoint(x, y, cssWidth, cssHeight);
      this.ctx.beginPath();
      const vertexSize =
        typeof this.styleConfig.vertexSize === "function"
          ? this.styleConfig.vertexSize(vertex)
          : (this.styleConfig.vertexSize ?? 5);
      this.ctx.arc(px, py, vertexSize, 0, 2 * Math.PI);
      this.ctx.fillStyle =
        typeof this.styleConfig.vertexColor === "function"
          ? this.styleConfig.vertexColor(vertex)
          : (this.styleConfig.vertexColor ?? lightGray);
      this.ctx.fill();
      const vertexStroke =
        typeof this.styleConfig.vertexStroke === "function"
          ? this.styleConfig.vertexStroke(vertex)
          : (this.styleConfig.vertexStroke ?? "#333");
      const vertexStrokeWidth =
        typeof this.styleConfig.vertexStrokeWidth === "function"
          ? this.styleConfig.vertexStrokeWidth(vertex)
          : (this.styleConfig.vertexStrokeWidth ?? 1);
      if (vertexStrokeWidth > 0) {
        this.ctx.lineWidth = vertexStrokeWidth;
        this.ctx.strokeStyle = vertexStroke;
        this.ctx.stroke();
      }
    }
  }

  private drawEdges(cssWidth: number, cssHeight: number) {
    if (!this.ctx) return;
    this.ctx.lineWidth = 1;
    for (const edge of this.graph.edges) {
      const startVertex = this.graph.vertices[edge.startIndex];
      const endVertex = this.graph.vertices[edge.endIndex];
      const startPosition = this.layout.vertexPosition(startVertex.index);
      const endPosition = this.layout.vertexPosition(endVertex.index);
      const [x1, y1] = [startPosition.x, startPosition.y];
      const [x2, y2] = [endPosition.x, endPosition.y];
      const [px1, py1] = this.toCanvasPoint(x1, y1, cssWidth, cssHeight);
      const [px2, py2] = this.toCanvasPoint(x2, y2, cssWidth, cssHeight);
      this.ctx.beginPath();
      this.ctx.moveTo(px1, py1);
      this.ctx.lineTo(px2, py2);
      this.ctx.strokeStyle =
        typeof this.styleConfig.edgeColor === "function"
          ? this.styleConfig.edgeColor(edge)
          : (this.styleConfig.edgeColor ?? lightGray);
      this.ctx.lineWidth =
        typeof this.styleConfig.edgeWidth === "function"
          ? this.styleConfig.edgeWidth(edge)
          : (this.styleConfig.edgeWidth ?? 1);
      this.ctx.stroke();
    }
  }
}
