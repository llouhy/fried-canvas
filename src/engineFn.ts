import { isCanvas, isString } from './utils/is';
import { Shape } from './shape/shape';
import { UseGridRes, useGrid } from './init/useGrid';
import { UseGraphRes, useGraph } from './init/useGraph';
import { getError } from './definition/error';
import { generateRandomStr } from './utils/math';
import { setIdentify } from './utils/setIdentify';
import { DrawShape, GetShape, UseShapeRes, useShape } from './init/useShape';
import { initContext, reloadCtxFunction } from './init/context';
import { OnEvent, RemoveAllEvent, RemoveEvent, UseEventRes, useEvent } from './init/useEvent';
import { AddModel, DeleteModel, GetModel, UpdateModel, UseModelRes, checkParams, useModel } from './init/useModel';
import { getPureObject, microtask, omitObjectProperty, setCanvasSize, setPropertyUnWritable } from './utils/common';
import type { Graphics, ModelOptions } from './graphOptions';
import type { EngineCtx, OffEngineCtx } from './rewriteFn/type';
import { UseConfigRes, useConfig } from './init/useConfig';
import { ToCheckParams, toCheckParams } from './utils/toCheckParams';
import { UseLayerRes, useLayer } from './init/useLayer';
import { presetShape } from './shape/preset';

export type InitEngineResult = {
  engine: {
    width: number;
    height: number;
    id: string;
    ctx: EngineCtx;
    canvas: HTMLCanvasElement;
    readonly: boolean;
    canvasWrapDom: HTMLDivElement;
    repaintInfluencedShape: (graphics: Graphics, excludes: Set<Shape>) => void;
  };
} & UseConfigRes & UseEventRes & UseGraphRes & UseShapeRes & UseGridRes & UseModelRes & UseLayerRes;
export type InitEngine = (options: EngineOptions) => InitEngineResult;

export type EngineOptions = {
  readonly?: boolean;
  id?: string;
  width?: number;
  height?: number;
  canvas?: HTMLCanvasElement | string;
  mountDom: HTMLElement;
  modelList?: ModelOptions[];
};
export type CanvasIns = {
  width: number;
  height: number;
};
export type ContextAttributes = {
  alpha: boolean;
  antialias: boolean;
  depth: boolean;
  failIfMajorPerformanceCaveat: boolean;
  powerPreference: 'default' | 'high-performance' | 'low-power';
  premultipliedAlpha: boolean;
  preserveDrawingBuffer: boolean;
  stencil: boolean;
};

const DEFAULT_CANVAS_WIDTH = 300;
const DEFAULT_CANVAS_HEIGHT = 300;
const img: any = document.getElementById('image-test');
img.crossOrigin = '';
export const engineById = new Map<string, InitEngineResult>();

export const initEngine: InitEngine = (options): InitEngineResult => {
  const { id, width, height, canvas, modelList, readonly, mountDom } = options;
  const engineRes = engineById.get(id || '');
  if (engineRes) return engineRes;
  const canvasWrapDom = document.createElement('div'), canvasDom = document.createElement('canvas');
  // canvasDom.classList.add('hello');
  mountDom.innerHTML = '';
  mountDom.appendChild(canvasWrapDom).setAttribute('style', 'position:relative');
  canvasWrapDom.appendChild(canvasDom);
  const ctx: CanvasRenderingContext2D = initContext('2d', canvasDom as HTMLCanvasElement),
    _id: string = id || generateRandomStr(8),
    _readonly: boolean = readonly || false,
    _width: number = width ?? DEFAULT_CANVAS_WIDTH,
    _height: number = height ?? DEFAULT_CANVAS_HEIGHT;
  reloadCtxFunction(ctx as CanvasRenderingContext2D);
  setCanvasSize(canvasDom as HTMLCanvasElement, _width, _height, ctx);
  const engineResult = getPureObject({
    engine: getPureObject({
      ctx,
      id: _id,
      width: _width,
      height: _height,
      readonly: _readonly,
      canvas: canvasDom,
      canvasWrapDom: canvasWrapDom
    })
  });
  engineById.set(_id, setIdentify(engineResult, 'engine'));
  // const layerCore = useLayer(_id),
  //   modelCore = useModel(_id),
  //   shapeCore = useShape(_id),
  //   gridCore = useGrid(_id),
  //   graphCore = useGraph(_id),
  //   eventCore = useEvent(_id),
  //   configCore = useConfig(_id);
  const coreInstance = {
    ...useLayer(_id),
    ...useModel(_id),
    ...useShape(_id),
    ...useGrid(_id),
    ...useGraph(_id),
    ...useEvent(_id),
    ...useConfig(_id) 
  };
  setPropertyUnWritable(omitObjectProperty(Object.assign(engineResult, coreInstance), ['rootGrid']), Object.keys(coreInstance));
  microtask(() => {
    const { callEventCallback, createEventData, addModel } = engineResult;
    presetShape(_id);
    modelList && addModel(modelList);
    callEventCallback('after:engineInit', createEventData('after:engineInit', {
      object: engineResult,
      target: engineResult
    }));
  });
  return engineResult;
};

