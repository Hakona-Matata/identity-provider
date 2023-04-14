const AccountRepository = require("../app/account/account.repositories");
const AccountServices = require("../app/account/account.services");

module.exports = async (req, res, next) => {
	const account = await AccountRepository.findAccountById(req.accountId);
	AccountServices.isVerified(account.isVerified);

	req.isAccountVerified = account.isVerified;
	req.isAccountActive = account.isActive;
	req.isAccountDeleted = account.isDeleted;
	next();
};

// // TODO: Create new end point to create new verify email address!

// // * Note: This middleware needs to be after "protect" middleware to get userId from request!!
// module.exports = async (req, res, next) => {
// 	try {
// 		const user = await User.findOne({ _id: req.userId })
// 			.select(
// 				`email isVerified isActive isDeleted isDeletedAt isOTPEnabled isSMSEnabled isTOTPEnabled isBackupEnabled ${
// 					req.originalUrl === "/auth/password/change" ? "password" : ""
// 				}` // just to decrease on db call!
// 			)
// 			.lean();

// 		if (!user || user.isDeleted) {
// 			const { days, hours, minutes } = date_to_days_hours_minutes({
// 				ISODate: user.isDeletedAt,
// 				expiresAfterSeconds: process.env.DELETE_IN_30_DAYS * 1000,
// 			});

// 			return res.status(STATUS.FORBIDDEN).json({
// 				success: false,
// 				status: STATUS.FORBIDDEN,
// 				code: CODE.FORBIDDEN,
// 				message: `Sorry, your account is temporarily deleted!\nIt will be deleted permenantly in ${days} days, ${hours} hours, and ${minutes} minutes\nunless you canceled the deletion!`,
// 			});
// 		}

// 		if (!user || !user.isActive) {
// 			return res.status(STATUS.FORBIDDEN).json({
// 				success: false,
// 				status: STATUS.FORBIDDEN,
// 				code: CODE.FORBIDDEN,
// 				message: "Sorry, you need to activate your account first!",
// 			});
// 		}

// 		if (!user || !user.isVerified) {
// 			return res.status(STATUS.FORBIDDEN).json({
// 				success: false,
// 				status: STATUS.FORBIDDEN,
// 				code: CODE.FORBIDDEN,
// 				message: "Sorry, You need to verify your email address first!",
// 			});
// 		}

// 		req.email = user.email;
// 		req.isActive = user.isActive;
// 		req.isVerified = user.isVerified;
// 		req.password = user.password || null;

// 		req.isOTPEnabled = user.isOTPEnabled;
// 		req.isSMSEnabled = user.isSMSEnabled;
// 		req.isTOTPEnabled = user.isTOTPEnabled;

// 		req.isBackupEnabled = user.isBackupEnabled;
// 		req.enabledMethodsCount = [user.isOTPEnabled, user.isSMSEnabled, user.isTOTPEnabled].filter(Boolean).length;

// 		return next();
// 	} catch (error) {
// 		console.log(error);
// 		return res.status(401).json({ data: error.message });
// 	}
// };
