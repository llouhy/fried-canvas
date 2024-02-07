import { ModelOptions } from "../../graphOptions";
import { ModelDrawFuncArgs } from "../../init/useModel";
import { EngineCtx, OffEngineCtx, Point } from "../../rewriteFn/type";
import { isNumber } from "../../utils/is";
import { getLineAngle } from "../../utils/math";
import { observe } from "../../utils/observe";
import { drawArrowCircle } from "../arrow/arrowCircle";
import { drawArrowNormal } from "../arrow/arrowNormal";
import { drawArrowPoint } from "../arrow/arrowPoint";
import { drawControlPoint } from "../controlPoint";
import { drawLine } from "../line";

type ArrowType = 'arrow:circle' | 'arrow:normal' | 'arrow:point';
type ArrowOption = {
  type: ArrowType;
  rotateDeg?: number;
  radius?: number;
}
type ControlPoint = {
  radius?: number;
  lineWidth?: number;
};
type LinePoint = { arrow?: ArrowOption; controlPoint?: ControlPoint } & Point;

const arrowDrawFuncByType = {
  'arrow:circle': drawArrowCircle,
  'arrow:normal': drawArrowNormal,
  'arrow:point': drawArrowPoint
};

export const customLineModelConfig: [ModelOptions, ...ModelDrawFuncArgs[]] = [
  {
    name: 'line:custom',
    draw: (ctx: EngineCtx | OffEngineCtx, points: LinePoint[]) => {
      let current: LinePoint, nextPoint: LinePoint, prePoint: LinePoint;
      drawLine(ctx, points);
      for (let i = 0; i < points.length; i++) {
        current = points[i], prePoint = points[i - 1], nextPoint = points[i + 1];
        const { arrow, controlPoint } = current;
        if (arrow) {
          const arrowDrawFunc = arrowDrawFuncByType[arrow.type];
          ctx.save();
          if (arrow.type === 'arrow:normal') {
            const rotateDeg = arrow.rotateDeg ?? (prePoint ? getLineAngle(current, prePoint) : 0);
            ctx.translate(current.x, current.y);
            arrowDrawFunc(ctx, rotateDeg);
          } else {
            arrowDrawFunc(ctx, arrow.radius);
          }
          ctx.restore();
        }
        if (controlPoint) {
          drawControlPoint(ctx, controlPoint.radius, controlPoint.lineWidth);
        }
      }
    }
  }, observe([{ x: 0, y: 0 }, { x: 20, y: 20 }])];