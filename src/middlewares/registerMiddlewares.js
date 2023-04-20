const { errorHandler, successLogger, failureLogger, responseHandler } = require("./index");

const applyAppMiddlewares = require("./applyAppMiddlewares");
const applyThirdPartyMiddlewares = require("./applyThirdPartyMiddlewares");

module.exports = (app) => {
	applyThirdPartyMiddlewares(app);
	applyAppMiddlewares(app);

	app.use(successLogger);
	app.use(failureLogger);
	app.use(errorHandler);
	app.use(responseHandler);
};
