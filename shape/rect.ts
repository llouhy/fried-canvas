import { Shape } from './shape';
import { getRectModel } from './model';
import type { RectOptions } from './model';
import type { ModelOptions } from '../graphOptions';

export class Rect extends Shape {
  model: ModelOptions;

  constructor(rectOptions: RectOptions, data?: any) {
    const model = getRectModel(rectOptions);
    super(model.name, data, model);
    this.model = model;
  }

  // draw(ctx: CanvasRenderingContext2D) {
  //   this.model.draw(ctx);
  // }

  isPointInTheShape(event: any): boolean {
    return true;
  }
}
