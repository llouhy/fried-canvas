import { angleToRadian, generateRandomStr } from '../utils/common';
import { ModelDrawFuncArgs, useModel } from '../init/useModel';
import { getGraphicsWithBorder, getPureObject, setPropertyUnWritable } from '../utils/common';
import type { Boundary, EngineCtx, Point } from '../rewriteFn/type';
import type { ModelOptions, BorderOptions, Graphics } from '../graphOptions';
import { engineById } from '../engineFn';
import { useGrid } from '../init/useGrid';
import { GridIns } from '../definition/grid';
import { setIdentify } from '../utils/setIdentify';
// import { toCheckParams } from '../utils/is';

export const allShapeBoundary = {
  minX: -Infinity,
  minY: -Infinity,
  maxX: Infinity,
  maxY: Infinity
};

export type Shape = {
  belongEngineId: string;
  ctx: CanvasRenderingContext2D;
  id: string;
  index: number;
  data: any;
  rotateDeg: number;
  $model: ModelOptions;
  graphics: Graphics;
  graphicsWithBorder: Graphics;
  children: Shape[];
  borderOptions: BorderOptions;
  gridSet: Set<GridIns>;
  boundary: Boundary;
  drawArgs: ModelDrawFuncArgs[];
  _graphics: Graphics;
  draw: (ctx: EngineCtx, placePoint?: Point, rotateDeg?: number) => string;
  drawBoundary: () => void;
  isPointInTheShape: (e: any) => boolean;
  moveTo: (x: number, y: number) => void;
  rotate: (rotateDeg: number) => void;
};

