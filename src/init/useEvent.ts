import { Shape } from "../shape/shape";
import { isFunction, isShape } from "../utils/is";
import { Graph, graphByEngineId } from "./useGraph";
import { EngineOptions, InitEngineResult, engineById } from "../engineFn";

type Func = (...args: any[]) => any;
type UseEvent = (engineId: string) => UseEventRes;
type EngineLifeCycle = 'after:engineInit';
type ModelLifeCycle = 'before:modelAdd' | 'after:modelAdd';
type ShapeLifeCycle = 'before:shapeCreate' | 'after:shapeCreate' | 'before:shapeUpdate' | 'after:shapeUpdate' | 'before:shapeDraw' | 'after:shapeDraw';
type LifeCycle = EngineLifeCycle | ModelLifeCycle | ShapeLifeCycle;
type BrowserEvent = 'mousedown' | 'mouseup' | 'click' | 'dbClick' | 'contextMenu' | 'mouseenter' | 'mouseleave' | 'mousemove';
type BrowserMoveEvent = 'mouseenter' | 'mouseleave' | 'mousemove';
type DefaultEvent = `${'graph' | 'shape'}:${BrowserEvent}`
type GraphEvent = `graph:${BrowserEvent}`;
type ShapeEvent = `shape:${BrowserEvent}`;
// type ShapeEvent = `shape:${BrowserEvent}` | 'shape:rotateStart' | 'shape:rotateEnd' | 'shape:moveStart' | 'shape:moveEnd';
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
  target?: Shape | Graph | EngineOptions | InitEngineResult;
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
    ['mouseenter']: null,
    ['mouseleave']: null,
    ['mousemove']: null
  };
  const getPositionInfo = ($event: MouseEvent) => {
    const graph = graphByEngineId.get(engineId);
    const { offsetX, offsetY } = $event;
    return {
      positionX: offsetX - graph.translateX,
      positionY: offsetY - graph.translateY
    }
  }
  const getShapeInfo = (position: { positionX: number; positionY: number }, $event: MouseEvent) => {
    let target = { index: -Infinity };
    const { offsetX, offsetY } = $event;
    const grid = engineInstance.getPointInGrid({ x: offsetX, y: offsetY });
    if (grid) {
      for (const elem of grid.shapes || []) {
        if (elem.isPointInTheShape(position.positionX, position.positionY) && elem.index > target.index) {
          target = elem;
        }
      }
    }
    return isShape(target) ? { shape: target } : { shape: null };
  };
  const setMoveEvent = (eventName: BrowserMoveEvent) => {
    const { engine } = engineById.get(engineId), mouseInShapeSet = new Set();
    let isMouseInGraph = false;
    const callback = ($event: MouseEvent) => {
      const positionInfo = getPositionInfo($event);
      const shape = getShapeInfo(positionInfo, $event).shape;
      let isGraphMove = false;
      if (shape) {
        let isEnter = false;
        for (const elem of mouseInShapeSet.values()) {
          if (elem !== shape) {
            callEventCallback('shape:mouseleave', createEventData('shape:mouseleave', {
              engine,
              $event,
              shape: elem,
              target: elem,
              graph: graphByEngineId.get(engineId),
              ...positionInfo
            }));
            mouseInShapeSet.delete(elem);
          }
        }
        if (!mouseInShapeSet.has(shape)) {
          mouseInShapeSet.add(shape);
          callEventCallback('shape:mouseenter', createEventData('shape:mouseenter', {
            shape,
            engine,
            $event,
            target: shape,
            graph: graphByEngineId.get(engineId),
            ...positionInfo
          }));
          isEnter = true;
        }
        isEnter || callEventCallback('shape:mousemove', createEventData('shape:mousemove', {
          engine,
          $event,
          shape,
          target: shape,
          graph: graphByEngineId.get(engineId),
          ...positionInfo
        }));
      } else {
        for (const elem of mouseInShapeSet.values()) {
          mouseInShapeSet.delete(elem);
          callEventCallback('shape:mouseleave', createEventData('shape:mouseleave', {
            engine,
            $event,
            shape: elem,
            target: elem,
            graph: graphByEngineId.get(engineId),
            ...positionInfo
          }));
        }
        isGraphMove = true;
      }
      if (!isMouseInGraph) {
        callEventCallback('graph:mouseenter', createEventData('graph:mouseenter', {
          engine,
          $event,
          target: graphByEngineId.get(engineId),
          graph: graphByEngineId.get(engineId),
          eventType: 'graph:mouseleave',
          ...positionInfo
        }));
        const leaveGraphCallback = ($event: MouseEvent) => {
          isMouseInGraph = false;
          callEventCallback('graph:mouseleave', {
            engine,
            $event,
            target: graphByEngineId.get(engineId),
            graph: graphByEngineId.get(engineId),
            eventType: 'graph:mouseleave',
            ...getPositionInfo($event)
          });
          engine.canvas.removeEventListener('mouseleave', leaveGraphCallback);
        };
        isMouseInGraph = true;
        engine.canvas.addEventListener('mouseleave', leaveGraphCallback);
      }
      isGraphMove && callEventCallback('graph:mousemove', createEventData('graph:mousemove', {
        engine,
        $event,
        target: graphByEngineId.get(engineId),
        graph: graphByEngineId.get(engineId),
        ...positionInfo
      }));
    };
    engine.canvas.addEventListener('mousemove', callback);
    defaultEvent['mousemove'] = callback;
  }
  const setDefaultEvent = (eventName: BrowserEvent) => {
    if (['mouseenter', 'mouseleave', 'mousemove'].includes(eventName)) {
      defaultEvent['mousemove'] || setMoveEvent(eventName as BrowserMoveEvent);
      return;
    }
    const { engine } = engineById.get(engineId);
    const callback = ($event: MouseEvent) => {
      const positionInfo = getPositionInfo($event);
      const shapeInfo = getShapeInfo(positionInfo, $event);
      const targetEvent: DefaultEvent = `${shapeInfo.shape ? 'shape' : 'graph'}:${eventName}`;
      callEventCallback(targetEvent, createEventData(targetEvent, {
        $event,
        engine,
        target: shapeInfo.shape || graphByEngineId.get(engineId),
        graph: graphByEngineId.get(engineId),
        ...positionInfo,
        ...shapeInfo
      }));
    }
    engine.canvas.addEventListener(eventName, callback);
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