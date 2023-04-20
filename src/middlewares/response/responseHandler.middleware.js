module.exports = (req, res, next) => {
	console.log("from Response Handler");

	console.log({ result: req.result });
	res.json({ ...req.result });
};
