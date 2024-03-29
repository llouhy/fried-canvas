import { getType } from './common';
import { observe, engine, error, model, shape } from '../definition/identify';

export const isObject = (value: any) => {
  return getType(value) === 'object';
}

export const isFunction = (value: any) => {
  return typeof value === 'function';
};

export const isArray = (value: any) => {
  return Array.isArray(value);
};

export const isString = (value: any) => {
  return getType(value) === 'string';
};

export const isNAN = (value: any) => {
  return Number.isNaN(value);
};

export const isNumber = (value: any) => {
  return getType(value) === 'number';
};

export const isError = (value: any) => {
  return value.__isError__ === error;
};

export const isShape = (value: any) => {
  return value.__isShape__ === shape;
};

export const isEngine = (value: any) => {
  return value.__isEngine__ === engine;
};

export const isModel = (value: any) => {
  return value.__isModel__ === model;
};

export const isObserve = (value: any) => {
  return value?.__isObserve__ === observe;
}

export const isSuccess = (value: any) => {
  return !isError(value);
};

export const isCanvas = (value: any) => {
  return value instanceof HTMLCanvasElement;
}
