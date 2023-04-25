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
