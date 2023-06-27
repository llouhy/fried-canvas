import { generateRandomStr } from '../config/common';
import { useModel } from '../init/useModel';
import { getGraphicsWithBorder, getPureObject, setPropertyUnWritable } from '../utils/common';
import type { Boundary, EngineCtx, Point } from '../rewriteFn/type';
import type { ModelOptions, BorderOptions, Graphics } from '../graphOptions';
import { engineById } from '../engineFn';
import { useGrid } from '../init/useGrid';
import { GridIns } from '../definition/grid';
import { setIdentify } from '../utils/setIdentify';

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
  $model: ModelOptions;
  graphics: Graphics;
  graphicsWithBorder: Graphics;
  children: Shape[];
  borderOptions: BorderOptions;
  gridSet: Set<GridIns>;
  boundary: Boundary;
  readonly _graphics: Graphics;
  draw: (ctx: EngineCtx, placePoint?: Point) => string;
  drawBoundary: () => void;
  isPointInTheShape: (e: any) => boolean;
  moveTo: (x: number, y: number) => void;
};

export const getShape = (modelName: string, engineId: string, data?: any, model?: ModelOptions, index?: number): Shape => {
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
  shape.$model = getModel(modelName) as ModelOptions;
  shape.borderOptions = {
    ...shape.borderOptions,
    ...(shape.$model?.borderOptions ?? {})
  };
  shape.id = `${engineId}:${generateRandomStr(8)}`;
  shape.data = data;
  shape.index = index ?? index;
  shape.belongEngineId = engineId;
  // console.log(shape)
  shape._graphics = getPureObject(shape.$model?.graphics as Graphics);
  shape.graphics = getPureObject(shape.$model?.graphics as Graphics);
  const draw = (ctx: EngineCtx, placePoint = { x: shape.graphics.ox, y: shape.graphics.oy }): string => {
      shape.ctx = ctx ?? engineById.get(shape.belongEngineId).engine.ctx;
      const offset = {
        dx: placePoint.x - shape._graphics.ox,
        dy: placePoint.y - shape._graphics.oy
      };
      shape.ctx.save();
      shape.ctx.translate(offset.dx, offset.dy);
      shape.$model?.draw?.(shape.ctx, placePoint);
      shape.ctx.restore();
      // console.log(shape.$model.imageData)
      // const globalCompositeOperation = ctx.globalCompositeOperation;
      // ctx.globalCompositeOperation = 'lighter';
      // ctx.putImageData(shape.$model.imageData, placePoint.x, placePoint.y);
      shape.graphics = {
        ...shape.graphics,
        ox: placePoint.x,
        oy: placePoint.y
      };
      shape.graphicsWithBorder = getGraphicsWithBorder(shape.graphics, shape.borderOptions);
      // console.log()
      shape.drawBoundary();
      // ctx.globalCompositeOperation = globalCompositeOperation;
      return shape.id;
  }
  const drawBoundary = (): void => {
    const { paddingLeft, paddingRight, paddingTop, paddingBottom, borderDash, borderWidth, borderColor } =
      shape.borderOptions;
    const strokeColor = borderColor ?? '#993f55';
    const lineWidth = borderWidth || 1;
    const lineDash = borderDash ?? [9, 2];
    const BORDER_PADDING = 0;
    const boundOx = shape.graphics.ox - (paddingLeft);
    const boundOy = shape.graphics.oy - (paddingTop);
    const boundWidth = shape.graphics.width + (paddingLeft) + (paddingRight);
    const boundHeight = shape.graphics.height + (paddingTop) + (paddingBottom);
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
    // console.log('边框', {
    //   boundOx,
    //   boundOy,
    //   boundWidth,
    //   boundHeight
    // })
  }
  const isPointInTheShape = (event: any): boolean => {
    return true;
  }

  const moveTo = (x: number, y: number) => { // moveTo偏移量会导致清除失败，graphics不同步
    const { repaintInfluencedShape } = engineById.get(shape.belongEngineId);
    // 需要重新绘制开始位置跟结束位置影响的shape
    // 方案1：分别对新旧位置执行清除重绘操作
    // 方案2：将新旧位置的boundary合并成一个大Bound执行清除重绘操作
    // console.log('当前shape的边界', {...shape.graphicsWithBorder})
    repaintInfluencedShape(shape.graphicsWithBorder || getGraphicsWithBorder(shape.graphics, shape.borderOptions), new Set([shape])); // repaint应该
    shape.draw(shape.ctx, { x, y });
    const { updateShapeToGrid } = useGrid(shape.belongEngineId);
    (window as any).ooo = true;
    updateShapeToGrid(shape, shape.graphicsWithBorder);
    (window as any).ooo = false;
  }
  shape.draw = draw;
  shape.drawBoundary = drawBoundary;
  shape.isPointInTheShape = isPointInTheShape;
  shape.moveTo = moveTo;
  setPropertyUnWritable(shape, ['draw', 'drawBoundary', 'isPointInTheShape', 'moveTo']);
  return setIdentify(shape, 'shape');
}
// export class Shape {
//   belongEngineId: string;
//   ctx!: CanvasRenderingContext2D;
//   id!: string;
//   index = 0;
//   data: any = undefined;
//   $model!: ModelOptions;
//   graphics: Graphics;
//   graphicsWithBorder: Graphics;
//   children: Shape[];
//   borderOptions: BorderOptions = {
//     needBorder: true,
//     paddingLeft: 0,
//     paddingRight: 0,
//     paddingTop: 0,
//     paddingBottom: 0,
//     borderDash: [5, 5],
//     borderWidth: 1,
//     borderColor: 'tomato',
//     radius: 0
//   };
//   gridSet: Set<GridIns> = new Set();
//   boundary: Boundary;
//   readonly _graphics: Graphics;
//   constructor(modelName: string, engineId: string, data?: any, model?: ModelOptions, index?: number) {
//     const { getModel } = useModel(engineId);
//     this.$model = getModel(modelName) as ModelOptions;
//     this.borderOptions = {
//       ...this.borderOptions,
//       ...(this.$model?.borderOptions ?? {})
//     };
//     this.id = `${engineId}:${generateRandomStr(8)}`;
//     this.data = data;
//     this.index = index ?? this.index;
//     this.belongEngineId = engineId;
//     this._graphics = getPureObject(this.$model?.graphics as Graphics);
//     this.graphics = getPureObject(this.$model?.graphics as Graphics);
//     if (!this.$model) {
//       // throw new Error(`Create Shape error because it has not a shape model named ${modelName}`);
//     }
//   }

