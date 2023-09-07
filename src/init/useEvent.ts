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
type BrowserEvent = 'mousedown' | 'mouseup' | 'click' | 'dbClick' | 'contextMenu';
type DefaultEvent = `${'graph' | 'shape'}:${BrowserEvent}`
type GraphEvent = `graph:${BrowserEvent}`;
type ShapeEvent = `shape:${BrowserEvent}` | 'shape:rotateStart' | 'shape:rotateEnd' | 'shape:moveStart' | 'shape:moveEnd';
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

const eventCoreByEngineId = new WeakMap<InitEngineResult, UseEventRes>();
const eventInsByEngineId = new Map<string, Map<EventType, Set<Func>>>();

export const useEvent: UseEvent = (engineId: string): UseEventRes => {
  const engineInstance = engineById.get(engineId);
  if (eventCoreByEngineId.get(engineInstance)) return eventCoreByEngineId.get(engineInstance);
  const funcsByEvent = eventInsByEngineId.set(engineId, new Map<EventType, Set<Func>>()).get(engineId);
  const defaultEvent: { [key in BrowserEvent]: Func } = {
    ['mousedown']: null,
    ['mouseup']: null,
    ['click']: null,
    ['dbClick']: null,
    ['contextMenu']: null,
  };
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
  const setDefaultEvent = (eventName: BrowserEvent) => {
    const { engine } = engineById.get(engineId);
    const callback = ($event: MouseEvent) => {
      const positionInfo = getPositionInfo($event);
      const shapeInfo = getShapeInfo(positionInfo);
      const targetEvent: DefaultEvent = `${shapeInfo.shape ? 'shape' : 'graph'}:${eventName}`;
      const eventData = createEventData(targetEvent, {
        $event,
        object: shapeInfo.shape || graphByEngineId.get(engineId),
        engine: engine,
        graph: graphByEngineId.get(engineId),
        ...positionInfo,
        ...shapeInfo
      });
      callEventCallback(targetEvent, eventData);
    }
    engine.canvas.addEventListener(eventName, callback);
    defaultEvent[eventName] = callback;
  }
  const onEvent: OnEvent = (eventType: EventType, func: Func) => {
    if (!isFunction(func)) return;
    const set: Set<Func> = funcsByEvent.get(eventType) || new Set();
    const [handleObject, eventName] = eventType.split(':');
    funcsByEvent.set(eventType, set.add(func));
    if (eventName in defaultEvent && !defaultEvent[eventName as BrowserEvent]) {
      setDefaultEvent(eventName as BrowserEvent);
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
      const func = defaultEvent[key as BrowserEvent];
      canvas.removeEventListener(key, func);
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
  return eventCoreByEngineId.set(engineInstance, {
    onEvent,
    removeEvent,
    removeAllEvent,
    createEventData,
    callEventCallback,
  }).get(engineInstance);
};