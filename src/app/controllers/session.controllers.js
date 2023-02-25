const { success, failure } = require("../../Errors/responseHandler");
const validate = require("./../../helpers/validate");
const { all_sessions_GET_service } = require("./../Services/session.services");

const all_sessions_GET_controller = async (req, res, next) => {
	try {
		const result = await all_sessions_GET_service(req.userId);

		return success({ res, result });
	} catch (error) {
		console.log(error);
		return failure({ res, error });
	}
};

module.exports = { all_sessions_GET_controller };
