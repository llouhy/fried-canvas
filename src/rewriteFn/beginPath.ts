import { EngineCtx, OffEngineCtx } from "./type";

export const beginPath = (ctx: EngineCtx | OffEngineCtx) => {
  const oldBeginPath = ctx.beginPath;
  (ctx as EngineCtx).$beginPath = oldBeginPath;
  return () => {
    oldBeginPath.call(ctx);
    const { drawCoordinates, pathCoordinates } = ctx;
    if (!drawCoordinates) return;
    pathCoordinates.splice(0, pathCoordinates.length);
  }
}