(window as any)['dogdog'] = { initEngine };

const engine = initEngine({ mountDom: document.getElementById('canvas-wrap'), width: 1500, height: 1500 });
// console.log(engine)
const { addModel, createShape, drawShape, updateShape, createLayer, engine: { ctx }, translate, updateModel, onEvent } = engine;
onEvent('after:engineInit', (data) => {
  console.log('event', data)
  // const control = createShape('controlPoint');
  const line = createShape('line');
  const arrow = createShape('arrow:normal');
  // drawShape(control);
  drawShape(line);
  drawShape(arrow);
  updateShape(arrow, { x: 200, y: 280 });
  updateShape(line, [{ x: 30, y: 30 }, { x: 60, y: 50 }, { x: 130, y: 200 }, { x: 200, y: 280 }], { lineWidth: 4 });
});
// onEvent('before:modelAdd', (data) => {
//   console.log('modalAdd', data)
// });
// onEvent('after:modelAdd', (data) => {
//   console.log('modalAdd', data)

// });
// onEvent('shape:click', (data) => {
//   console.log('shape.click', data)
// });
// onEvent('graph:click', (data) => {
//   console.log('graph.click', data)
// })
// onEvent('shape:mouseup', (data) => {
//   console.log('shape.mouseup', data)
// })
// onEvent('graph:mouseup', (data) => {
//   console.log('shape.mouseup', data)
// })
// onEvent('graph:mouseenter', (data) => {
//   console.log('graph.mouseenter', data);
// })
// onEvent('graph:mouseleave', (data) => {
//   console.log('graph.mouseleave', data);
// })
// onEvent('shape:mouseenter', (data) => {
//   console.log('shape.mouseenter', data);
// })
// onEvent('shape:mouseleave', (data) => {
//   console.log('shape.mouseleave', data);
// })
// onEvent('graph:mousemove', (data) => {
//   console.log('graph:mousemove', data);
// })
// onEvent('shape:mousemove', (data) => {
//   console.log('shape.mousemove', data);
// })
ctx.save();
ctx.strokeStyle = 'orange';
ctx.$strokeRect(0, 0, 1500, 1500);
ctx.restore();
const angleToRadian = (angle: number) => {
  return (Math.PI * angle) / 180;
};
const getTestModel1 = (): ModelOptions => {
  return {
    name: 'test1',
    draw: (ctx: EngineCtx | OffEngineCtx, p1, p2, p3) => {
      // ctx.beginPath();
      ctx.save();
      ctx.moveTo(200, 40);
      ctx.transform(1.4, 0, -0.3, 3, 290, 140);
      ctx.strokeStyle = 'green';
      ctx.quadraticCurveTo(200, 500, 400, 100);
      ctx.rotate(60 * Math.PI / 180)
      ctx.transform(0.2, 0, 0, 0.3, -120, 100);
      ctx.stroke();
      ctx.quadraticCurveTo(200, 300, 600, 100);
      ctx.stroke();
      ctx.restore();
    }
  }
};
const getTestModel2 = (): ModelOptions => {
  return {
    name: 'test2',
    draw: (ctx: EngineCtx | OffEngineCtx): void => {
      // console.log('%c画了2', 'color: orange')
      // ctx.save();
      // ctx.restore();
      // console.log(ctx.getTransform());
      ctx.save();
      // ctx.scale(2,2);
      ctx.lineWidth = 5;
      ctx.strokeStyle = 'orange';
      // ctx.transform(1,0,0,1,200,0); 
      ctx.beginPath();
      ctx.moveTo(300, 60);
      ctx.lineTo(420, 420);
      // ctx.lineTo(420, 450);
      ctx.closePath();
      // console.log('%c看看吧', 'background: red;padding:20px;', ctx.getTransform())
      ctx.stroke();
      // ctx.restore();
      // return;
      ctx.beginPath();
      // console.log('%c看看吧', 'background: green;padding:20px;', ctx.getTransform())
      ctx.arc(420, 420, 44, angleToRadian(45), angleToRadian(270));
      ctx.stroke();
      ctx.fillRect(100, 120, 20, 20);
      ctx.fillStyle = 'blue'
      ctx.fillRect(100, 200, 20, 20);
      ctx.beginPath();
      ctx.rotate(16 * Math.PI / 180);
      ctx.strokeStyle = 'red';
      ctx.moveTo(300, 80);
      ctx.lineTo(240, 40);
      ctx.stroke();
      ctx.restore();
    }
    ,
    // borderOptions: {
    //   paddingLeft: 10,
    //   paddingRight: 10,
    //   paddingTop: 20,
    //   paddingBottom: 20,
    //   borderDash: [5, 5],
    //   borderWidth: 2
    // }
  };
};
const getTestModel3 = () => {
  return {
    name: 'test3',
    draw: (ctx: EngineCtx | OffEngineCtx) => {
      // console.log('%c画了3', 'color: blue')
      // console.log('huale333')

      ctx.save();
      ctx.beginPath();
      // ctx.scale(2, 2)
      // ctx.lineWidth = 4;
      // console.log(ctx.lineWidth)
      const g = ctx.createLinearGradient(-50, -50, 100, 100);
      g.addColorStop(0, "orange");
      g.addColorStop(0.5, "blue");
      g.addColorStop(1, "black");
      ctx.strokeStyle = g;
      ctx.moveTo(-50, -50);
      ctx.lineTo(100, 100);
      // ctx.stroke();
      // ctx.strokeStyle = '';
      ctx.lineTo(-50, 100);
      ctx.closePath();
      ctx.stroke();
      console.log(img)
      // ctx.drawImage(img, 200, 200);
      ctx.restore();
      // ctx.putImageData()
    }
  }
}
const getTestModel4 = () => {
  return {
    name: 'test4',
    draw: (ctx: EngineCtx | OffEngineCtx, p1: any, refParams: any) => {
      // console.log('%c画了4', 'color: red')
      // console.log(ctx, p1, refParams)
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(600 - 2 * refParams, 430 - refParams);
      ctx.lineTo(500, 500);
      ctx.bezierCurveTo(500, 500, 874, 674, 732, 434);
      ctx.rotate(24 * Math.PI / 180);
      ctx.arc(603, 434, 24, angleToRadian(30), angleToRadian(150));
      ctx.closePath();
      ctx.strokeStyle = p1 > 0.5 ? 'green' : 'red';
      ctx.stroke();
      ctx.restore();
    }
  }
};
const getTestModel5 = () => {
  return {
    name: 'test5',
    draw: (ctx: EngineCtx | OffEngineCtx) => {
      ctx.save();
      ctx.strokeStyle = 'green';
      ctx.strokeRect(500, 500, 1, 1);
      ctx.restore();
      ctx.save();
      ctx.fillStyle = 'grey';
      ctx.lineWidth = 20;
      ctx.strokeRect(500, 500, 100, 100);
      ctx.moveTo(620, 600);
      ctx.lineTo(630, 680);
      ctx.lineTo(615, 690);
      ctx.closePath();
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();
    }
  }
}
const getTestModel6 = () => {
  return {
    name: 'test6',
    draw: (ctx: EngineCtx | OffEngineCtx) => {
      ctx.save();
      ctx.beginPath();
      ctx.rect(100, 100, 100, 100);
      // ctx.strokeStyle = 'yellow';
      // console.log(ctx.strokeStyle);
      ctx.stroke();
      ctx.beginPath();
      // ctx.transform(2,0.3,0.3,1,100,100);
      ctx.rect(100, 100, 100, 100);
      ctx.strokeStyle = 'red';
      ctx.stroke();
      // ctx.fill();
      ctx.transform(1, 0, 0, 1.1, 120, 80);
      // ctx.translate(100,100)
      ctx.rotate(-45 * Math.PI / 180);
      ctx.fillStyle = 'orange';
      ctx.fillRect(100, 100, 100, 100);
      // ctx.fillRect(200,200,200,200);
      ctx.restore();
      // ctx.save();
      // ctx.restore();
    }
  }
};
// ctx.$strokeRect(88,727,42,38);
// addModel([getTestModel1(), getTestModel2(), getTestModel3(), getTestModel4(), getTestModel5(), getTestModel6()]);
// for (let i = 4; i <= 4; i++) {
//   console.log(`%caddModel${i}${i}${i}${i}${i}`, 'background:orange;padding:5px;');
//   addModel(eval(`getTestModel${i}()`));
// }
addModel(getTestModel4(), 0.6, toCheckParams(30))
addModel(getTestModel1());
addModel(getTestModel2());
addModel(getTestModel3());
addModel(getTestModel5());
const helloo = (window as any)['helloo'];
ctx.strokeStyle = 'red';
// ctx.$strokeRect(570, 400, 100,100);
// console.log(helloo)
// ctx.$strokeRect(helloo.minX, helloo.minY, helloo.maxX - helloo.minX, helloo.maxY - helloo.minY);
// console.log('%c11111', 'background:orange;padding:5px;')
// addModel(getTestModel1());
// console.log('%c22222', 'background:orange;padding:5px;')
// addModel(getTestModel2());
// console.log('%c33333', 'background:orange;padding:5px;')
// addModel(getTestModel3());
// console.log('%c44444', 'background:orange;padding:5px;')
// addModel(getTestModel4());
// console.log('%c55555', 'background:orange;padding:5px;')
// addModel(getTestModel5());
// console.log('%cend', 'background:orange;padding:5px;')
// addModel(getTestModel6());
const newLayer = createLayer(1, false);
const shape1 = createShape('test1');
const shape2 = createShape('test2');
const shape3 = createShape('test3');
const shape4 = createShape('test4', { layer: newLayer });
// const shape44 = createShape('test4');
const shape5 = createShape('test5');
const shape6 = createShape('test6');
// console.log(shape5)
const now = performance.now();
drawShape(shape1);

