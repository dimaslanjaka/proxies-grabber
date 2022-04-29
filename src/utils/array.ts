/**
 * shuffle array
 * @param array
 * @returns
 */
export function shuffle<T extends any[]>(array: T): T {
  return array.sort(() => Math.random() - 0.5);
}

/**
 * unique array of object by the object key
 * @param array
 * @param key
 * @returns
 */
export function uniqueArrayByObjectKey<T extends any[]>(array: T, key: string) {
  return [...new Map(array.map((item) => [item[key], item])).values()] as T;
}
