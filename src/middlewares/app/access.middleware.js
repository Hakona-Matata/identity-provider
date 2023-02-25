const access_routes = require("../../app/Routes/access.routes");
const session_routes = require("../../app/Routes/session.routes");

const routes_middleware = (app) => {
	app.use("/auth", [access_routes, session_routes]);
};

module.exports = routes_middleware;
