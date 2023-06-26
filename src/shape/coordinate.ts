import type { Point } from '../rewriteFn/type';

// const stack = [];
const stackMap = new Map<string, Array<Point>>();
export const useCoordinateCache = (engineId: string): Point[] => {
  const coordinateStack = stackMap.get(engineId);
  if (coordinateStack) {
    return coordinateStack;
  } else {
    const newCoordinateStack: Point[] = [];
    stackMap.set(engineId, newCoordinateStack);
    return newCoordinateStack;
  }
};

type UseLineWidthToCoordinateMap = () => {
  set: (width: number, coordinate: Point[]) => void;
  get: (width: number) => Point[] | undefined;
  getAll: () => [number, Point[]][];
  delete: (width: number) => boolean;
  clear: () => void;
};
const lineWidthMap = new Map<number, Point[]>();
export const useLineWidthToCoordinateMap: UseLineWidthToCoordinateMap = () => {
  return {
    set: (width: number, points: Point[]): void => {
      if (typeof width !== 'number') {
        return;
      }
      const coordinates = lineWidthMap.get(width);
      if (coordinates) {
        coordinates.push(...points);
      } else {
        lineWidthMap.set(width, [...points]);
      }
    },
    get: (width: number): undefined | Point[] => {
      return lineWidthMap.get(width);
    },
    delete: (width: number): boolean => {
      return lineWidthMap.delete(width);
    },
    getAll: (): [number, Point[]][] => {
      const result = [];
      for (const item of lineWidthMap) {
        result.push(item);
      }
      return result;
    },
    clear: () => {
      lineWidthMap.clear();
    }
  };
};

const compensateMap = new Map
export const useCompensate = () => {
  
};
