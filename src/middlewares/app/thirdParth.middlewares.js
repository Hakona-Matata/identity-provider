const thirdParty_middlewares = ({ app, express }) => {
	app.use(express.json({ limit: "2mb" }));
};

module.exports = thirdParty_middlewares;
