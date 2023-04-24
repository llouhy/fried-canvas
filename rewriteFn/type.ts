export interface EngineCtx extends CanvasRenderingContext2D {
  $arc?: CanvasRenderingContext2D['arc'] | OffscreenCanvasRenderingContext2D['arc'];
  $arcTo?: CanvasRenderingContext2D['arcTo'] | OffscreenCanvasRenderingContext2D['arcTo'];
  $rect?: CanvasRenderingContext2D['rect'] | OffscreenCanvasRenderingContext2D['rect'];
  $fillRect?: CanvasRenderingContext2D['fillRect'] | OffscreenCanvasRenderingContext2D['fillRect'];
  $strokeRect?: CanvasRenderingContext2D['strokeRect'] | OffscreenCanvasRenderingContext2D['strokeRect'];
  $lineTo?: CanvasRenderingContext2D['lineTo'] | OffscreenCanvasRenderingContext2D['lineTo'];
  $moveTo?: CanvasRenderingContext2D['moveTo'] | OffscreenCanvasRenderingContext2D['moveTo'];
  $bezierCurveTo?: CanvasRenderingContext2D['bezierCurveTo'] | OffscreenCanvasRenderingContext2D['bezierCurveTo'];
  $stroke?: CanvasRenderingContext2D['stroke'] | OffscreenCanvasRenderingContext2D['stroke'];
  $quadraticCurveTo?:
    | CanvasRenderingContext2D['quadraticCurveTo']
    | OffscreenCanvasRenderingContext2D['quadraticCurveTo'];
  [key: string]: any;
}
export interface OffEngineCtx extends OffscreenCanvasRenderingContext2D {
  $arc?: CanvasRenderingContext2D['arc'] | OffscreenCanvasRenderingContext2D['arc'];
  $arcTo?: CanvasRenderingContext2D['arcTo'] | OffscreenCanvasRenderingContext2D['arcTo'];
  $rect?: CanvasRenderingContext2D['rect'] | OffscreenCanvasRenderingContext2D['rect'];
  $fillRect?: CanvasRenderingContext2D['fillRect'] | OffscreenCanvasRenderingContext2D['fillRect'];
  $strokeRect?: CanvasRenderingContext2D['strokeRect'] | OffscreenCanvasRenderingContext2D['strokeRect'];
  $lineTo?: CanvasRenderingContext2D['lineTo'] | OffscreenCanvasRenderingContext2D['lineTo'];
  $moveTo?: CanvasRenderingContext2D['moveTo'] | OffscreenCanvasRenderingContext2D['moveTo'];
  $bezierCurveTo?: CanvasRenderingContext2D['bezierCurveTo'] | OffscreenCanvasRenderingContext2D['bezierCurveTo'];
  $stroke?: CanvasRenderingContext2D['stroke'] | OffscreenCanvasRenderingContext2D['stroke'];
  $quadraticCurveTo?:
    | CanvasRenderingContext2D['quadraticCurveTo']
    | OffscreenCanvasRenderingContext2D['quadraticCurveTo'];
  [key: string]: any;
}
export type Point = {
  x: number;
  y: number;
  [key: string]: any;
};
export type Boundary = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};
export type Direction = 'toLeft' | 'toRight' | 'toBottom' | 'toTop';
