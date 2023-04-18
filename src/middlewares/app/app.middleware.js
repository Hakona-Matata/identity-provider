const STATUS = require("./../../constants/statusCodes");
const CODE = require("./../../constants/errorCodes");

const AuthRoutes = require("./../../app/auth/auth.routes");
const AccountRoutes = require("./../../app/account/account.routes");
const SessionRoutes = require("../../app/session/session.routes");
const PasswordRoutes = require("./../../app/password/password.routes");
const OtpRoutes = require("./../../app/otp/otp.routes");
const SmsRoutes = require("./../../app/sms/sms.routes");
const TotpRoutes = require("./../../app/totp/totp.routes");

const routes_middleware = (app) => {
	app.use("/auth", AuthRoutes);
	app.use("/auth/account", AccountRoutes);
	app.use("/auth/account/sessions", SessionRoutes);
	app.use("/auth/account/password", PasswordRoutes);
	app.use("/auth/otp", OtpRoutes);
	app.use("/auth/sms", SmsRoutes);
	app.use("/auth/totp", TotpRoutes);

	// app.use("/auth", access_routes);
	// app.use("/auth/account", account_routes);
	// app.use("/auth/sms", SMS_routes);
	// app.use("/auth/backup", backup_routes);

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
