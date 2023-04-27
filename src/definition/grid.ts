import { generateRandomStr } from "../config/common";
import { Boundary } from "../rewriteFn/type";
import { Shape } from "../shape/shape";

export class Grid {
  id: string;
  isLeaf: boolean;
  boundary: Boundary;
  children?: Grid[];
  shapes?: Shape[];

  constructor(boundary: Boundary, isLeaf: boolean) {
    this.id = generateRandomStr(6);
    this.boundary = boundary;
    this.isLeaf = isLeaf;
    !this.isLeaf && (this.children = []);
  }

  addShape = (shape: Shape) => {
    this.shapes.push(shape);
  };

  removeShape = (shape: Shape) => {
    this.shapes = this.shapes.filter(elem => elem !== shape);
  };

};
