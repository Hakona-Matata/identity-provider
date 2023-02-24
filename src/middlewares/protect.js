const User = require("./../app/Models/User.model");
const { verify_token } = require("./../helpers/token");

//=========================================================
module.exports = async (req, res, next) => {
	try {
		// (1) Get access token
		const { accessToken } = req.body;

		if (!accessToken) {
			throw new Error("sorry, the accessToken is not found!");
		}

		// (2) Verify access token
		const decoded = await verify_token({
			token: accessToken,
			secret: process.env.ACCESS_TOKEN_SECRET,
		});

		// (3) Get user to check if this token is active or not (user may revoke it but, it still valid!)
		const user = await User.findOne({ _id: decoded._id })
			.select("session")
			.lean();

		if (
			user.session.filter(
				(token) => token.label === "accessToken" && token.value == accessToken
			).length == 0
		) {
			throw new Error("Sorry, This access token is revoked!");
		}

		// (4) Add some data to request object
		// now, we can access it in any protected route!
		req.userId = decoded._id;

		// For revoking it whenever the user wants!
		req.accessToken = accessToken;

		// (5) Move forward
		next();
	} catch (error) {
		return res.status(401).json({
			data:
				error.message === "invalid signature"
					? "Sorry, your access token is invalid!"
					: error.message,
		});
	}
};
