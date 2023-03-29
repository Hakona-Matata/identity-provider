const STATUS = require("./../../constants/statusCodes");
const CODE = require("../../constants/errorCodes");

const { success, failure } = require("./../../Errors/responseHandler");
const {
	deactivateAccount_PUT_service,
	activateAccount_PUT_service,
	confirmActivation_GET_service,
	deleteAccount_DELETE_service,
	cancelDeleteAccount_PUT_service,
} = require("./../Services/account.services");

const validate = require("./../../helpers/validate");
const account_validators = require("../Validators/account.validators.js");

const deactivateAccount_PUT_controller = async (req, res, next) => {
	try {
		const result = await deactivateAccount_PUT_service({
			userId: req.userId,
		});

		return success({ status: STATUS.OK, code: CODE.OK, res, result });
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

		return success({ status: STATUS.OK, code: CODE.OK, res, result, res });
	} catch (error) {
		return failure({ res, error });
	}
};

const confirmActivation_GET_controller = async (req, res, next) => {
	try {
		const validatedData = await validate(
			account_validators.confirm,
			req.params
		);

		const result = await confirmActivation_GET_service({
			activationToken: validatedData.activationToken,
		});

		return success({ status: STATUS.OK, code: CODE.OK, res, result });
	} catch (error) {
		return failure({ res, error });
	}
};

const deleteAccount_DELETE_controller = async (req, res, next) => {
	try {
		const result = await deleteAccount_DELETE_service({ userId: req.userId });

		return success({ status: STATUS.OK, code: CODE.OK, res, result });
	} catch (error) {
		return failure({ res, error });
	}
};

const cancelDeleteAccount_PUT_controller = async (req, res, next) => {
	try {
		const validatedData = await validate(account_validators.cancel, req.body);

		const result = await cancelDeleteAccount_PUT_service({ ...validatedData });

		return success({ status: STATUS.OK, code: CODE.OK, res, result });
	} catch (error) {
		return failure({ res, error });
	}
};

module.exports = {
	deactivateAccount_PUT_controller,
	activateAccount_PUT_controller,
	confirmActivation_GET_controller,
	deleteAccount_DELETE_controller,
	cancelDeleteAccount_PUT_controller,
};
