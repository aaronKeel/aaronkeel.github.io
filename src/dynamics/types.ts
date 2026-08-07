import { Point } from "./point";

export interface Dataset {
  points: Point[];
  color: string;
  line?: boolean;
}