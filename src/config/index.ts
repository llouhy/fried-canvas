import { getDefaultColor } from "./color";

const getConfig = () => ({
  color: { ...getDefaultColor() }
});

export default getConfig;