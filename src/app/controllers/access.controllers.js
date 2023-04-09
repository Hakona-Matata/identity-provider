const STATUS = require("./../../constants/statusCodes");
const CODE = require("../../constants/errorCodes");

const { success, failure } = require("../../Errors/responseHandler");
const validate = require("./../../helpers/validate");

const access_validators = require("../Validators/access.validators.js");
const {
	signUp_POST_service,
	verify_GET_service,
	login_POST_service,
	logout_POST_service,
} = require("../Services/access.services.js");

//===============================================================================

const signUp_POST_controller = async (req, res, next) => {
	try {
		const validatedData = await validate(access_validators.signUp, req.body);

		const result = await signUp_POST_service(validatedData);

		return success({
			status: STATUS.CREATED,
			code: CODE.CREATED,
			res,
			result,
		});
	} catch (error) {
		return failure({ res, error });
	}
};

const verify_GET_controller = async (req, res, next) => {
	try {
		const validatedData = await validate(access_validators.verify, req.params);

		const result = await verify_GET_service(validatedData);

		return success({ status: STATUS.OK, code: CODE.OK, res, result });
	} catch (error) {
		return failure({ res, error });
	}
};

const login_POST_controller = async (req, res, next) => {
	try {
		
	} catch (error) {
		return failure({ res, error });
	}
};

const logout_POST_controller = async (req, res, next) => {
	try {
		const result = await logout_POST_service({
			userId: req.userId,
			accessToken: req.accessToken,
		});

		return success({ status: STATUS.OK, code: CODE.OK, res, result });
	} catch (error) {
		return failure({ res, error });
	}
};

module.exports = {
	signUp_POST_controller,
	verify_GET_controller,
	login_POST_controller,
	logout_POST_controller,
};
