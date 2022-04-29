/**
 * is integer?
 * @param n
 * @returns
 */
export function isInt(n: number | string) {
  return Number(n) === n && n % 1 === 0;
}

/**
 * is float?
 * @param n
 * @returns
 */
export function isFloat(n: number | string) {
  return Number(n) === n && n % 1 !== 0;
}
