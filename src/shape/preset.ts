import { engineById } from "../engineFn";
import { arrorModelConfigs } from "./arrow";
import { controlPointModelConfig } from "./controlPoint";
import { lineModelConfig } from "./line";

export const presetShape = (engineId: string) => {
  const { addModel } = engineById.get(engineId);
  const presetControlPoint = () => {
    addModel(...controlPointModelConfig);
  };
  const presetLine = () => {
    addModel(...lineModelConfig);
  };
  const presetArrow = () => {
    for (const elem of arrorModelConfigs) {
      addModel(...elem);
    }
  };
  presetControlPoint();
  presetLine();
  presetArrow();
}
