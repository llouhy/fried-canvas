import type { ModelOptions } from '../graphOptions';
import type { EngineCtx, OffEngineCtx } from '../rewriteFn/type';
import { colorMap } from '../config/color';
import { angleToRadian } from '../utils/math';

export type RectOptions = {
  width: number;
  height: number;
  x: number;
  y: number;
  fillColor?: string;
  strokeColor?: string;
};

export type ArcOptions = {
  x: number;
  y: number;
  radius: number;
  startAngle: number;
  endAngle: number;
};

export const getRectModel = (rectOptions: RectOptions): ModelOptions => {
  const { width, height, x, y, fillColor, strokeColor } = rectOptions;
  const $width = width ? width : 100;
  const $height = height ? height : 100;
  const $left = x ? x : 100;
  const $top = y ? y : 100;
  const $fillColor = fillColor ?? colorMap.get('defaultRectFillColor') ?? '#333';
  const $strokeColor = strokeColor ?? '#333';
  return {
    name: 'rect',
    draw: (ctx: EngineCtx | OffEngineCtx): void => {
      ctx.save();
      ctx.beginPath();
      if (strokeColor) {
        ctx.strokeStyle = $strokeColor;
        ctx.strokeRect($left, $top, $width, $height);
      } else {
        ctx.fillStyle = $fillColor;
        ctx.fillRect($left, $top, $width, $height);
      }
      ctx.closePath();
      ctx.restore();
      return;
    }
  };
};

export const getArcModel = (arcOptions: ArcOptions): ModelOptions => {
  const { x, y, radius, startAngle, endAngle } = arcOptions;
  const [$x, $y, $radius, $startAngle, $endAngle] = [x, y, radius, startAngle, endAngle];
  return {
    name: 'arc',
    draw: (ctx: EngineCtx | OffEngineCtx): void => {
      ctx.save();
      ctx.beginPath();
      ctx.arc($x, $y, $radius, $startAngle, $endAngle);
      ctx.stroke();
      ctx.restore();
    }
  };
};

export const getTestModel = (): ModelOptions => {
  return {
    name: 'test',
    draw: (ctx: EngineCtx | OffEngineCtx): void => {
      ctx.save();
      // ctx.globalCompositeOperation = '';
      ctx.lineWidth = 20;
      ctx.beginPath();
      // ctx.strokeStyle = 'green';
      ctx.moveTo(40, 40);
      // ctx.strokeStyle = 'blue';
      ctx.lineTo(80, 80);
      ctx.lineTo(120, 60);
      // ctx.lineWidth = 30;
      // ctx.stroke();
      // ctx.restore();
      // ctx.beginPath();
      // ctx.strokeStyle = 'pink';
      // ctx.lineWidth = 8;
      ctx.arcTo(160, 60, 160, 120, 40);
      ctx.arcTo(160, 160, 200, 160, 20);
      ctx.lineTo(200, 40);
      ctx.arc(160, 160, 50, angleToRadian(60), angleToRadian(360));
      // ctx.stroke();
      // ctx.restore();
      // ctx.beginPath();
      // ctx.strokeStyle = '#892911';
      // ctx.lineWidth = 30;
      ctx.moveTo(300, 300);
      ctx.lineTo(250, 300);
      ctx.quadraticCurveTo(60, 60, 280, 320);
      ctx.bezierCurveTo(20, 0, 200, 300, 200, 20);
      // ctx.fillStyle = 'yellow';
      // ctx.fill();
      // ctx.closePath();
      // ctx.arcTo(120, 160, 100, 90, 40);
      ctx.stroke();
      ctx.restore();
      ctx.beginPath();
      ctx.moveTo(40, 40);
      ctx.strokeStyle = 'blue';
      ctx.lineWidth = 50;
      ctx.lineTo(400, 400);
      ctx.stroke();
      ctx.restore();
    },
    borderOptions: {
      paddingTop: 0,
      paddingBottom: 0,
      paddingLeft: 4,
      paddingRight: 4,
      borderDash: [5, 5],
      borderWidth: 2
    }
  };
};

export const getTestModel2 = (): ModelOptions => {
  return {
    name: 'test2',
    draw: (ctx: EngineCtx | OffEngineCtx): void => {
      ctx.save();
      ctx.lineWidth = 5;
      ctx.strokeStyle = 'pink';
      ctx.beginPath();
      ctx.moveTo(300, 60);
      ctx.lineTo(420, 420);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(420, 420, 44, angleToRadian(45), angleToRadian(270));
      ctx.stroke();
      ctx.restore();
    },
    borderOptions: {
      paddingLeft: 0,
      paddingRight: 0,
      paddingTop: 0,
      paddingBottom: 0,
      borderDash: [5, 5],
      borderWidth: 2
    }
  };
};
