// const offCanvas = new OffscreenCanvas(0, 0);
// map.set({}, new OffscreenCanvas(0, 0));
export const useOffCanvas = () => {
  const offCanvas = new OffscreenCanvas(0, 0);
  return {
    get: (width: number, height: number) => {
      offCanvas.width = width;
      offCanvas.height = height;
      return offCanvas;
    }
  }
  // const canvas = new OffscreenCanvas(width, height);
  // map.set([width, height], canvas);
  // return canvas;

};