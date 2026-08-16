export class Vector2d {
  x: number;
  y: number;

  static randomUnitVector(): Vector2d {
    const angle = Math.random() * 2 * Math.PI;
    return new Vector2d(Math.cos(angle), Math.sin(angle));
  }

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  add(other: Vector2d): Vector2d {
    return new Vector2d(this.x + other.x, this.y + other.y);
  }

  subtract(other: Vector2d): Vector2d {
    return new Vector2d(this.x - other.x, this.y - other.y);
  }

  scale(scalar: number): Vector2d {
    return new Vector2d(this.x * scalar, this.y * scalar);
  }

  dot(other: Vector2d): number {
    return this.x * other.x + this.y * other.y;
  }

  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  squaredMagnitude(): number {
    return this.x * this.x + this.y * this.y;
  }

  normalize(): Vector2d {
    const mag = this.magnitude();
    if (mag === 0) {
      throw new Error("Cannot normalize a zero vector");
    }
    return new Vector2d(this.x / mag, this.y / mag);
  }

  projectOnto(other: Vector2d): Vector2d {
    const otherMagSquared = other.squaredMagnitude();
    if (otherMagSquared === 0) {
      throw new Error("Cannot project onto a zero vector");
    }
    const scalarProjection = this.dot(other) / otherMagSquared;
    return other.scale(scalarProjection);
  }

  distanceTo(other: Vector2d): number {
    return this.subtract(other).magnitude();
  }

  inRadius(other: Vector2d, radius: number): boolean {
    return this.subtract(other).squaredMagnitude() <= radius * radius;
  }
}