// ctx.$beginPath();
// const { x, y, width, height } = (window as any).tess;
// ctx.$strokeRect(x, y, width, height);
// for (const [idx, point] of (window as any)[`arcTest`].entries()) {
//   console.log(point)
//   if (!idx) {
//     // ctx.$arc(point.x, point.y, 50, 0, 360 * Math.PI / 180);
//     ctx.$moveTo(point.x, point.y);
//     // ctx.$arc(point.x, point.y, (window as any)['transRadius'], 0, 2 * Math.PI);
//   } else {
//     ctx.$lineTo(point.x, point.y);
//   }
//   const map = {
//     '0': 'black',
//     '1': 'pink',
//     '2': 'orange',
//     '3': 'yellow'
//   };
//   // ctx.strokeStyle = (map as any)[idx];
//   // ctx.$strokeRect(point.x, point.y, 1, 200);
// }
// ctx.closePath()
// ctx.$stroke();
// ctx.$beginPath();
// ctx.strokeStyle = 'pink';
// for (const [idx, point] of (window as any).testtt.entries()) {
//   if (!idx) {
//     ctx.$moveTo(point.x, point.y);
//   } else {
//     ctx.$lineTo(point.x, point.y)
//   }
// }
// ctx.$stroke();

// ctx.beginPath();
// // ctx.$arc(184, 146, 50, 0, 360 * Math.PI / 180);
// // ctx.$stroke();
// // ctx.beginPath();
// ctx.$moveTo(100, 70);
// ctx.$lineTo(100, 20)
// ctx.$lineTo(135, 35);
// ctx.$lineTo(150, 70);
// // ctx.closePath();
// ctx.$stroke();
drawShape(shape2, { x: 500, y: 400 });
drawShape(shape3, { x: 100, y: 300 });
// const [rx, ry] = [Math.round(Math.random() * 1000), Math.round(Math.random() * 1000)];
drawShape(shape4);
// drawShape(shape4, { x: 500, y: 200 })
// ctx.$strokeRect(rx, ry, 100, 100)
drawShape(shape5, { x: 800, y: 200 });
drawShape(shape6);

