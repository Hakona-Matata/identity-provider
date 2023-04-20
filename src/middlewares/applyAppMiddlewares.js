const { isAuthenticated, isVerified, isActive } = require("./index");

const AuthRoutes = require("../app/auth/auth.routes");
const AccountRoutes = require("../app/account/account.routes");
const SessionRoutes = require("../app/session/session.routes");
const PasswordRoutes = require("../app/password/password.routes");
const OtpRoutes = require("../app/otp/otp.routes");
const SmsRoutes = require("../app/sms/sms.routes");
const TotpRoutes = require("../app/totp/totp.routes");
const BackupRoutes = require("../app/backup/backup.routes");
const NotFoundServices = require("./../app/notFound/noftFound.services");

module.exports = (app) => {
	app.use("/auth", AuthRoutes);
	app.use("/auth/account", AccountRoutes);
	app.use("/auth/account/sessions", SessionRoutes);
	app.use("/auth/account/password", PasswordRoutes);
	app.use("/auth/otp", OtpRoutes);
	app.use("/auth/sms", SmsRoutes);
	app.use("/auth/totp", [isAuthenticated, isVerified, isActive], TotpRoutes);
	app.use("/auth/backup", BackupRoutes);
	app.use((req, res, next) => NotFoundServices.notFound(req, res, next));
};
