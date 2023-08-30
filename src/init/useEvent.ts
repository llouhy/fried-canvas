import { Options } from "html-webpack-plugin";
import { Shape } from "../shape/shape";
import { isFunction, isShape } from "../utils/is";
import { Graph, graphByEngineId } from "./useGraph";
import { EngineOptions, InitEngineResult, engineById } from "../engineFn";
import { shapeById } from "./useShape";

type Func = (...args: any[]) => any;
type UseEvent = (engineId: string) => UseEventRes;
type EngineLifeCycle = 'after:engineInit';
type ModelLifeCycle = 'before:modelAdd' | 'after:modelAdd';
type ShapeLifeCycle = 'before:shapeCreate' | 'after:shapeCreate' | 'before:shapeUpdate' | 'after:shapeUpdate';
type LifeCycle = EngineLifeCycle | ModelLifeCycle | ShapeLifeCycle;
type DefaultEvent = 'mousedown' | 'mouseup' | 'click' | 'dbClick' | 'contextMenu';
type GraphEvent = 'graph:mousedown' | 'graph:mouseup' | 'graph:click' | 'graph:dbClick' | 'graph:contextMenu';
type ShapeEvent = 'shape:mousedown' | 'shape:mouseup' | 'shape:click' | 'shape:dbClick' | 'shape:contextMenu' | 'shape:rotateStart' | 'shape:rotateEnd' | 'shape:moveStart' | 'shape:moveEnd';
type EventType = GraphEvent | ShapeEvent | LifeCycle;
type CallEventCallback = (eventType: EventType, eventData: EventData) => any;
export type OnEvent = (eventType: EventType, func: Func) => void;
export type RemoveEvent = (eventType: EventType, func: Func) => void;
export type RemoveAllEvent = () => void;
export type CreateEventData = (eventType: EventType, options: Omit<EventData, 'eventType'>) => EventData;
export type UseEventRes = {
  onEvent: OnEvent;
  removeEvent: RemoveEvent;
  removeAllEvent: RemoveAllEvent;
  callEventCallback: CallEventCallback;
  createEventData: CreateEventData;
};
type EventData = {
  eventType: EventType;
  $event?: MouseEvent;
  object?: Shape | Graph | EngineOptions | InitEngineResult;
  [key: string]: any;
};

const eventInsByEngineId = new Map();

export const useEvent: UseEvent = (engineId: string): UseEventRes => {
  const funcsByEvent = eventInsByEngineId.get(engineId) || eventInsByEngineId.set(engineId, new Map<EventType, Set<Func>>()).get(engineId);
  const defaultEvent: { [key in DefaultEvent]: { shape: Func; graph: Func; } } = {
    ['mousedown']: { shape: null, graph: null },
    ['mouseup']: { shape: null, graph: null },
    ['click']: { shape: null, graph: null },
    ['dbClick']: { shape: null, graph: null },
    ['contextMenu']: { shape: null, graph: null },
  };
  const setDefaultEvent = (handleObject: 'graph' | 'shape', eventName: DefaultEvent) => {
    const { engine } = engineById.get(engineId);
    const getPositionInfo = ($event: MouseEvent) => {
      const graph = graphByEngineId.get(engineId);
      const { offsetX, offsetY } = $event;
      return {
        positionX: offsetX - graph.translateX,
        positionY: offsetY - graph.translateY
      }
    }
    const getShapeInfo = (position: { positionX: number; positionY: number }) => {
      let target = { index: -Infinity };
      for (const elem of shapeById.values()) {
        if (elem.isPointInTheShape(position.positionX, position.positionY) && elem.index > target.index) {
          target = elem;
        }
      }
      return isShape(target) ? { shape: target } : { shape: null };
    };

    const callback = ($event: MouseEvent) => {
      const positionInfo = getPositionInfo($event);
      const shapeInfo = getShapeInfo(positionInfo);
      const object = handleObject === 'graph' ? graphByEngineId.get(engineId) : shapeInfo.shape;
      if (!object) return;
      const eventData = createEventData(`${handleObject}:${eventName}`, {
        $event,
        object,
        engine: engine,
        graph: graphByEngineId.get(engineId),
        ...positionInfo,
        ...shapeInfo
      });
      // for (const elem of ['shape', 'graph']) {
        callEventCallback(`${handleObject}:${eventName}` as EventType, eventData);
      // }
    }
    engine.canvas.addEventListener(eventName, callback);
    defaultEvent[eventName][handleObject] = callback;
  }
  const onEvent: OnEvent = (eventType: EventType, func: Func) => {
    // debugger
    if (!isFunction(func)) return;
    const set: Set<Func> = funcsByEvent.get(eventType) || new Set();
    const [handleObject, eventName] = eventType.split(':');
    funcsByEvent.set(eventType, set.add(func));
    if (eventName in defaultEvent && !defaultEvent[eventName as DefaultEvent][handleObject as 'shape' | 'graph']) {
      setDefaultEvent(handleObject as 'graph' | 'shape', eventName as DefaultEvent);
    }
  }
  const removeEvent: RemoveEvent = (eventType: EventType, func: Func) => {
    if (!isFunction(func)) return;
    const set = funcsByEvent.get(eventType);
    set && set.delete(func);
  }
  const removeAllEvent: RemoveAllEvent = () => {
    const { engine: { canvas } } = engineById.get(engineId);
    for (const elem of funcsByEvent.values()) {
      elem.clear();
    }
    for (const key in defaultEvent) {
      for (const handleObject in defaultEvent[key as DefaultEvent]) {
        const func = defaultEvent[key as DefaultEvent][handleObject as 'shape' | 'graph']
        if (func) {
          canvas.removeEventListener(key, func);
        }
      }
    }
  }
  const callEventCallback: CallEventCallback = (eventType, eventData) => {
    const set = funcsByEvent.get(eventType) || new Set();
    for (const elem of set.values()) {
      elem(eventData);
    }
  }
  const createEventData: CreateEventData = (eventType, options) => {
    return {
      eventType,
      ...options
    }
  }
  return {
    onEvent,
    removeEvent,
    removeAllEvent,
    createEventData,
    callEventCallback,
  }
};