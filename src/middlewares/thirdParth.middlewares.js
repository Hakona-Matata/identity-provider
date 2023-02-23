const thirdParty_middlewares = ({ app, express }) => {
	// (1) For parsing request data
	app.use(express.json({ limit: "2mb" }));
};

module.exports = thirdParty_middlewares;