let idd = 1;
// ctx.save();
let iddd = setInterval(() => {
  idd = idd + 1;
  shape4.rotate(idd * 2);
  if (idd >= 60) {
    shape4.moveTo(shape4.graphics.ox + 6, shape4.graphics.oy + 4);
    clearInterval(iddd);
    callARotateMove(shape4);
  };
  // console.log(idd)
  // const { ox, oy, width, height } = shape4._graphics;
  // const { ox: cOx, oy: cOy, width: cWidth, height: cHeight } = shape4.graphics;
  // ctx.translate(cOx + Math.round(cWidth / 2), cOy + Math.round(cHeight / 2));
  // ctx.rotate(idd * Math.PI / 180);
  // shape4.moveTo(-width / 2, -height / 2);
  // idd++;
  // idd > 30 && clearInterval(iddd);
  // ctx.restore();
}, 30);
function callARotateMove(shape: Shape) {
  let idx = 0;
  let cid = setInterval(() => {
    if (++idx) {
      idx <= 100 && shape.moveTo(shape.graphics.ox + 10, shape.graphics.oy);
      idx >= 100 && shape.moveTo(shape.graphics.ox - 10, shape.graphics.oy - 4)
    }
    if (idx > 160) {
      clearInterval(cid);
      updateShape(shape4, 0.3, 60);
      callATranslate();
      setTimeout(() => {
        updateShape(shape4, 0.6, 30);
      }, 2000);
    };
  }, 20);
}
const cur = performance.now();
// console.log(now, cur, cur - now);
// ctx.putImageData((window as any)[`testtest`], 600,500);
// ctx.$strokeRect(100, 100, 551, 282)
// let id: string | number | NodeJS.Timer = undefined;
function callATranslate() {
  let idx = 0;
  let id = setInterval(() => {
    // console.log(ctx.getTransform())
    idx++;
    // idx > 0 && clearInterval(id);
    // return;
    // return;
    shape4.moveTo(idx * 3 + 480, idx * 3 + 680);
    idx >= 100 && clearInterval(id)
    // idx >= 220 && ctx.translate(-100, -100);
    if (idx === 100) {
      callTranslate();
      // ctx.save();
      // ctx.strokeStyle = 'blue';
      // ctx.$strokeRect(0, 0, 1500, 1500);
      // ctx.restore();
    }

    //   // idx < 100 && shape3.moveTo(idx * 5 + 100, idx * 5 + 100);
    //   // shape4.moveTo(idx * 4 + 200, idx * 4 + 200);
  }, 10);
}


