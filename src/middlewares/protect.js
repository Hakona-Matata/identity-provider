const STATUS = require("./../constants/statusCodes");
const CODE = require("./../constants/errorCodes");

const { verify_token } = require("./../helpers/token");
const Session = require("./../app/Models/Session.model");
const { failure } = require("../Exceptions/responseHandler");

module.exports = () => {};

// // TODO: make it auth instead of protect
// module.exports = async (req, res, next) => {
// 	try {
// 		const accessToken = req?.headers["authorization"]?.split(" ")[1];

// 		if (!accessToken) {
// 			return res.status(STATUS.UNAUTHORIZED).json({
// 				success: false,
// 				status: STATUS.UNAUTHORIZED,
// 				code: CODE.UNAUTHORIZED,
// 				message: "Sorry, the access token is required!",
// 			});
// 		}

// 		const decoded = await verify_token({
// 			token: accessToken,
// 			secret: process.env.ACCESS_TOKEN_SECRET,
// 		});

// 		const isSessionFound = await Session.findOne({
// 			userId: decoded._id,
// 			accessToken,
// 		});

// 		if (!isSessionFound) {
// 			return res.status(STATUS.UNAUTHORIZED).json({
// 				success: false,
// 				status: STATUS.UNAUTHORIZED,
// 				code: CODE.UNAUTHORIZED,
// 				message: "Sorry, the access token is revoked!",
// 			});
// 		}

// 		req.userId = decoded._id;
// 		req.accessToken = isSessionFound.accessToken;
// 		next();
// 	} catch (error) {
// 		// console.log({ error });
// 		return failure({ res, error });
// 	}
// };
