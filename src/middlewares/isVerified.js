const User = require("./../app/Models/User.model");

// TODO: Create new end point to create new verify email address!

// * This middleware needs to be after "protect" middleware to get userId from request!!
module.exports = async (req, res, next) => {
	try {
		// console.log("Hi, from isverified");

		const user = await User.findOne({ _id: req.userId })
			.select("isVerified isActive")
			.lean();

		if (!user || !user.isVerified) {
			throw new Error("Sorry, You need to verify your email address first!");
		}

		if (!user || !user.isActive) {
			throw new Error("Sorry, you need to activate your account first!");
		}

		req.isActive = user.isActive;
		req.isVerified = user.isVerified;
		return next();
	} catch (error) {
		console.log(error);
		return res.status(401).json({ data: error.message });
	}
};
