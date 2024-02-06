import { ModelOptions } from "../../graphOptions";
import { ModelDrawFuncArgs } from "../../init/useModel";
import { EngineCtx, OffEngineCtx, Point } from "../../rewriteFn/type";
import { angleToRadian } from "../../utils/math";
import { toCheckParams } from "../../utils/toCheckParams";

export const arrowCircleConfig: [ModelOptions, ...ModelDrawFuncArgs[]] = [
  {
    name: 'arrow:circle',
    draw: (ctx: EngineCtx | OffEngineCtx, point: Point, radius: number) => {
      ctx.save();
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.arc(point.x, point.y, radius, angleToRadian(0), angleToRadian(360));
      ctx.fill();
      ctx.restore();
    }
  }, toCheckParams({ x: 100, y: 100 }), 4
];