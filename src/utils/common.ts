export const getTypeStr = (value: any) => {
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
};

export const setCanvasSize = (canvas: HTMLCanvasElement, width: number, height: number) => {
  canvas.setAttribute('width', width + '');
  canvas.setAttribute('height', height + '');
};

export const getPureObject = (obj: { [key: string]: any }) => {
  return Object.assign(Object.create(null), obj);
};
