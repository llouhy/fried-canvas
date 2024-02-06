import { ModelOptions } from "../../graphOptions";
import { ModelDrawFuncArgs } from "../../init/useModel";
import { EngineCtx, OffEngineCtx, Point } from "../../rewriteFn/type";
import { angleToRadian } from "../../utils/math";
import { toCheckParams } from "../../utils/toCheckParams";

export const drawArrowCircle = (ctx: EngineCtx | OffEngineCtx, radius: number) => {
  const point = { x: 0, y: 0 };
  ctx.save();
  ctx.beginPath();
  ctx.lineWidth = 2;
  ctx.arc(point.x, point.y, radius, angleToRadian(0), angleToRadian(360));
  ctx.fill();
  ctx.restore();
};

export const arrowCircleConfig: [ModelOptions, ...ModelDrawFuncArgs[]] = [
  {
    name: 'arrow:circle',
    draw: drawArrowCircle,
  }, toCheckParams(4)
];