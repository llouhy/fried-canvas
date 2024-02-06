import { ModelOptions } from "../../graphOptions";
import { ModelDrawFuncArgs } from "../../init/useModel";
import { EngineCtx, OffEngineCtx } from "../../rewriteFn/type";
import { angleToRadian } from "../../utils/math";
import { toCheckParams } from "../../utils/toCheckParams";

export const drawControlPoint = (ctx: EngineCtx | OffEngineCtx, r: number, lineWidth: number) => {
  ctx.save();
  ctx.beginPath();
  ctx.lineWidth = lineWidth || 4;
  ctx.arc(100, 100, r || 4, angleToRadian(0), angleToRadian(360));
  ctx.stroke();
  ctx.restore();
};

export const controlPointModelConfig: [ModelOptions, ...ModelDrawFuncArgs[]] = [{
  name: 'controlPoint',
  draw: drawControlPoint,
}, toCheckParams(10), toCheckParams(4)];
