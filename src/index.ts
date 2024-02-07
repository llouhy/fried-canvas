import { initEngine as fn } from './engineFn';
(window as any)['llou-engine'] = fn;
export const initEngine = fn;
