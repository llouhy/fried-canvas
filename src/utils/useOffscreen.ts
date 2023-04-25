import { reloadCtxFunction } from '../init/context';
const offCanvasByWidthHeight = new Map<string, OffscreenCanvas>();

export const useOffscreenCanvas = () => {
  const clear = () => {
    offCanvasByWidthHeight.clear();
  };
  const destroy = (width: number, height: number) => {
    return offCanvasByWidthHeight.delete(`${width}_${height}`);
  };
  const get = (width: number, height: number): OffscreenCanvas => {
    const key = `${width}_${height}`;
    const offCanvas =
      offCanvasByWidthHeight.get(key) || offCanvasByWidthHeight.set(key, new OffscreenCanvas(width, height)).get(key);
    // !offCanvas.isReload && reloadCtxFunction(offCanvas)
    return offCanvas as OffscreenCanvas;
  };
  return {
    get,
    clear,
    destroy
  };
};
