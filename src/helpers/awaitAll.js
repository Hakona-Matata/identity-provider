module.exports = async ({ count, asyncFn }) => {
	const promises = [];

	for (let i = 0; i < count; i++) {
		promises.push(asyncFn());
	}

	return await Promise.all(promises);
};
