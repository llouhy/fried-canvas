import { generateRandomStr } from "../utils/common";
import { Boundary } from "../rewriteFn/type";
import { Shape } from "../shape/shape";
import { getPureObject } from "../utils/common";
import { setIdentify } from "../utils/setIdentify";

export type GridIns = {
  id: string;
  boundary: Boundary;
  isLeaf: boolean;
  children?: GridIns[] | null;
  shapes?: Shape[];
};

export const getGrid = (boundary: Boundary, isLeaf: boolean): GridIns => {
  return setIdentify(getPureObject({
    id: generateRandomStr(6),
    boundary,
    isLeaf,
    children: !isLeaf ? [] : null,
    shapes: []
  }), 'grid');
}
