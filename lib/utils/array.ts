export const toggleItem = <T>(array: T[], item: T): T[] => {
  return array.includes(item)
    ? array.filter((i) => i !== item)
    : [...array, item];
};

export const removeItem = <T>(array: T[], item: T): T[] => {
  return array.filter((i) => i !== item);
};

export const addItem = <T>(array: T[], item: T): T[] => {
  return array.includes(item) ? array : [...array, item];
};

export const moveItem = <T>(array: T[], fromIndex: number, toIndex: number): T[] => {
  const result = [...array];
  const [movedItem] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, movedItem);
  return result;
};

export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export const unique = <T>(array: T[]): T[] => {
  return Array.from(new Set(array));
};

export const isEmpty = <T>(array: T[]): boolean => {
  return array.length === 0;
};

export const isNotEmpty = <T>(array: T[]): boolean => {
  return array.length > 0;
};
