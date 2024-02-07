import { ModelOptions } from "../../graphOptions";
import { ModelDrawFuncArgs } from "../../init/useModel";
import { EngineCtx, OffEngineCtx, Point } from "../../rewriteFn/type";
import { angleToRadian } from "../../utils/math";
import { observe } from "../../utils/observe";

export const drawArrowNormal = (ctx: EngineCtx | OffEngineCtx, rotateDeg: number = 0) => {
  const point = { x: 0, y: 0 };
  ctx.save();
  ctx.beginPath();
  if (rotateDeg) {
    ctx.translate(point.x, point.y);
    ctx.rotate(angleToRadian(rotateDeg));
  }
  ctx.moveTo(point.x, point.y);
  ctx.lineTo(point.x - 8, point.y - 8);
  ctx.lineTo(point.x + 8, point.y);
  ctx.lineTo(point.x - 8, point.y + 8);
  ctx.closePath();
  ctx.fillStyle = '#333';
  ctx.fill();
  ctx.restore();
};

export const arrowNormalConfig: [ModelOptions, ...ModelDrawFuncArgs[]] = [
  {
    name: 'arrow:normal',
    draw: drawArrowNormal
  },
  observe(0)
];