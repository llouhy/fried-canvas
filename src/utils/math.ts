import { getTransBoundary } from "../config/common";
import { BorderOptions, Graphics } from "../graphOptions";
import { Graph } from "../init/useGraph";
import { Boundary, EngineCtx, OffEngineCtx, Point } from "../rewriteFn/type";
import { useCacheFunc } from "./cache";

export const getTextOxOy = (x: number, y: number, text: string, ctx: EngineCtx | OffEngineCtx): Point => {
  const align = ctx.textAlign;
  const baseLine = ctx.textBaseline;
  const width = ctx.measureText(text).width;
  const height = Math.round(parseInt(ctx.font) * 1.2);
  let ox, oy;
  if (align === 'center') {
    ox = Math.round(x - (width >> 1));
  } else if (align === 'end' || align === 'right') {
    ox = Math.round(x - width);
  } else if (align === 'left' || align === 'start') {
    ox = Math.round(x);
  }
  if (baseLine === 'top') {
    oy = Math.round(y - 0.1 * height);
  } else if (baseLine === 'hanging') {
    oy = Math.round(y);
  } else if (baseLine === 'bottom' || baseLine === 'alphabetic') {
    oy = Math.round(y - height);
  } else if (baseLine === 'middle') {
    oy = Math.round(y - (height >> 1));
  }
  return { x: ox, y: oy }
};

export const generateRandomStr = (e: number): string => {
  e = e || 32;
  const t = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
  const length = t.length;
  let str = '';
  for (let i = 0; i < e; i++) {
    str += t.charAt(Math.floor(Math.random() * length));
  }
  return str;
};

export const angleToRadian = useCacheFunc((angle: number): number => {
  return (Math.PI * angle) / 180;
});

export const radianToAngle = useCacheFunc((radian: number): number => {
  return (radian * 180) / Math.PI;
});

export const toHalfPixel = useCacheFunc((pixel: number): number => {
  return Math.round(pixel) + 0.5;
});

export const getDivisibleNum = (cur: number, divisor: number): number => {
  let result = cur;
  if (cur % divisor !== 0) {
    result++;
  }
  return result;
};

export const graphicsToBoundary = (graphics: Graphics, graph: Partial<Graph> = { translateX: 0, translateY: 0 }): Boundary => {
  const minX = Math.floor(graphics.ox);
  const minY = Math.floor(graphics.oy);
  const { translateX, translateY } = graph;
  return {
    minX: minX + translateX,
    minY: minY + translateY,
    maxX: Math.ceil(minX + graphics.width) + translateX,
    maxY: Math.ceil(minY + graphics.height) + translateY
  };
}

export const getGraphicsWithBorder = (graphics: Graphics, borderOptions: BorderOptions, rotateDeg?: number): Graphics => {
  const { paddingLeft, paddingRight, paddingTop, paddingBottom, borderWidth } = borderOptions;
  const lineWidth = borderWidth ?? 2;
  const boundOx = graphics.ox - (paddingLeft ?? 4);
  const boundOy = graphics.oy - (paddingTop ?? 4);
  const boundWidth = graphics.width + (paddingLeft ?? 4) + (paddingRight ?? 4);
  const boundHeight = graphics.height + (paddingTop ?? 4) + (paddingBottom ?? 4);
  const dlineWidth = Math.ceil(lineWidth / 2);
  return (rotateDeg && getRotateGraphics(rotateDeg, {
    minX: Math.ceil(boundOx - dlineWidth),
    maxX: Math.ceil(boundOx - dlineWidth) + Math.floor(boundWidth + 2 * dlineWidth),
    minY: Math.ceil(boundOy - dlineWidth),
    maxY: Math.ceil(boundOy - dlineWidth) + Math.floor(boundHeight + 2 * dlineWidth)
  })) || {
    ox: Math.ceil(boundOx - dlineWidth),
    oy: Math.ceil(boundOy - dlineWidth),
    width: Math.floor(boundWidth + 2 * dlineWidth),
    height: Math.floor(boundHeight + 2 * dlineWidth)
  }
}

export const getRotateGraphics = (rotateDeg: number, boundary: Boundary) => {
  // debugger
  const ctx = new OffscreenCanvas(1, 1).getContext('2d');
  // ctx.save();
  ctx.rotate(rotateDeg * Math.PI / 180);
  // const rad = angleToRadian(rotateDeg);
  const [reduceX, reduceY] = [(boundary.maxX + boundary.minX) >> 1, (boundary.maxY + boundary.minY) >> 1];
  const points = [
    { x: boundary.minX - reduceX, y: boundary.minY - reduceY },
    { x: boundary.minX - reduceX, y: boundary.maxY - reduceY },
    { x: boundary.maxX - reduceX, y: boundary.maxY - reduceY },
    { x: boundary.maxX - reduceX, y: boundary.minY - reduceY }
  ];
  // console.log(ctx.getTransform())
  const transBoundary = getTransBoundary(ctx.getTransform(), points);
  return {
    ox: transBoundary.minX + reduceX,
    oy: transBoundary.minY + reduceY,
    width: transBoundary.maxX - transBoundary.minX,
    height: transBoundary.maxY - transBoundary.minY
  };
}

