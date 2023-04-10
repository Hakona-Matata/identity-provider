const STATUS = require("./../../constants/statusCodes");
const CODE = require("./../../constants/errorCodes");

const accountRoutes = require("./../../app/account/account.routes");
const sessionRoutes = require("../../app/session/session.routes");

const routes_middleware = (app) => {
	app.use("/auth", accountRoutes);
	app.use("/auth/sessions", sessionRoutes);

	// app.use("/auth", access_routes);
	// app.use("/auth/account", account_routes);
	// app.use("/auth/password", password_routes);
	// app.use("/auth/otp", OTP_routes);
	// app.use("/auth/sms", SMS_routes);
	// app.use("/auth/totp", TOTP_routes);
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
