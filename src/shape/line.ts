import { InitEngineResult, engineById } from "../engineFn";
import { EngineCtx, OffEngineCtx, Point } from "../rewriteFn/type"
import { angleToRadian } from "../utils/math";
import { toCheckParams } from "../utils/toCheckParams";
import { getShape } from "./shape"
type ArrowType = 'normal' | 'point' | 'circle';
export const drawArrow = (ctx: EngineCtx | OffEngineCtx, type: ArrowType, angle: number) => {

}
export const drawStartArrow = (ctx: EngineCtx | OffEngineCtx, type: ArrowType) => {
  drawArrow(ctx, type, 0);
};
export const drawEndArrow = (ctx: EngineCtx | OffEngineCtx, type: ArrowType) => {
  drawArrow(ctx, type, 0);
};
export const drawLine = (ctx: EngineCtx | OffEngineCtx, points: Point[], options?: { lineWidth?: number }) => {
  ctx.save();
  ctx.beginPath();
  ctx.lineWidth = options?.lineWidth || 2;
  ctx.moveTo(points[0].x, points[0].y);
  for (const elem of points.slice(1)) {
    ctx.lineTo(elem.x, elem.y);
  }
  ctx.stroke();
  ctx.restore();
}
export const presetShape = (engineId: string) => {
  const engineInstance = engineById.get(engineId);
  const { addModel } = engineInstance;
  const presetControlPoint = () => {
    addModel({
      name: 'controlPoint',
      draw: (ctx: EngineCtx | OffEngineCtx, r, lineWidth) => {
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = lineWidth || 4;
        ctx.arc(100, 100, r, angleToRadian(0), angleToRadian(360));
        ctx.stroke();
        ctx.restore();
      }
    }, toCheckParams(10), toCheckParams(4));
  };
  const presetLine = () => {
    addModel(
      {
        name: 'line',
        draw: (ctx: EngineCtx | OffEngineCtx, points) => {
          drawLine(ctx, points);
          // drawStartArrow(ctx, lineOptions.startArrow);
          // drawEndArrow(ctx, lineOptions.endArrow);
        }
      },
      toCheckParams([{ x: 8, y: 8 }, { x: 12, y: 12 }]),
      toCheckParams({ lineWidth: 2 })
    )
  };
  const presetArrow = () => {
    addModel({
      name: 'arrow:normal',
      draw: (ctx: EngineCtx | OffEngineCtx, point: Point, rotateDeg: number = 0) => {
        ctx.save();
        if (rotateDeg) {
          ctx.translate(point.x, point.y);
          ctx.rotate(angleToRadian(rotateDeg));
        }
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(point.x - 8, point.y - 8);
        ctx.lineTo(point.x + 8, point.y);
        ctx.lineTo(point.x - 8, point.y + 8);
        ctx.closePath();
        ctx.fillStyle = '#333';
        ctx.fill();
        ctx.restore();
      }
    }, toCheckParams({ x: 100, y: 100 }), toCheckParams(0));
    addModel({
      name: 'arrow:circle',
      draw: (ctx: EngineCtx | OffEngineCtx, point: Point, radius: number) => {
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.arc(point.x, point.y, radius, angleToRadian(0), angleToRadian(360));
        ctx.fill();
        ctx.restore();
      }
    }, toCheckParams({ x: 100, y: 100 }), 4);
    addModel({
      name: 'arrow:point',
      draw: (ctx: EngineCtx | OffEngineCtx, point: Point, radius: number) => {
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.arc(point.x, point.y, radius, angleToRadian(0), angleToRadian(360));
        ctx.stroke();
        ctx.restore();
      }
    }, toCheckParams({ x: 100, y: 100 }), 4);
  };
  presetControlPoint();
  presetLine();
  presetArrow();
}
