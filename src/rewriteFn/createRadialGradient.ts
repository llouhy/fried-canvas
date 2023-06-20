import { EngineCtx, OffEngineCtx } from "./type";

export const createRadialGradient = (ctx: EngineCtx | OffEngineCtx) => {
  const oldCreateRadialGradient = ctx.createRadialGradient;
  (ctx as EngineCtx).$createRadialGradient = oldCreateRadialGradient;
  return (x0: number, y0: number, r0: number ,x1: number, y1: number, r1: number) => {
    const { drawOffset: { dx, dy } } = ctx;
    return oldCreateRadialGradient.call(ctx, x0 + dx, y0 + dy, r0, x1 + dx, y1 + dy, r1);
  };
}