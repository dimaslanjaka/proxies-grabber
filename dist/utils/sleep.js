/**
 * sleep async
 * @param {number} ms
 * @returns
 */
function sleep(ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    });
}
module.exports = sleep;
