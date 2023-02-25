const User = require("./../app/Models/User.model");

// * This middleware needs to be after "protect" middleware to get userId from request!!
module.exports = async (req, res, next) => {
	try {
		const user = await User.findOne({ _id: req.userId })
			.select("isVerified")
			.lean();

		if (!user || !user.isVerified) {
			throw new Error("Sorry, your email address isn't verified yet!");
		}

		next();
	} catch (error) {
		console.log(error);
		return res.status(401).json({ data: error.message });
	}
};
