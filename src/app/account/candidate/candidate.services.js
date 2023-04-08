const CandidateRepository = require("./candidate.repositories");

class CandidateServices {
	constructor() {
		this.CandidateRepository = CandidateRepository;
	}

	static async signUp({ email, userName, password, confirmPassword }) {
		return "hi from service";
	}

	static async logIn() {}

	static async verify() {}

	static async logOut() {}
}

module.exports = CandidateServices;
