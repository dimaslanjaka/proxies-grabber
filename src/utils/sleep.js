/**
 * sleep async
 * @param {number} ms
 * @returns
 */
export default function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
