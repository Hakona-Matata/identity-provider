const STATUS = require("./../../constants/statusCodes");
const CODE = require("./../../constants/errorCodes");

const access_routes = require("../../app/Routes/access.routes");
const session_routes = require("../../app/Routes/session.routes");
const account_routes = require("../../app/Routes/account.routes");
const password_routes = require("../../app/Routes/password.routes");
const OTP_routes = require("../../app/Routes/OTP.routes");
const SMS_routes = require("./../../app/Routes/SMS.routes");
const TOTP_routes = require("../../app/Routes/TOTP.routes");
const backup_routes = require("../../app/Routes/backup.routes");

const routes_middleware = (app) => {
	app.use("/auth", access_routes);
	app.use("/auth/sessions", session_routes);
	app.use("/auth/account", account_routes);
	app.use("/auth/password", password_routes);
	app.use("/auth/otp", OTP_routes);
	app.use("/auth/sms", SMS_routes);
	app.use("/auth/totp", TOTP_routes);
	app.use("/auth/backup", backup_routes);
	app.use((req, res, next) => {
		res.status(STATUS.NOT_FOUND).json({
			success: false,
			status: STATUS.NOT_FOUND,
			code: CODE.NOT_FOUND,
			message: "Sorry, this endpoint is not found!",
		});
	});
};

module.exports = routes_middleware;
