const { validateInput } = require("../../helpers/index");
const AuthValidators = require("./auth.validators");
const AuthServices = require("./auth.services");

class AuthControllers {
	static async signUp(req, res, next) {
		const accountData = await validateInput(AuthValidators.signUp, req.body);

		req.result = await AuthServices.signUp(accountData);

		next();
	}

	static async verify(req, res, next) {
		const { verificationToken } = await validateInput(AuthValidators.verify, req.params);

		req.result = await AuthServices.verify(verificationToken);

		next();
	}

	static async logIn(req, res, next) {
		const accountData = await validateInput(AuthValidators.login, req.body);

		req.result = await AuthServices.logIn(accountData);

		next();
	}

	static async logOut(req, res, next) {
		req.result = await AuthServices.logOut({
			accountId: req.accountId,
			accessToken: req.accessToken,
		});

		next();
	}
}

module.exports = AuthControllers;
