import { getTypeStr } from './common';
import { identifyMap } from '../definition/identify';

export const isFunction = (value: any) => {
  return typeof value === 'function';
};

export const isArray = (value: any) => {
  return Array.isArray(value);
};

export const isString = (value: any) => {
  return getTypeStr(value) === 'string';
};

export const isNAN = (value: any) => {
  return Number.isNaN(value);
};

export const isNumber = (value: any) => {
  return getTypeStr(value) === 'number';
};

export const isError = (value: any) => {
  return value.__isError__ === identifyMap.error;
};

export const isShape = (value: any) => {
  return value.__isShape__ === identifyMap.shape;
};

export const isEngine = (value: any) => {
  return value.__isEngine__ === identifyMap.engine;
};

export const isModel = (value: any) => {
  return value.__isModel__ === identifyMap.model;
};

export const isSuccess = (value: any) => {
  return !isError(value);
};
