const validate = require("./../../helpers/validate");
const { success, failure } = require("./../../Errors/responseHandler");
const password_validators = require("./../Validators/password.validators");
const {
	changePassword_PUT_service,
	forgetPassword_POST_service,
	resetToken_PUT_service,
} = require("./../Services/password.services");

const changePassword_PUT_controller = async (req, res, next) => {
	try {
		const validatedData = await validate(
			password_validators.changePassword,
			req.body
		);

		const result = await changePassword_PUT_service({
			...validatedData,
			userId: req.userId,
			userPassword: req.password,
		});

		return success({ res, result });
	} catch (error) {
		return failure({ res, error });
	}
};

const forgetPassword_POST_controller = async (req, res, next) => {
	try {
		const validatedData = await validate(
			password_validators.forgetPassword,
			req.body
		);

		const result = await forgetPassword_POST_service(validatedData.email);

		return success({ res, result });
	} catch (error) {
		return failure({ res, error });
	}
};

const resetPassword_PUT_controller = async (req, res, next) => {
	try {
		const validatedData = await validate(
			password_validators.resetPassword,
			req.body
		);

		const result = await resetToken_PUT_service(validatedData);

		return success({ res, result });
	} catch (error) {
		return failure({ res, error });
	}
};

module.exports = {
	changePassword_PUT_controller,
	forgetPassword_POST_controller,
	resetPassword_PUT_controller,
};
