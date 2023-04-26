/**
 * Asynchronously executes the provided function a given number of times and returns an array of resolved or rejected promises.
 *
 * @async
 * @function awaitAll
 * @param {Function} asyncFn - The function to be executed asynchronously.
 * @param {number} count - The number of times to execute the function.
 * @returns {Promise<Array>} - A promise that resolves to an array of resolved or rejected promises.
 */
const awaitAll = async (asyncFn, count) => {
	const promises = [];

	for (let i = 0; i < count; i++) {
		promises.push(asyncFn().catch((error) => error));
	}

	return await Promise.all(promises);
};

module.exports = awaitAll;
