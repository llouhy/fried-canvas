import { ModelOptions } from "../../graphOptions";
import { ModelDrawFuncArgs } from "../../init/useModel";
import { EngineCtx, OffEngineCtx, Point } from "../../rewriteFn/type";
import { angleToRadian } from "../../utils/math";
import { toCheckParams } from "../../utils/toCheckParams";

export const arrowNormalConfig: [ModelOptions, ...ModelDrawFuncArgs[]] = [
  {
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
  },
  toCheckParams({ x: 100, y: 100 }),
  toCheckParams(0)
];