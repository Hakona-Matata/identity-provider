const Session = require("../app/Models/Session.model");
const { verify_token } = require("./../helpers/token");
const jwt_errors = require("../Errors/jwt");

module.exports = async (req, res, next) => {
	try {
		// (1) Get access token
		const accessToken = req.headers["authorization"].split(" ")[1];

		if (!accessToken) {
			throw new Error("sorry, the access token is not found!");
		}

		// (2) Verify access token
		const decoded = await verify_token({
			token: accessToken,
			secret: process.env.ACCESS_TOKEN_SECRET,
		});

		// (3) Get token from DB
		// * This is needed to prevent token usage after user revoking it (if there is still a window to be used!)
		const token = await Session.findOne({
			userId: decoded._id,
			accessToken,
		});

		// * This means that token is not expired! not manipulated! (only there is a window to use it!)
		if (!token) {
			throw new Error("Sorry, your account token may be revoked!");
		}

		// (4) Add some data to request object
		// now, we can access it in any protected route!
		req.userId = decoded._id;

		// For revoking it whenever the user wants!
		req.accessToken = accessToken;

		// (5) Move forward
		next();
	} catch (error) {
		return error.name === "Error"
			? res.status(401).json({
					data: error.message,
			  })
			: jwt_errors({ res, error });
	}
};
