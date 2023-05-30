import { Graphics } from "../graphOptions";
import { Boundary } from "../rewriteFn/type";

export const getTypeStr = (value: any) => {
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
};

export const setCanvasSize = (canvas: HTMLCanvasElement, width: number, height: number) => {
  canvas.setAttribute('width', width + '');
  canvas.setAttribute('height', height + '');
};

export const getPureObject = (obj: { [key: string]: any }) => {
  return Object.assign(Object.create(null), obj);
};

export const getDivisibleNum = (cur: number, divisor: number): number => {
  let result = cur;
  if (cur % divisor !== 0) {
    result++;
  }
  return result;
};

export const graphicsToBoundary = (graphics: Graphics): Boundary => {
  return {
    minX: Math.floor(graphics.ox),
    minY: Math.floor(graphics.oy),
    maxX: Math.ceil(Math.floor(graphics.ox) + graphics.width),
    maxY: Math.ceil(Math.floor(graphics.oy) + graphics.height)
  };
}
