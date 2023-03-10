const User = require("./../app/Models/User.model");
const CustomError = require("./../Errors/CustomError");

// TODO: Create new end point to create new verify email address!

// * Note: This middleware needs to be after "protect" middleware to get userId from request!!
module.exports = async (req, res, next) => {
	try {
		const user = await User.findOne({ _id: req.userId })
			.select(
				`email isVerified isActive isDeleted isOTPEnabled isSMSEnabled isTOTPEnabled isBackupEnabled ${
					req.originalUrl === "/auth/password/change" ? "password" : ""
				}` // just to decrease on db call!
			)
			.lean();

		if (!user || user.isDeleted) {
			return res.status(401).json({
				data: "Sorry, your account is deleted!",
			});
		}

		if (!user || !user.isActive) {
			return res.status(401).json({
				data: "Sorry, you need to activate your account first!",
			});
		}

		if (!user || !user.isVerified) {
			return res.status(401).json({
				data: "Sorry, You need to verify your email address first!",
			});
		}

		req.email = user.email;
		req.isActive = user.isActive;
		req.isVerified = user.isVerified;
		req.password = user.password || null;

		req.isOTPEnabled = user.isOTPEnabled;
		req.isSMSEnabled = user.isSMSEnabled;
		req.isTOTPEnabled = user.isTOTPEnabled;

		req.isBackupEnabled = user.isBackupEnabled;
		req.enabledMethodsCount = [
			user.isOTPEnabled,
			user.isSMSEnabled,
			user.isTOTPEnabled,
		].filter(Boolean).length;

		return next();
	} catch (error) {
		console.log(error);
		return res.status(401).json({ data: error.message });
	}
};
