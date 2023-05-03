const AuthRoutes = require("../app/auth/auth.routes");
const AccountRoutes = require("../app/account/account.routes");
const SessionRoutes = require("../app/session/session.routes");
const PasswordRoutes = require("../app/password/password.routes");
const OtpRoutes = require("../app/otp/otp.routes");
const SmsRoutes = require("../app/sms/sms.routes");
const TotpRoutes = require("../app/totp/totp.routes");
const BackupRoutes = require("../app/backup/backup.routes");
const { notFound } = require("../app/notFound/notFound.controllers");

/**
 * Registers and configures routes for the Express app.
 *
 * @module routes/configureRoutes
 * @param {import('express').Express} app - The Express app instance.
 */
module.exports = (app) => {
	/**
	 * Registers authentication routes.
	 */
	app.use("/auth", AuthRoutes);

	/**
	 * Registers account routes.
	 */
	app.use("/auth/account", AccountRoutes);

	/**
	 * Registers session routes.
	 */
	app.use("/auth/account/sessions", SessionRoutes);

	/**
	 * Registers password routes.
	 */
	app.use("/auth/account/password", PasswordRoutes);

	/**
	 * Registers OTP routes.
	 */
	app.use("/auth/account/otp", OtpRoutes);

	/**
	 * Registers SMS routes.
	 */
	app.use("/auth/account/sms", SmsRoutes);

	/**
	 * Registers TOTP routes.
	 */
	app.use("/auth/totp", TotpRoutes);

	/**
	 * Registers backup routes.
	 */
	app.use("/auth/account/backup", BackupRoutes);

	/**
	 * Handles requests for routes that are not found.
	 *
	 * @function
	 * @name notFoundHandler
	 * @param {import('express').Request} req - The Express request object.
	 * @param {import('express').Response} res - The Express response object.
	 * @param {import('express').NextFunction} next - The next function in the middleware chain.
	 */
	app.use((req, res, next) => notFound(req, res, next));
};
