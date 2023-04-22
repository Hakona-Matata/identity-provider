const awaitAll = async (asyncFn, count) => {
	const promises = [];

	for (let i = 0; i < count; i++) {
		promises.push(asyncFn().catch((error) => error));
	}

	return await Promise.all(promises);
};

module.exports = awaitAll;
