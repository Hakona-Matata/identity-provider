module.exports = (count, asyncFn) => {
	const promises = [];

	for (i = 0; i < count; ++i) {
		promises.push(asyncFn());
	}

	return Promise.all(promises);
};
