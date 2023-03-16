const { verify_token } = require("./../helpers/token");
const Session = require("./../app/Models/Session.model");
const jwt_errors = require("../Errors/jwt");

module.exports = async (req, res, next) => {
	try {
		// (1) Get access token from request
		const accessToken = req?.headers["authorization"]?.split(" ")[1];

		if (!accessToken) {
			return res.status(404).json({ data: "Sorry, access token is not found" });
		}

		// (2) Verify access token
		const decoded = await verify_token({
			token: accessToken,
			secret: process.env.ACCESS_TOKEN_SECRET,
		});

		// (3) Get session from DB
		const session = await Session.findOne({
			userId: decoded._id,
			accessToken,
		});
console
		/*
			This means that, the access token is
			- valid signature
			- not expired! 
			- not manipulated/ malformed! 
			Only, there is a window to use it! (user revoked it recently | deleted!)
		*/
		if (!session) {
			return res
				.status(400)
				.json({ data: "Sorry, the access token is invalid!" });
		}

		req.userId = decoded._id;
		req.accessToken = session.accessToken;
		next();
	} catch (error) {
		// console.log(error);
		return jwt_errors({ res, error });
	}
};
