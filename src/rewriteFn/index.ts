import { arc } from './arc';
import { arcTo } from './arcTo';
import { rect } from './rect';
import { fillRect } from './fillRect';
import { strokeRect } from './strokeRect';
import { lineTo } from './lineTo';
import { moveTo } from './moveTo';
import { bezierCurveTo } from './bezierCurveTo';
import { quadraticCurveTo } from './quadraticCurveTo';
import { stroke } from './stroke';

(window as any).RAF = (function () {
  return window.requestAnimationFrame
  || (window as any).webkitRequestAnimationFrame
  || (window as any).mozRequestAnimationFrame
  || (window as any).oRequestAnimationFrame
  || (window as any).msRequestAnimationFrame
  || function (callback: () => any) { window.setTimeout(callback, 1000 / 60); };
})();

const useRewriteCtxFunction = () => {
  return {
    arc,
    arcTo,
    rect,
    fillRect,
    strokeRect,
    moveTo,
    lineTo,
    bezierCurveTo,
    quadraticCurveTo,
    stroke
  };
};

export default useRewriteCtxFunction;
