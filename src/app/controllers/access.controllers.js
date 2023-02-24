const { success, failure } = require("../../Errors/responseHandler");
const validate = require("./../../helpers/validate");

const access_validators = require("../Validators/access.validators.js");
const {
	signUp_POST_service,
	verify_GET_service,
	login_POST_service,
} = require("../Services/access.services.js");

//===============================================================================

const signUp_POST_controller = async (req, res, next) => {
	try {
		const validatedData = await validate(access_validators.signUp, req.body);

		const result = await signUp_POST_service(validatedData);

		return success({ res, result });
	} catch (error) {
		return failure({ res, error });
	}
};

const verify_GET_controller = async (req, res, next) => {
	try {
		const validatedData = await validate(access_validators.verify, req.params);

		const result = await verify_GET_service(validatedData);

		return success({ res, result });
	} catch (error) {
		return failure({ res, error });
	}
};

const login_POST_controller = async (req, res, next) => {
	try {
		const validatedData = await validate(access_validators.login, req.body);

		const result = await login_POST_service(validatedData);

		return success({ res, result });
	} catch (error) {
		return failure({ res, error });
	}
};

module.exports = {
	signUp_POST_controller,
	verify_GET_controller,
	login_POST_controller,
};
