import { ModelOptions } from "../../graphOptions";
import { ModelDrawFuncArgs } from "../../init/useModel";
import { EngineCtx, OffEngineCtx, Point } from "../../rewriteFn/type";
import { observe } from "../../utils/observe";

export const drawLine = (ctx: EngineCtx | OffEngineCtx, points: Point[], options?: { lineWidth?: number }) => {
  if (!points.length) return;
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

export const lineModelConfig: [ModelOptions, ...ModelDrawFuncArgs[]] = [
  {
    name: 'line',
    draw: (ctx: EngineCtx | OffEngineCtx, points: Point[], options) => {
      drawLine(ctx, points, options);
    }
  },
  observe([{ x: 8, y: 8 }, { x: 32, y: 42 }]),
  observe({ lineWidth: 2 })
];