const { success } = require("../../Exceptions/responseHandler");

const validate = require("./../../helpers/validate");
const PasswordValidators = require("./password.validators");
const PasswordServices = require("./password.services");
class PasswordControllers {
	static async change(req, res, next) {
		const passwordData = await validate(PasswordValidators.change, req.body);

		const result = await PasswordServices.change({
			accountId: req.accountId,
			accountPassword: req.accountPassword,
			...passwordData,
		});

		return success({ res, result });
	}

	static async forget(req, res, next) {
		const { email: accountEmail } = await validate(PasswordValidators.forget, req.body);

		const result = await PasswordServices.forget(accountEmail);

		return success({ res, result });
	}

	static async reset(req, res, next) {
		const resetAccountData = await validate(PasswordValidators.reset, req.body);

		const result = await PasswordServices.reset(resetAccountData);

		return success({ res, result });
	}
}

module.exports = PasswordControllers;
