import { EngineCtx, OffEngineCtx } from "./type";

export const createLinearGradient = (ctx: EngineCtx | OffEngineCtx) => {
  const oldCreateLinearGradient = ctx.createLinearGradient;
  (ctx as EngineCtx).$createLinearGradient = oldCreateLinearGradient;
  return (x1: number, y1: number, x2: number, y2: number) => {
    const { drawOffset: { dx, dy } } = ctx;
    return oldCreateLinearGradient.call(ctx, x1 + dx, y1 + dy, x2 + dx, y2 + dy);
  };
}