export const getLineFormulaBy2Point = (x1: number, y1: number, x2: number, y2: number): (x: number) => number => {
  const k = (y2 - y1) / (x2 - x1);
  const b = y1 - k * x1;
  return (x: number): number => {
    return k * x + b;
  }
}

export const getLineFormulaByPointAndSlope = (k: number, x1: number, y1: number): (x: number) => number => {
  const b = y1 - k * x1;
  return (x: number): number => {
    return k * x + b;
  }
}

export const getDistanceBetween2Points = (x1: number, y1: number, x2: number, y2: number): number => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

export const getPointOnLineAtDistance = (x1: number, y1: number, k: number, d: number, positive = true) => {
  // 计算直线的角度
  const angle = Math.atan(k);

  // 计算新点的坐标
  const deltaX = d * Math.cos(angle);
  const deltaY = d * Math.sin(angle);

  // 根据positive值确定新点坐标的方向
  const newX = positive ? x1 + deltaX : x1 - deltaX;
  const newY = positive ? y1 + deltaY : y1 - deltaY;

  return { x: newX, y: newY };
}

export const getThePointClosedToAPoint = (points: Point[], point: Point): Point => {
  let result = Infinity;
  let curPoint;
  for (const elem of points) {
    const distance = getDistanceBetween2Points(point.x, point.y, elem.x, elem.y);
    distance <= result && (curPoint = elem) && (result = distance);
  }
  return curPoint;
};

export const getParallelLines = (x1: number, y1: number, x2: number, y2: number, distance: number) => {
  // 计算直线的斜率和截距
  let slope = (y2 - y1) / (x2 - x1);
  let intercept = y1 - slope * x1;

  // 计算新的截距
  let intercept1 = intercept + distance * Math.sqrt(1 + slope * slope);
  let intercept2 = intercept - distance * Math.sqrt(1 + slope * slope);

  // 构造直线方程
  let line1 = { k: +(slope.toFixed(2)), b: +(intercept1.toFixed(2)) };
  let line2 = { k: +(slope.toFixed(2)), b: +(intercept2.toFixed(2)) };

  // 返回两条平行直线的方程
  return [line1, line2];
}

export const getIntersectionPoint = (k1: number, b1: number, k2: number, b2: number) => {
  // 计算交点的x值
  let x = Math.round((b2 - b1) / (k1 - k2));

  // 计算交点的y值
  let y = Math.round(k1 * x + b1);

  // 返回交点的坐标
  return { x, y };
}

export const isPointInTriangle = (x: number, y: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) => {
  // 计算三个子三角形的面积
  const area1 = 0.5 * Math.abs((x2 - x1) * (y - y1) - (x - x1) * (y2 - y1));
  const area2 = 0.5 * Math.abs((x3 - x2) * (y - y2) - (x - x2) * (y3 - y2));
  const area3 = 0.5 * Math.abs((x1 - x3) * (y - y3) - (x - x3) * (y1 - y3));

  // 计算三角形的面积
  const triangleArea = Math.ceil(0.5 * Math.abs((y2 - y1) * (x3 - x1) - (y3 - y1) * (x2 - x1)));

  // 如果三个子三角形的面积之和等于三角形的面积，则该点在三角形内部
  return triangleArea >= Math.floor(area1 + area2 + area3);
}

export function getAngle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): number {
  // 计算两个向量的 x 和 y 分量
  const v1x = x2 - x1;
  const v1y = y2 - y1;
  const v2x = x4 - x3;
  const v2y = y4 - y3;

  // 计算两个向量的长度
  const v1Length = Math.sqrt(v1x * v1x + v1y * v1y);
  const v2Length = Math.sqrt(v2x * v2x + v2y * v2y);

  // 计算两个向量的点积
  const dotProduct = v1x * v2x + v1y * v2y;

  // 计算两个向量的夹角（弧度）
  const angle = Math.acos(dotProduct / (v1Length * v2Length));

  // 将弧度转换为角度
  return angle * 180 / Math.PI;
}

export function getSlope(p1: Point, p2: Point): number {
  return (p1.y - p2.y) / (p1.x - p2.x);
}

export function getLineAngle(p1: Point, p2: Point): number {
  return radianToAngle(Math.atan((p2.y - p1.y) / (p2.x - p1.x))) + 180;
}

export function mergeBoundary(bounds: Boundary[]) {
  bounds.reduce((pre, cur) => {
    return {
      minX: Math.min(pre.minX, cur.minX),
      minY: Math.min(pre.minY, cur.minY),
      maxX: Math.max(pre.maxX, cur.maxX),
      maxY: Math.max(pre.maxY, cur.maxY)
    }
  }, { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });
}