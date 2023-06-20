// const offCanvas = new OffscreenCanvas(0, 0);
// map.set({}, new OffscreenCanvas(0, 0));
export const useOffCanvas = () => {
  const offCanvas = new OffscreenCanvas(0, 0);
  return {
    get: (width: number, height: number) => {
      const dpr = window.devicePixelRatio;
      offCanvas.width = Math.round(width * dpr);
      offCanvas.height = Math.round(height * dpr);
      return offCanvas;
    }
  }
  // const canvas = new OffscreenCanvas(width, height);
  // map.set([width, height], canvas);
  // return canvas;

};