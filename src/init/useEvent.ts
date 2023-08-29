import { Options } from "html-webpack-plugin";
import { Shape } from "../shape/shape";
import { isFunction } from "../utils/is";
import { Graph } from "./useGraph";
import { EngineOptions, InitEngineResult } from "../engineFn";

type Func = (...args: any[]) => any;
type UseEvent = (engineId: string) => UseEventRes;
type EngineLifeCycle = 'after:engineInit';
type ModelLifeCycle = 'before:modelAdd' | 'after:modelAdd';
type ShapeLifeCycle = 'before:shapeCreate' | 'after:shapeCreate' | 'before:shapeUpdate' | 'after:shapeUpdate';
type LifeCycle = EngineLifeCycle | ModelLifeCycle | ShapeLifeCycle;
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
  $event?: Event;
  object?: Shape | Graph | EngineOptions | InitEngineResult;
  [key: string]: any;
};

const eventInsByEngineId = new Map();

export const useEvent: UseEvent = (engineId: string): UseEventRes => {
  const funcsByEvent = eventInsByEngineId.get(engineId) || eventInsByEngineId.set(engineId, new Map<EventType, Set<Func>>()).get(engineId);
  const onEvent: OnEvent = (eventType: EventType, func: Func) => {
    if (!isFunction(func)) return;
    const set: Set<Func> = funcsByEvent.get(eventType) || new Set();
    funcsByEvent.set(eventType, set.add(func));
  }
  const removeEvent: RemoveEvent = (eventType: EventType, func: Func) => {
    if (!isFunction(func)) return;
    const set = funcsByEvent.get(eventType);
    set && set.delete(func);
  }
  const removeAllEvent: RemoveAllEvent = () => {
    for (const elem of funcsByEvent.values()) {
      elem.clear();
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