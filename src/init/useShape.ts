import { graph } from '../definition/identify';
import { LayerIns } from '../definition/layer';
import { InitEngineResult, engineById } from '../engineFn';
import type { ModelOptions } from '../graphOptions';
import type { Boundary, EngineCtx, Point } from '../rewriteFn/type';
import { ParentInfo, Shape, getShape as getShapeIns } from '../shape/shape';
import { isNumber } from '../utils/is';
import { getGraphicsWithBorder } from '../utils/math';
import { useOffscreenCanvas } from '../utils/useOffscreen';
import { reloadCtxFunction } from './context';
import { useEvent } from './useEvent';
import { useGrid } from './useGrid';
import { layersByEngine } from './useLayer';
import { ModelDrawFuncArgs, sumModelGraphics } from './useModel';

export type DrawShape = (shape: Shape, placePoint?: Point) => Shape | undefined;
export type GetShape = (id?: string) => undefined | Shape | Shape[];
export type UpdateShape = (shape: Shape, ...args: ModelDrawFuncArgs[]) => Shape;
export type CreateShape = (modelName: string, o?: { data?: any; model?: ModelOptions; index?: number; layer?: LayerIns; }) => Shape;
export type UpdateShapeAndMove = (shape: Shape, placePoint: Point, ...args: ModelDrawFuncArgs[]) => Shape;
export type RemoveParent = (child: Shape) => Shape;
export type SetChild = (child: Shape, parent: Shape, options: ParentInfo) => Shape;
export type UseShapeRes = {
  drawShape: DrawShape;
  getShape: GetShape;
  updateShape: UpdateShape;
  createShape: CreateShape;
  updateShapeAndMove: UpdateShapeAndMove;
  removeParent: RemoveParent;
  setChild: SetChild;
};
export type UseShape = (engineId: string) => UseShapeRes;

export const shapeById = new Map<string, Shape>();
export const shapeCoreByEngineId = new WeakMap<InitEngineResult, UseShapeRes>();
export const useShape: UseShape = (engineId) => {
  const engineInstance = engineById.get(engineId);
  if (shapeCoreByEngineId.get(engineInstance)) return shapeCoreByEngineId.get(engineInstance);
  const drawShape: DrawShape = (shape, placePoint) => {
    try {
      const { callEventCallback, createEventData } = useEvent(engineId);
      callEventCallback('before:shapeDraw', createEventData('before:shapeDraw', {
        target: shape,
        placePoint: placePoint,
        engine: engineInstance
      }));
      const { updateShapeToGrid } = useGrid(engineId);
      const shapeId = shape.draw(shape.ctx, placePoint);
      updateShapeToGrid(shape, shape.graphicsWithBorder);
      shapeById.set(shapeId, shape);
      callEventCallback('after:shapeDraw', createEventData('after:shapeDraw', {
        target: shape,
        placePoint: placePoint,
        engine: engineInstance
      }));
      return shape;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(`create Shape error: unknown error`);
    }
  };
  const getShape: GetShape = (shapeId) => {
    if (!shapeId) {
      const result = [];
      for (const [key, val] of shapeById.entries()) {
        if (key.split(':')[0] !== engineId) continue;
        result.push(val);
      }
      return result;
    }
    return shapeById.get(shapeId);
  };
  const createShape: CreateShape = (modelName, options = {}) => {
    const { callEventCallback, createEventData } = useEvent(engineId);
    callEventCallback('before:shapeCreate', createEventData('before:shapeCreate', {
      target: engineById.get(engineId),
      engine: engineById.get(engineId),
      modelName,
      options
    }));
    const shape = getShapeIns({ modelName, engineId, data: options.data, model: options.model, index: options.index });
    engineInstance.appendToLayer(shape, options.layer || layersByEngine.get(engineInstance).find(elem => elem.isDefault));
    callEventCallback('after:shapeCreate', createEventData('after:shapeCreate', {
      target: shape,
      engine: engineById.get(engineId),
      modelName,
      options
    }));
    return shape;
  };
  const updateShape: UpdateShape = (shape, ...args) => {
    const { callEventCallback, createEventData } = useEvent(engineId);
    const $model = shape.$model;
    const { engine: { width, height }, repaintInfluencedShape } = engineInstance;
    const isResize = [...$model.checkArg.checkArgMap.keys()].some(idx => shape.drawArgs[idx] !== args[idx]);
    const { updateShapeToGrid } = useGrid(shape.belongEngineId);
    callEventCallback('before:shapeUpdate', createEventData('before:shapeUpdate', {
      target: shape,
      engine: engineById.get(engineId),
      args
    }));
    if (!isResize) {
      shape.drawArgs = args;
      repaintInfluencedShape(shape.graphicsWithBorder, shape);
      shape.draw(shape.ctx, { x: shape.graphics.ox, y: shape.graphics.oy }, shape.rotateDeg);
      updateShapeToGrid(shape, shape.graphicsWithBorder);
      callEventCallback('after:shapeUpdate', createEventData('after:shapeUpdate', {
        target: shape,
        engine: engineById.get(engineId),
        args
      }));
      return shape;
    }
    let offCanvas = useOffscreenCanvas().get(width, height),
      offCtx = offCanvas!.getContext('2d') as OffscreenCanvasRenderingContext2D;
    reloadCtxFunction<OffscreenCanvasRenderingContext2D>(offCtx);
    const { graphics } = sumModelGraphics(offCtx, shape.$model.__draw__, ...args);
    shape._graphics = graphics;
    shape.graphics = { ...shape.graphics, width: shape._graphics.width, height: shape._graphics.height };
    shape.drawArgs = args;
    repaintInfluencedShape(shape.graphicsWithBorder || getGraphicsWithBorder(shape.graphics, shape.borderOptions), shape);
    shape.draw(shape.ctx, { x: shape.graphics.ox, y: shape.graphics.oy }, shape.rotateDeg);
    updateShapeToGrid(shape, shape.graphicsWithBorder);
    callEventCallback('after:shapeUpdate', createEventData('after:shapeUpdate', {
      target: shape,
      engine: engineById.get(engineId),
      args
    }));
    offCanvas = null;
    offCtx = null;
    return shape;
  };
  const updateShapeAndMove: UpdateShapeAndMove = (shape, placePoint, ...args) => {
    updateShape(shape, ...args).moveTo(placePoint.x, placePoint.y);
    return shape;
  };
  const removeParent: RemoveParent = (child) => {
    if (!child.parentInfo) return;
    let parent = child.parentInfo.parent, targetIdx;
    for (let i = 0; i < parent.children.length; i++) {
      if (parent.children[i] === child) {
        targetIdx = i;
        break;
      }
    }
    const deleteEle = (isNumber(targetIdx) && parent.children.splice(targetIdx, 1)) || [];
    deleteEle[0]?.parentInfo && (deleteEle[0].parentInfo = null);
    return deleteEle[0];
  }
  const setChild: SetChild = (child, parent, options) => {
    parent.children = [...new Set([...parent.children || [], child])];
    if (child?.parentInfo?.parent !== parent) { removeParent(child) }
    child.parentInfo = {
      px: options.px || 0,
      py: options.py || 0,
      parent
    };
    parent.moveTo(parent.graphics.ox, parent.graphics.oy);
    return parent;
  }
  return shapeCoreByEngineId.set(engineInstance, {
    updateShapeAndMove,
    createShape,
    updateShape,
    drawShape,
    removeParent,
    setChild,
    getShape
  }).get(engineInstance);
};