export const getShape = (modelName: string, engineId: string, data?: any, model?: ModelOptions, index?: number): Shape => {
  // const { getModel } = engineById.get(engineId);
  const shape: any = getPureObject({
    belongEngineId: '',
    ctx: null,
    id: '',
    index: 0,
    data: null,
    $model: null,
    graphics: null,
    graphicsWithBorder: null,
    children: null,
    borderOptions: {
      needBorder: true,
      paddingLeft: 0,
      paddingRight: 0,
      paddingTop: 0,
      paddingBottom: 0,
      borderDash: [6, 6],
      borderWidth: 1,
      borderColor: 'tomato',
      radius: 0
    },
    gridSet: new Set(),
    boundary: null,
    _graphics: null
  });

  const { getModel } = useModel(engineId);
  if (!getModel(modelName)) return;
  shape.$model = getModel(modelName) as ModelOptions;
  shape.borderOptions = {
    ...shape.borderOptions,
    ...(shape.$model?.borderOptions || {})
  };
  shape.id = `${engineId}:${generateRandomStr(8)}`;
  shape.data = data;
  shape.index = index ?? index;
  shape.belongEngineId = engineId;
  shape.drawArgs = shape.$model.drawArgs;
  shape._graphics = getPureObject(shape.$model.graphics as Graphics);
  shape.graphics = getPureObject(shape.$model.graphics as Graphics);

  const draw = (ctx: EngineCtx, placePoint = { x: shape.graphics.ox, y: shape.graphics.oy }, rotateDeg?: number): string => {
    shape.ctx = ctx || engineById.get(shape.belongEngineId).engine.ctx;
    if (rotateDeg) {
      const { width, height } = shape.graphics;
      const { x: ox, y: oy } = placePoint;
      shape.ctx.save();
      shape.ctx.translate(ox + (width >> 1), oy + (height >> 1));
      shape.ctx.rotate(angleToRadian(rotateDeg));
      const offset = {
        dx: (-width >> 1) - shape._graphics.ox,
        dy: (-height >> 1) - shape._graphics.oy
      };
      shape.ctx.save();
      shape.ctx.translate(offset.dx, offset.dy);
      shape.$model.draw(shape.ctx, ...shape.drawArgs);
      shape.ctx.restore();
      shape.drawBoundary({ ox: -width >> 1, oy: -height >> 1, width, height });
      shape.ctx.restore();
      shape.graphics = {
        ...shape.graphics,
        ox: placePoint.x,
        oy: placePoint.y
      };       
      shape.graphicsWithBorder = getGraphicsWithBorder(shape.graphics, shape.borderOptions, rotateDeg);
      return shape.id;
    }
    const offset = {
      dx: placePoint.x - shape._graphics.ox,
      dy: placePoint.y - shape._graphics.oy
    };
    shape.ctx.save();
    shape.ctx.translate(offset.dx, offset.dy);
    shape.$model?.draw?.(shape.ctx, ...shape.drawArgs);
    shape.ctx.restore();
    shape.graphics = {
      ...shape.graphics,
      ox: placePoint.x,
      oy: placePoint.y
    };    
    shape.drawBoundary();
    shape.graphicsWithBorder = getGraphicsWithBorder(shape.graphics, shape.borderOptions);
    return shape.id;
  }
  const drawBoundary = (graphics?: Graphics): void => {
    const shapeGraphics = graphics || shape.graphics;
    const { paddingLeft, paddingRight, paddingTop, paddingBottom, borderDash, borderWidth, borderColor } =
      shape.borderOptions;
    const strokeColor = borderColor ?? '#993f55';
    const lineWidth = borderWidth || 1;
    const lineDash = borderDash ?? [9, 2];
    const BORDER_PADDING = 0;
    const boundOx = shapeGraphics.ox - (paddingLeft);
    const boundOy = shapeGraphics.oy - (paddingTop);
    const boundWidth = shapeGraphics.width + (paddingLeft) + (paddingRight);
    const boundHeight = shapeGraphics.height + (paddingTop) + (paddingBottom);
    const dlineWidth = Math.ceil(lineWidth / 2);
    shape.boundary = {
      minX: boundOx - dlineWidth,
      maxX: boundOx + boundWidth + dlineWidth,
      minY: boundOy - dlineWidth,
      maxY: boundOy + boundHeight + dlineWidth
    };
    // if () {}
    shape.ctx.save();
    shape.ctx.beginPath();
    shape.ctx.strokeStyle = borderColor;
    shape.ctx.lineWidth = borderWidth;
    shape.ctx.setLineDash(lineDash);
    // (shape.ctx as any).$strokeRect(
    //   shape.graphics.ox,
    //   shape.graphics.oy,
    //   shape.graphics.width,
    //   shape.graphics.height
    // );
    (shape.ctx as any).$strokeRect(
      boundOx + 0.5,
      boundOy + 0.5,
      boundWidth,
      boundHeight
    );
    shape.ctx.setLineDash([0, 0]);
    shape.ctx.restore();
  }
  const isPointInTheShape = (event: any): boolean => {
    return true;
  }

  const moveTo = (x: number, y: number) => { // moveTo偏移量会导致清除失败，graphics不同步
    const { repaintInfluencedShape } = engineById.get(shape.belongEngineId);
    repaintInfluencedShape(shape.graphicsWithBorder || getGraphicsWithBorder(shape.graphics, shape.borderOptions), new Set([shape])); // repaint应该
    shape.draw(shape.ctx, { x, y }, shape.rotateDeg || null);
    const { updateShapeToGrid } = useGrid(shape.belongEngineId);
    updateShapeToGrid(shape, shape.graphicsWithBorder);
  }

  const rotate = (rotateDeg: number) => { // moveTo偏移量会导致清除失败，graphics不同步
    shape.rotateDeg = rotateDeg;
    shape.moveTo(shape.graphics.ox, shape.graphics.oy);
    return;
    // const { repaintInfluencedShape } = engineById.get(shape.belongEngineId);
    // repaintInfluencedShape(shape.graphicsWithBorder, new Set([shape])); // repaint应该
    // const { ox, oy, width, height } = shape.graphics;
    // shape.ctx.save();
    // shape.ctx.translate(ox + width / 2, oy + height / 2);
    // shape.ctx.rotate(rotateDeg * Math.PI / 180);
    // shape.draw(shape.ctx, { x: -width / 2, y: -height / 2 });
    // shape.ctx.restore();
    // shape.graphics = { ox, oy, width, height };
    // const { updateShapeToGrid } = useGrid(shape.belongEngineId);
    // shape.graphicsWithBorder = getGraphicsWithBorder(shape.graphics, shape.borderOptions, rotateDeg);
    // shape.rotateDeg = rotateDeg;
    // updateShapeToGrid(shape, shape.graphicsWithBorder);
  }
  shape.draw = draw;
  shape.drawBoundary = drawBoundary;
  shape.isPointInTheShape = isPointInTheShape;
  shape.moveTo = moveTo;
  shape.rotate = rotate;
  setPropertyUnWritable(shape, ['draw', 'drawBoundary', 'isPointInTheShape', 'moveTo']);
  return setIdentify(shape, 'shape');
}
