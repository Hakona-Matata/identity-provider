const access_routes = require("../../app/Routes/access.routes");
const session_routes = require("../../app/Routes/session.routes");
const account_routes = require("../../app/Routes/account.routes");
const password_routes = require("../../app/Routes/password.routes");
const OTP_routes = require("../../app/Routes/OTP.routes");
const SMS_routes = require("./../../app/Routes/SMS.routes");

const protect = require("../../middlewares/protect");
const isVerified = require("../../middlewares/isVerified");

const routes_middleware = (app) => {
	app.use("/auth", access_routes);
	app.use("/auth/sessions", [protect, isVerified, session_routes]);
	app.use("/auth/account", account_routes);
	app.use("/auth/password", password_routes);
	app.use("/auth/otp", OTP_routes);
	app.use("/auth/sms", SMS_routes);
};

module.exports = routes_middleware;
