import { ModelOptions } from "../../graphOptions";
import { ModelDrawFuncArgs } from "../../init/useModel";
import { EngineCtx, OffEngineCtx, Point } from "../../rewriteFn/type";
import { toCheckParams } from "../../utils/toCheckParams";

const drawLine = (ctx: EngineCtx | OffEngineCtx, points: Point[], options?: { lineWidth?: number }) => {
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
    draw: (ctx: EngineCtx | OffEngineCtx, points: Point[]) => {
      drawLine(ctx, points);
    }
  },
  toCheckParams([{ x: 8, y: 8 }, { x: 32, y: 42 }]),
  toCheckParams({ lineWidth: 4 })
];