//   draw(ctx: EngineCtx, placePoint = { x: this.graphics.ox, y: this.graphics.oy }): string {
//     this.ctx = ctx ?? engineById.get(this.belongEngineId).engine.ctx;
//     this.$model?.draw?.(this.ctx, placePoint);
//     this.graphics = {
//       ...this.graphics,
//       ox: placePoint.x,
//       oy: placePoint.y
//     };
//     this.graphicsWithBorder = getGraphicsWithBorder(this.graphics, this.borderOptions);
//     // console.log()
//     this.drawBoundary();
//     return this.id;
//   }

//   // updateToGrid

//   drawBoundary(): void {
//     const { paddingLeft, paddingRight, paddingTop, paddingBottom, borderDash, borderWidth, borderColor } =
//       this.borderOptions;
//     const strokeColor = borderColor ?? '#993f55';
//     const lineWidth = borderWidth || 2;
//     const lineDash = borderDash ?? [9, 2];
//     const BORDER_PADDING = 0;
//     const boundOx = this.graphics.ox - (paddingLeft);
//     const boundOy = this.graphics.oy - (paddingTop);
//     const boundWidth = this.graphics.width + (paddingLeft) + (paddingRight);
//     const boundHeight = this.graphics.height + (paddingTop) + (paddingBottom);
//     const dlineWidth = Math.ceil(lineWidth / 2);
//     this.boundary = {
//       minX: boundOx - dlineWidth,
//       maxX: boundOx + boundWidth + dlineWidth,
//       minY: boundOy - dlineWidth,
//       maxY: boundOy + boundHeight + dlineWidth
//     };
//     // if () {}
//     this.ctx.save();
//     this.ctx.beginPath();
//     this.ctx.strokeStyle = strokeColor;
//     this.ctx.lineWidth = lineWidth;
//     this.ctx.setLineDash(lineDash);
//     (this.ctx as any).$strokeRect(
//       boundOx,
//       boundOy,
//       boundWidth,
//       boundHeight
//     );
//     this.ctx.setLineDash([0, 0]);
//     this.ctx.restore();
//   }

//   isPointInTheShape(event: any) {
//     return;
//   }

//   moveTo(x: number, y: number) { // moveTo偏移量会导致清除失败，graphics不同步
//     const { repaintInfluencedShape } = engineById.get(this.belongEngineId);
//     // 需要重新绘制开始位置跟结束位置影响的shape
//     // 方案1：分别对新旧位置执行清除重绘操作
//     // 方案2：将新旧位置的boundary合并成一个大Bound执行清除重绘操作
//     // console.log('当前shape的边界', {...this.graphicsWithBorder})
//     repaintInfluencedShape(this.graphicsWithBorder || getGraphicsWithBorder(this.graphics, this.borderOptions), new Set([this])); // repaint应该
//     this.draw(this.ctx, { x, y });
//     const { updateShapeToGrid } = useGrid(this.belongEngineId);
//     updateShapeToGrid(this, this.graphicsWithBorder);
//   }
// }
