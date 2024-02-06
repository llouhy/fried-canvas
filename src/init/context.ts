import type { ContextAttributes } from '../engine';
import useRewriteCtxFunction from '../rewriteFn';
import { bezierCurveTo } from '../rewriteFn/bezierCurveTo';
import { quadraticCurveTo } from '../rewriteFn/quadraticCurveTo';
import type { EngineCtx, OffEngineCtx } from '../rewriteFn/type';
import { useCoordinateCache } from '../shape/coordinate';
import { getDefaultContextAttribute } from '../config/common';
import { drawImage } from '../rewriteFn/drawImage';

type ReloadCtxResult<T> = T extends CanvasRenderingContext2D ? EngineCtx : OffEngineCtx;

export const reloadCtxFunction = <T>(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
): EngineCtx => {
  const { arc, arcTo, rect, fillRect, strokeRect, moveTo, lineTo, stroke, createLinearGradient, strokeText, fillText, beginPath } = useRewriteCtxFunction();
  ctx.arc = arc(ctx);
  ctx.arcTo = arcTo(ctx);
  ctx.rect = rect(ctx);
  ctx.fillRect = fillRect(ctx);
  ctx.strokeRect = strokeRect(ctx);
  ctx.moveTo = moveTo(ctx);
  ctx.lineTo = lineTo(ctx);
  ctx.quadraticCurveTo = quadraticCurveTo(ctx);
  ctx.bezierCurveTo = bezierCurveTo(ctx);
  ctx.stroke = stroke(ctx);
  ctx.createLinearGradient = createLinearGradient(ctx);
  ctx.strokeText = strokeText(ctx);
  ctx.fillText = fillText(ctx);
  ctx.beginPath = beginPath(ctx);
  ctx.drawImage = drawImage(ctx);
  return ctx as EngineCtx;
};

export const initContext = (
  contextType: '2d',
  canvasIns: HTMLCanvasElement,
  contextAttributes?: ContextAttributes
): CanvasRenderingContext2D => {
  // if (!canvasIns || !(canvasIns instanceof HTMLCanvasElement)) {
  //   throw new _Error('$o.canvas not a HTMLCanvasElement, call the function reInitCanvas');
  // }
  return canvasIns.getContext(contextType, {
    ...getDefaultContextAttribute(),
    ...contextAttributes
  }) as CanvasRenderingContext2D;
};
