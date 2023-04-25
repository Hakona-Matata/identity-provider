const validate = require("../../helpers/validateInput");

const PasswordValidators = require("./password.validators");
const PasswordServices = require("./password.services");
class PasswordControllers {
	static async change(req, res, next) {
		const passwordData = await validate(PasswordValidators.change, req.body);

		req.result = await PasswordServices.change({
			accountId: req.accountId,
			accountPassword: req.accountPassword,
			...passwordData,
		});

		next();
	}

	static async forget(req, res, next) {
		const { email } = await validate(PasswordValidators.forget, req.body);

		req.result = await PasswordServices.forget(email);

		next();
	}

	static async reset(req, res, next) {
		const resetAccountData = await validate(PasswordValidators.reset, req.body);

		req.result = await PasswordServices.reset(resetAccountData);

		next();
	}
}

module.exports = PasswordControllers;
