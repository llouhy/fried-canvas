const defaultColors = [
  ['defaultRectFillColor', '#333'],
  ['defaultBoundaryColor', 'orange']
];
export const colorMap: Map<string, string> = new Map(defaultColors as any);

export const getDefaultColor = (): { [key: string]: `#${string}` } => {
  return {
    DEFAULT_BORDER: '#444454'
  };
} 
