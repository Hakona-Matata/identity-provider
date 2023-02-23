const access_routes = require("./../app/Routes/access.routes");

const routes_middleware = (app) => {
	app.use("/auth", [access_routes]);
};

module.exports = routes_middleware;
