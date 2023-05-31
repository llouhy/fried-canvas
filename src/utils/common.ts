import { BorderOptions, Graphics } from "../graphOptions";
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
  const minX = Math.floor(graphics.ox);
  const minY = Math.floor(graphics.oy);
  return {
    minX,
    minY,
    maxX: Math.ceil(minX + graphics.width),
    maxY: Math.ceil(minY + graphics.height)
  };
}

export const getGraphicsWithBorder = (graphics: Graphics, borderOptions: BorderOptions): Graphics => {
  const { paddingLeft, paddingRight, paddingTop, paddingBottom, borderWidth } = borderOptions;
  const lineWidth = borderWidth ?? 2;
  const boundOx = graphics.ox - (paddingLeft ?? 4);
  const boundOy = graphics.oy - (paddingTop ?? 4);
  const boundWidth = graphics.width + (paddingLeft ?? 4) + (paddingRight ?? 4);
  const boundHeight = graphics.height + (paddingTop ?? 4) + (paddingBottom ?? 4);
  const dlineWidth = Math.ceil(lineWidth / 2);
  return {
    ox: Math.ceil(boundOx - dlineWidth),
    oy: Math.ceil(boundOy - dlineWidth),
    width: Math.floor(boundWidth + 2 * dlineWidth),
    height: Math.floor(boundHeight + 2 * dlineWidth)
  };
}