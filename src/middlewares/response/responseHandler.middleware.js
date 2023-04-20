module.exports = (req, res, next) => {
	// TODO: Consider logging everything like originalUrl, params, query, body,method, etc...
	// TODO: (Be careful of injection attacks during this desired implementation!)
	console.log("from Response Handler");
	console.log({ route: req });
	console.log({ result: req.result });
	res.json({ ...req.result });
};
