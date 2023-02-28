const { success, failure } = require("./../../Errors/responseHandler");
const {
	deactivateAccount_PUT_service,
} = require("./../Services/account.services");

const deactivateAccount_PUT_controller = async (req, res, next) => {
	try {
		return await deactivateAccount_PUT_service(req.userId);
	} catch (error) {
		return failure({ res, error });
	}
};

module.exports = {
	deactivateAccount_PUT_controller,
};
