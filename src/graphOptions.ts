import { ModelDrawFuncArgs } from './init/useModel';
import type { EngineCtx, OffEngineCtx } from './rewriteFn/type';

export type BorderOptions = {
  needBorder?: boolean;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  borderDash?: [number, number];
  borderWidth?: number;
  borderColor?: string;
  radius?: number;
};

export type Graphics = {
  ox: number;
  oy: number;
  width: number;
  height: number;
};

export type ModelOptions = {
  name: string;
  draw: (ctx: EngineCtx | OffEngineCtx, ...args: any[]) => any;
  borderOptions?: BorderOptions;
  graphics?: Graphics;
  imageData?: ImageData;
  readonly __draw__?: (ctx: EngineCtx | OffEngineCtx, ...args: any[]) => any;
  checkArg?: {
    checkArgMap: Map<number, ModelDrawFuncArgs>;
    checkArgs: ModelDrawFuncArgs[];
    hash: string;
  };
  drawArgs?: ModelDrawFuncArgs[];
};