function callTranslate() {
  let idx = 0;
  let t = {};
  const id = setInterval(() => {
    idx++;
    idx < 30 && translate(12, 12, t);
    idx >= 38 && translate(-4, -8, t);
    if (idx >= 60) {
      clearInterval(id);
      console.log({
        'newLayerCtx': newLayer.ctx,
        'oldLayerCtx': ctx,
        'newLayer': newLayer.ctx.getTransform(),
        'oldLayer': ctx.getTransform()
      })
      // console.log(newLayer, ctx)
      setTimeout(() => {
        moveAShape();
      }, 3000);
    }
  }, 10);
}
function moveAShape() {
  // return;
  // return;
  // return;
  // return 'ss'
  let idx = 0;
  let id = setInterval(() => {
    idx++;
    shape1.moveTo(idx * 3 - 30, idx * 4 - 30);
    if (idx >= 2) {
      clearInterval(id);
      // moveShape2();
      ctx.save();
      ctx.strokeStyle = 'green';
      ctx.$strokeRect(0, 0, 1500, 1500);
      // ctx.strokeStyle = 'red';
      // ctx.$moveTo(281, 187);
      // ctx.$lineTo(796, 187);
      // ctx.$lineTo(796, 1031);
      // ctx.$lineTo(281, 1031);
      // ctx.closePath();
      // ctx.$stroke();
      ctx.restore();
    };
  }, 10);
  return true;
}
const arr: any[] = [];
function moveShape2() {
  // return;
  let idx = 0;
  let id = setInterval(() => {
    idx++;

    if (idx < 30) {
      shape2.moveTo(shape2.graphics.ox + 4, shape2.graphics.oy - 5);
    } else if (idx >= 30 && idx <= 60) {
      if (idx >= 52) {
        arr.push([shape2.graphics.ox + 10, shape2.graphics.oy + 12]);
        (window as any)['lalala'] = [...arr];
      }
      shape2.moveTo(shape2.graphics.ox + 10, shape2.graphics.oy + 12);
    } else {
      ctx.save();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'green';
      // for (const item of arr) {
      //   ctx.$strokeRect(item[0], item[1], 300, 1);
      // }
      ctx.restore();
      clearInterval(id);
    }
  }, 100)
}
