import { Shape } from './shape';
import { getArcModel } from './model';
import type { ArcOptions } from './model';
import type { ModelOptions } from '../graphOptions';

export class Arc extends Shape {
  model: ModelOptions;

  constructor(arcOptions: ArcOptions, data?: any) {
    const model = getArcModel(arcOptions);
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
