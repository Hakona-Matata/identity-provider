const { success, failure } = require("./../../Errors/responseHandler");
const {
	deactivateAccount_PUT_service,
} = require("./../Services/account.services");

const deactivateAccount_PUT_controller = async (req, res, next) => {
	try {
		const result = await deactivateAccount_PUT_service({
			isActive: req.isActive,
			userId: req.userId,
		});

		return success({ res, result });
	} catch (error) {
		return failure({ res, error });
	}
};

module.exports = {
	deactivateAccount_PUT_controller,
};
