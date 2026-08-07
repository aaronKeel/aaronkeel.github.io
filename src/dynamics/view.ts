import { Vector } from "./vector";
import { Point } from "./point";
import { Dataset } from "./types";

const AXES_COLOR = "#f2eee5"; // bauhaus-paper

export class View {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  public padding: number;
  public datasets: Dataset[];

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;

    this.padding = 60; // Padding in pixels
    this.datasets = [];
  }

  private dataMinX(): number {
    let minX = Infinity;
    for (const dataset of this.datasets) {
      for (const point of dataset.points) {
        if (point.position.x < minX) {
          minX = point.position.x;
        }
      }
    }
    return minX;
  }

  private dataMaxX(): number {
    let maxX = -Infinity;
    for (const dataset of this.datasets) {
      for (const point of dataset.points) {
        if (point.position.x > maxX) {
          maxX = point.position.x;
        }
      }
    }
    return maxX;
  }

  private dataMinY(): number {
    let minY = Infinity;
    for (const dataset of this.datasets) {
      for (const point of dataset.points) {
        if (point.position.y < minY) {
          minY = point.position.y;
        }
      }
    }
    return minY;
  }

  private dataMaxY(): number {
    let maxY = -Infinity;
    for (const dataset of this.datasets) {
      for (const point of dataset.points) {
        if (point.position.y > maxY) {
          maxY = point.position.y;
        }
      }
    }
    return maxY;
  }

  private mapToCanvas(point: Point): Vector {
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;
    const xDomain = [this.dataMinX(), this.dataMaxX()];
    const yDomain = [this.dataMinY(), this.dataMaxY()];

    const normalizedX =
      (point.position.x - xDomain[0]) / (xDomain[1] - xDomain[0]);
    const normalizedY =
      (point.position.y - yDomain[0]) / (yDomain[1] - yDomain[0]);

    const canvasX =
      normalizedX * (canvasWidth - 2 * this.padding) + this.padding;
    const canvasY =
      (1 - normalizedY) * (canvasHeight - 2 * this.padding) + this.padding; // Invert Y-axis

    return new Vector(canvasX, canvasY);
  }

  public setDatasets(datasets: Dataset[]): void {
    this.datasets = datasets;
  }

  public axes(): void {
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;
    const plotWidth = canvasWidth - 2 * this.padding;
    const plotHeight = canvasHeight - 2 * this.padding;
    const xDomain = [this.dataMinX(), this.dataMaxX()];
    const yDomain = [this.dataMinY(), this.dataMaxY()];

    const xRange = xDomain[1] - xDomain[0] || 1;
    const yRange = yDomain[1] - yDomain[0] || 1;

    // Place X axis along the bottom of the chart area and Y axis on the left
    const xAxisY = canvasHeight - this.padding;
    const yAxisX = this.padding;

    // Draw X-axis
    this.context.beginPath();
    this.context.moveTo(this.padding, xAxisY);
    this.context.lineTo(canvasWidth - this.padding, xAxisY);
    this.context.strokeStyle = AXES_COLOR;
    this.context.lineWidth = 2; // bold Bauhaus-style axis line
    this.context.stroke();
    this.context.closePath();

    // Draw Y-axis
    this.context.beginPath();
    this.context.moveTo(yAxisX, canvasHeight - this.padding);
    this.context.lineTo(yAxisX, this.padding);
    this.context.strokeStyle = AXES_COLOR;
    this.context.lineWidth = 2;
    this.context.stroke();
    this.context.closePath();
    this.context.lineWidth = 1;

    // grid lines
    const targetGridLines = 10;
    const xStepValue = xRange / targetGridLines;
    const yStepValue = yRange / targetGridLines;
    const xEpsilon = xStepValue / 1_000_000;
    const yEpsilon = yStepValue / 1_000_000;

    const xStart = Math.ceil(xDomain[0] / xStepValue);
    const xEnd = Math.floor(xDomain[1] / xStepValue);
    const yStart = Math.ceil(yDomain[0] / yStepValue);
    const yEnd = Math.floor(yDomain[1] / yStepValue);

    for (let i = xStart; i <= xEnd; i++) {
      const xValue = i * xStepValue;
      const canvasX =
        ((xValue - xDomain[0]) / xRange) * plotWidth + this.padding;

      // Vertical grid lines (skip the Y-axis line at the left edge)
      if (Math.abs(xValue - xDomain[0]) > xEpsilon) {
        this.context.beginPath();
        this.context.moveTo(canvasX, this.padding);
        this.context.lineTo(canvasX, canvasHeight - this.padding);
        this.context.strokeStyle = "rgba(242, 238, 229, 0.15)"; // bauhaus-paper, translucent
        this.context.stroke();
        this.context.closePath();
      }

      // X-axis labels and ticks
      this.context.fillStyle = AXES_COLOR;
      this.context.fillText(xValue.toFixed(2), canvasX - 10, xAxisY + 15);
      this.context.beginPath();
      this.context.moveTo(canvasX, xAxisY);
      this.context.lineTo(canvasX, xAxisY - 5);
      this.context.strokeStyle = AXES_COLOR;
      this.context.stroke();
      this.context.closePath();
    }

    for (let i = yStart; i <= yEnd; i++) {
      const yValue = i * yStepValue;
      const canvasY =
        (1 - (yValue - yDomain[0]) / yRange) * plotHeight + this.padding;

      // Horizontal grid lines (skip the X-axis line at the bottom edge)
      if (Math.abs(yValue - yDomain[0]) > yEpsilon) {
        this.context.beginPath();
        this.context.moveTo(this.padding, canvasY);
        this.context.lineTo(canvasWidth - this.padding, canvasY);
        this.context.strokeStyle = "rgba(242, 238, 229, 0.15)"; // bauhaus-paper, translucent
        this.context.stroke();
        this.context.closePath();
      }

      // Y-axis labels and ticks
      this.context.fillStyle = AXES_COLOR;
      this.context.fillText(yValue.toFixed(2), yAxisX - 40, canvasY + 5);
      this.context.beginPath();
      this.context.moveTo(yAxisX, canvasY);
      this.context.lineTo(yAxisX + 5, canvasY);
      this.context.strokeStyle = AXES_COLOR;
      this.context.stroke();
      this.context.closePath();
    }
  }

  public render({ axes = false }: { axes?: boolean } = {}): void {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (axes) {
      this.axes();
    }

    for (const dataset of this.datasets) {
      // Draw connecting line if dataset specifies it
      if (dataset.line && dataset.points.length > 1) {
        this.context.beginPath();
        const start = this.mapToCanvas(dataset.points[0]);
        this.context.moveTo(start.x, start.y);
        for (let i = 1; i < dataset.points.length; i++) {
          const pt = this.mapToCanvas(dataset.points[i]);
          this.context.lineTo(pt.x, pt.y);
        }
        this.context.strokeStyle = dataset.color;
        this.context.lineWidth = 2;
        this.context.stroke();
        this.context.closePath();
      }
      for (const point of dataset.points) {
        const canvasPoint = this.mapToCanvas(point);
        this.context.beginPath();
        this.context.rect(canvasPoint.x - 2, canvasPoint.y - 2, 4, 4); // Draw a small square
        this.context.fillStyle = dataset.color;
        this.context.fill();
        this.context.closePath();
      }
    }
  }
}
