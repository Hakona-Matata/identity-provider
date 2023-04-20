const { errorHandler, successLogger, failureLogger } = require("./index");

const applyAppMiddlewares = require("./applyAppMiddlewares");
const applyThirdPartyMiddlewares = require("./applyThirdPartyMiddlewares");

module.exports = (app) => {
	app.use(applyThirdPartyMiddlewares);
	app.use(applyAppMiddlewares);

	app.use(successLogger);
	app.use(failureLogger);
	app.use(errorHandler);
};
