import { getTransBoundary } from '../config/common';
import { toHalfPixel } from '../utils/math';
import type { EngineCtx, OffEngineCtx } from './type';
export const drawImage = (ctx: EngineCtx | OffEngineCtx) => {
  const oldDrawImage = ctx.drawImage;
  (ctx as EngineCtx).$drawImage = oldDrawImage;
  return (img: any, ...args: number[]) => {
    const {
      drawCoordinates,
    } = ctx;
    const callArgs = [img];
    let roundX, roundY, roundWidth, roundHeight;
    if (args.length === 2) {
      roundX = toHalfPixel(args[0]), roundY = toHalfPixel(args[1]), roundWidth = toHalfPixel(img.clientWidth), roundHeight = toHalfPixel(img.clientHeight);
      callArgs.push(roundX, roundY, roundWidth, roundHeight);
    } else if (args.length === 4) {
      roundX = toHalfPixel(args[0]), roundY = toHalfPixel(args[1]), roundWidth = toHalfPixel(args[2]), roundHeight = toHalfPixel(args[3]);
      callArgs.push(roundX, roundY, roundWidth, roundHeight);
    } else if (args.length === 8) {
      roundX = toHalfPixel(args[4]), roundY = toHalfPixel(args[5]), roundWidth = toHalfPixel(args[6]), roundHeight = toHalfPixel(args[7]);
      callArgs.push(...args);
      callArgs.splice(4, 5, roundX, roundY, roundWidth, roundHeight);
    }

    oldDrawImage.call(ctx, ...callArgs);
    if (!drawCoordinates) return;
    const matrix = ctx.getTransform();
    const points = [
      { x: roundX, y: roundY },
      { x: roundX + roundWidth, y: roundY },
      { x: roundX + roundWidth, y: roundY + roundHeight },
      { x: roundX, y: roundY + roundHeight }
    ];
    const transBoundary = getTransBoundary(matrix, points);
    // console.log('lall', JSON.parse(JSON.stringify(drawCoordinates)));
    drawCoordinates.push(
      ...[
        {
          x: transBoundary.minX,
          y: transBoundary.minY,
          dWidthX: Math.ceil(ctx.lineWidth / 2),
          dWidthY: Math.ceil(ctx.lineWidth / 2)
        },
        {
          x: transBoundary.maxX,
          y: transBoundary.maxY,
          dWidthX: Math.ceil(ctx.lineWidth / 2),
          dWidthY: Math.ceil(ctx.lineWidth / 2)
        },
      ]
    );
  };
};
