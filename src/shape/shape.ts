import { generateRandomStr } from '../config/common';
import { useModel } from '../init/useModel';
import { getPureObject } from '../utils/common';
import type { EngineCtx } from '../rewriteFn/type';
import type { ModelOptions, BorderOptions, Graphics } from '../graphOptions';

export class Shape {
  belongEngineId: string;
  ctx!: CanvasRenderingContext2D;
  id!: string;
  index = 0;
  data: any = undefined;
  children: string[] = [];
  $model!: ModelOptions;
  graphics: Graphics;
  borderOptions: BorderOptions = {
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 4,
    paddingBottom: 4,
    borderDash: [5, 5],
    borderWidth: 1,
    borderColor: 'teal',
    radius: 0
  };
  readonly _graphics: Graphics;
  constructor(modelName: string, engineId: string, data?: any, model?: ModelOptions, index?: number) {
    // const { modelMap } = useModelCache() as ModelCache;
    // this.$model = model ?? getModel(modelName);
    // this.$model = model ?? modelMap.get(modelName);
    const { getModel } = useModel(engineId);
    this.$model = getModel(modelName) as ModelOptions;
    this.borderOptions = {
      ...this.borderOptions,
      ...(this.$model?.borderOptions ?? {})
    };
    this.data = data;
    this.id = generateRandomStr(8);
    this.index = index ?? this.index;
    this.belongEngineId = engineId;
    this._graphics = getPureObject(this.$model?.graphics as Graphics);
    this.graphics = getPureObject(this.$model?.graphics as Graphics);
    if (!this.$model) {
      // throw new Error(`Create Shape error because it has not a shape model named ${modelName}`);
    }
  }

  draw(ctx: EngineCtx, engineId: string, placePoint = { x: this.graphics.ox, y: this.graphics.oy }): string {
    this.ctx = ctx;
    this.$model?.draw?.(ctx, placePoint);
    this.graphics = {
      ...this.graphics,
      ox: placePoint.x,
      oy: placePoint.y
    };
    this.drawBoundary();
    return this.id;
  }

  // setShapeSizeInformation(coordinateStack: Point[]): void { }
  // setShapeSizeByOffScreenCanvas(drawFunc: any) {
  //   const canvasWidth = this.x + this.width + 4;
  //   const canvasHeight = this.y + this.height + 4;
  //   const offCanvas = new OffscreenCanvas(canvasWidth, canvasHeight);
  //   const ctx = offCanvas.getContext('2d');
  //   drawFunc(ctx);
  //   const imageData = ctx?.getImageData(0, 0, canvasWidth, canvasHeight);
  //   const pixels = imageData?.data;
  //   let [minX, minY, maxX, maxY] = [this.x, this.y, this.x + this.width, this.y + this.height];
  //   let minYFlag = false;
  //   for (let y = minY; y < canvasHeight; y++) {
  //     for (let x = minX; x < canvasWidth; x++) {
  //       const index = (y * canvasWidth + x) * 4; // 当前像素在pixels的起始位置
  //       const r = pixels![index];
  //       const g = pixels![index + 1];
  //       const b = pixels![index + 2];
  //       const a = pixels![index + 3];
  //       // eslint-disable-next-line eqeqeq
  //       if (r != 0 || g != 0 || b != 0 || a != 0) {
  //         minYFlag = true;
  //         minY = y;
  //         break;
  //       }
  //     }
  //     if (minYFlag) break;
  //   }

  //   let maxYFlag = false;
  //   for (let y = this.y + this.height; y > this.y; y--) {
  //     for (let x = this.x - 4; x < canvasWidth; x++) {
  //       const index = (y * canvasWidth + x) * 4; // 当前像素在pixels的起始位置
  //       const r = pixels![index];
  //       const g = pixels![index + 1];
  //       const b = pixels![index + 2];
  //       const a = pixels![index + 3];
  //       // eslint-disable-next-line eqeqeq
  //       if (r != 0 || g != 0 || b != 0 || a != 0) {
  //         maxY = y;
  //         maxYFlag = true;
  //         break;
  //       }
  //     }
  //     if (maxYFlag) break;
  //   }

  //   let minXFlag = false;
  //   for (let x = this.x; x < canvasWidth; x++) {
  //     for (let y = this.y - 4; y < canvasHeight; y++) {
  //       const index = (y * canvasWidth + x) * 4; // 当前像素在pixels的起始位置
  //       const r = pixels![index];
  //       const g = pixels![index + 1];
  //       const b = pixels![index + 2];
  //       const a = pixels![index + 3];
  //       // eslint-disable-next-line eqeqeq
  //       if (r != 0 || g != 0 || b != 0 || a != 0) {
  //         minXFlag = true;
  //         minX = x;
  //         break;
  //       }
  //     }
  //     if (minXFlag) break;
  //   }
  //   let maxXFlag = false;
  //   for (let x = this.x + this.width; x > this.x; x--) {
  //     for (let y = this.y - 4; y < canvasHeight; y++) {
  //       const index = (y * canvasWidth + x) * 4; // 当前像素在pixels的起始位置
  //       const r = pixels![index];
  //       const g = pixels![index + 1];
  //       const b = pixels![index + 2];
  //       const a = pixels![index + 3];
  //       // eslint-disable-next-line eqeqeq
  //       if (r != 0 || g != 0 || b != 0 || a != 0) {
  //         maxX = x;
  //         maxXFlag = true;
  //         break;
  //       }
  //     }
  //     if (maxXFlag) break;
  //   }
  //   return {
  //     minX,
  //     maxX,
  //     minY,
  //     maxY
  //   };
  // }

  drawBoundary(): void {
    const { paddingLeft, paddingRight, paddingTop, paddingBottom, borderDash, borderWidth, borderColor } =
      this.borderOptions;
    const strokeColor = borderColor ?? '#993f55';
    const lineWidth = borderWidth ?? 2;
    const lineDash = borderDash ?? [9, 2];
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.strokeStyle = strokeColor;
    this.ctx.lineWidth = lineWidth;
    this.ctx.setLineDash(lineDash);
    (this.ctx as any).$strokeRect(
      this.graphics.ox - (paddingLeft ?? 4),
      this.graphics.oy - (paddingTop ?? 4),
      this.graphics.width + (paddingLeft ?? 4) + (paddingRight ?? 4),
      this.graphics.height + (paddingTop ?? 4) + (paddingBottom ?? 4)
    );
    this.ctx.setLineDash([0, 0]);
    this.ctx.restore();
  }

  isPointInTheShape(event: any) {
    return;
  }

  move(newx: number, newy: number) {
    // const offCanvas = new OffscreenCanvas();
  }
}
