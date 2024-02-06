import { ModelOptions } from "../../graphOptions";
import { ModelDrawFuncArgs } from "../../init/useModel";
import { EngineCtx, OffEngineCtx } from "../../rewriteFn/type";
import { angleToRadian } from "../../utils/math";
import { toCheckParams } from "../../utils/toCheckParams";

export const controlPointModelConfig: [ModelOptions, ...ModelDrawFuncArgs[]] = [{
  name: 'controlPoint',
  draw: (ctx: EngineCtx | OffEngineCtx, r: number, lineWidth: number) => {
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = lineWidth || 4;
    ctx.arc(100, 100, r, angleToRadian(0), angleToRadian(360));
    ctx.stroke();
    ctx.restore();
  }
}, toCheckParams(10), toCheckParams(4)];
