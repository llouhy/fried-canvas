import { engineById } from "../engineFn";
import { arrorModelConfigs } from "./arrow";
import { controlPointModelConfig } from "./controlPoint";
import { customLineModelConfig } from "./customLine";
import { lineModelConfig } from "./line";

export const presetModel = (engineId: string) => {
  const { addModel } = engineById.get(engineId);
  const presetControlPoint = () => {
    addModel(...controlPointModelConfig);
  };
  const presetLine = () => {
    addModel(...lineModelConfig);
  };
  const presetCustomLine = () => {
    console.log(customLineModelConfig)
    addModel(...customLineModelConfig);
  }
  const presetArrow = () => {
    for (const elem of arrorModelConfigs) {
      addModel(...elem);
    }
  };
  presetControlPoint();
  presetLine();
  presetArrow();
  presetCustomLine();

}
