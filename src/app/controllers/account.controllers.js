const { success, failure } = require("./../../Errors/responseHandler");
const {
	deactivateAccount_PUT_service,
	activateAccount_PUT_service,
} = require("./../Services/account.services");

const validate = require("./../../helpers/validate");

const account_validators = require("../Validators/account.validators.js");

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

const activateAccount_PUT_controller = async (req, res, next) => {
	try {
		const validatedData = await validate(account_validators.activate, req.body);

		const result = await activateAccount_PUT_service({
			email: validatedData.email,
		});

		return success({ res, result });
	} catch (error) {
		return failure({ res, error });
	}
};

module.exports = {
	deactivateAccount_PUT_controller,
	activateAccount_PUT_controller,
};
