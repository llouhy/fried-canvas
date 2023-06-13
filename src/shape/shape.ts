import { generateRandomStr } from '../config/common';
import { useModel } from '../init/useModel';
import { getGraphicsWithBorder, getPureObject } from '../utils/common';
import type { Boundary, EngineCtx } from '../rewriteFn/type';
import type { ModelOptions, BorderOptions, Graphics } from '../graphOptions';
import { engineById } from '../engineFn';
import { useGrid } from '../init/useGrid';

export const allShapeBoundary = {
  minX: -Infinity,
  minY: -Infinity,
  maxX: Infinity,
  maxY: Infinity
};
export class Shape {
  belongEngineId: string;
  ctx!: CanvasRenderingContext2D;
  id!: string;
  index = 0;
  data: any = undefined;
  $model!: ModelOptions;
  graphics: Graphics;
  graphicsWithBorder: Graphics;
  children: Shape[];
  borderOptions: BorderOptions = {
    needBorder: true,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 10,
    borderDash: [5, 5],
    borderWidth: 1,
    borderColor: 'tomato',
    radius: 0
  };
  boundary: Boundary;
  readonly _graphics: Graphics;
  constructor(modelName: string, engineId: string, data?: any, model?: ModelOptions, index?: number) {
    const { getModel } = useModel(engineId);
    this.$model = getModel(modelName) as ModelOptions;
    this.borderOptions = {
      ...this.borderOptions,
      ...(this.$model?.borderOptions ?? {})
    };
    this.id = `${engineId}:${generateRandomStr(8)}`;
    this.data = data;
    this.index = index ?? this.index;
    this.belongEngineId = engineId;
    this._graphics = getPureObject(this.$model?.graphics as Graphics);
    this.graphics = getPureObject(this.$model?.graphics as Graphics);
    if (!this.$model) {
      // throw new Error(`Create Shape error because it has not a shape model named ${modelName}`);
    }
  }

  draw(ctx: EngineCtx, placePoint = { x: this.graphics.ox, y: this.graphics.oy }): string {
    this.ctx = ctx ?? engineById.get(this.belongEngineId).engine.ctx;
    this.$model?.draw?.(this.ctx, placePoint);
    this.graphics = {
      ...this.graphics,
      ox: placePoint.x,
      oy: placePoint.y
    };
    this.graphicsWithBorder = getGraphicsWithBorder(this.graphics, this.borderOptions);
    this.drawBoundary();
    return this.id;
  }

  // updateToGrid

  drawBoundary(): void {
    const { paddingLeft, paddingRight, paddingTop, paddingBottom, borderDash, borderWidth, borderColor } =
      this.borderOptions;
    const strokeColor = borderColor ?? '#993f55';
    const lineWidth = borderWidth ?? 2;
    const lineDash = borderDash ?? [9, 2];
    const BORDER_PADDING = 0;
    const boundOx = this.graphics.ox - (paddingLeft);
    const boundOy = this.graphics.oy - (paddingTop);
    const boundWidth = this.graphics.width + (paddingLeft) + (paddingRight);
    const boundHeight = this.graphics.height + (paddingTop) + (paddingBottom);
    const dlineWidth = Math.ceil(lineWidth / 2);
    this.boundary = {
      minX: boundOx - dlineWidth,
      maxX: boundOx + boundWidth + dlineWidth,
      minY: boundOy - dlineWidth,
      maxY: boundOy + boundHeight + dlineWidth
    };
    // if () {}
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.strokeStyle = strokeColor;
    this.ctx.lineWidth = lineWidth;
    this.ctx.setLineDash(lineDash);
    (this.ctx as any).$strokeRect(
      boundOx,
      boundOy,
      boundWidth,
      boundHeight
    );
    this.ctx.setLineDash([0, 0]);
    this.ctx.restore();
  }

  isPointInTheShape(event: any) {
    return;
  }

  moveTo(x: number, y: number) { // moveTo偏移量会导致清除失败，graphics不同步
    const { repaintInfluencedShape } = engineById.get(this.belongEngineId);
    // 需要重新绘制开始位置跟结束位置影响的shape
    // 方案1：分别对新旧位置执行清除重绘操作
    // 方案2：将新旧位置的boundary合并成一个大Bound执行清除重绘操作
    repaintInfluencedShape(this.graphicsWithBorder || getGraphicsWithBorder(this.graphics, this.borderOptions), new Set([this])); // repaint应该
    this.draw(this.ctx, { x, y });
    const { updateShapeToGrid } = useGrid(this.belongEngineId);
    updateShapeToGrid(this, this.graphicsWithBorder);
  }
}
