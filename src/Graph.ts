// Graph.ts

export type Point = [number, number];
export type Edge = [number, number];

export class Graph {
  public readonly points: Point[];
  public readonly tiledPoints: Point[];
  public readonly edges: Edge[];

  public constructor(pointCount: number, distanceThreshold: number) {
    this.points = Graph.createRandomPoints(pointCount);
    this.tiledPoints = Graph.createTiledPoints(this.points);
    this.edges = Graph.createEdges(this.tiledPoints, distanceThreshold);
  }

  private static createRandomPoints(pointCount: number): Point[] {
    const points: Point[] = [];
    for (let i = 0; i < pointCount; i++) {
      points.push([Math.random(), Math.random()]);
    }
    return points;
  }

  private static createTiledPoints(points: Point[]): Point[] {
    const tiledPoints: Point[] = [];
    for (const [x, y] of points) {
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          tiledPoints.push([x + dx, y + dy]);
        }
      }
    }
    return tiledPoints;
  }

  private static createEdges(
    points: Point[],
    distanceThreshold: number,
  ): Edge[] {
    const edges: Edge[] = [];
    const thresholdSquared = distanceThreshold * distanceThreshold;

    for (let i = 0; i < points.length; i++) {
      const [x1, y1] = points[i];
      for (let j = i + 1; j < points.length; j++) {
        const [x2, y2] = points[j];
        const dx = x2 - x1;
        const dy = y2 - y1;
        const distanceSquared = dx * dx + dy * dy;

        if (distanceSquared < thresholdSquared) {
          edges.push([i, j]);
        }
      }
    }

    return edges;
  }
}