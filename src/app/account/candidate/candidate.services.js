const CandidateRepository = require("./candidate.repositories");
const { SUCCESS_MESSAGES, FAILIURE_MESSAGES } = require("../../../constants/messages");
const ROLES = require("./../../../constants/roles");

const BadRequestError = require("../../../Exceptions/common/badRequest.exception");
const UnAuthorizedError = require("../../../Exceptions/common/unAuthorized.exception");

const TokenHelper = require("./../../../helpers/token");
const HashHelper = require("./../../../helpers/hash");
const sendEmail = require("./../../../helpers/email");

class CandidateServices {
	static async signUp(payload) {
		const createdCandidate = await CandidateRepository.createCandidate({
			...payload,
			password: await HashHelper.generate(payload.password),
		});

		const verificationToken = await TokenHelper.generateVerificationToken({
			_id: createdCandidate.id,
			role: ROLES.candidate,
		});

		const verificationLink = `${process.env.BASE_URL}:${process.env.PORT}/auth/verify-email/${verificationToken}`;

		// TODO: Send email
		if (process.env.NODE_ENV !== "test") {
			console.log({ verificationLink });
			// await sendEmail({
			// 	from: "Hakona Matata company",
			// 	to: candidate.email,
			// 	subject: "Email Verification",
			// 	text: `Hello, ${candidate.email}\nPlease click the link to verify your email (It's only valid for ${process.env.VERIFICATION_TOKEN_EXPIRES_IN})\n${verificationLink}\nthanks.`,
			// });
		}

		await CandidateRepository.updateCandidateWithVerificationToken(createdCandidate._id, verificationToken);

		return SUCCESS_MESSAGES.SIGN_UP_SUCCESSFULLY;
	}

	static async verify(token) {
		const { _id: candidateId } = await TokenHelper.verifyVerificationToken(token);

		const foundCandidate = await CandidateRepository.findCandidateById(candidateId);

		if (foundCandidate && foundCandidate.isVerified) {
			throw new BadRequestError(FAILIURE_MESSAGES.ACCOUNT_ALREADY_VERIFIED);
		}

		await CandidateRepository.updateCandidateToBeVerified(candidateId);

		return SUCCESS_MESSAGES.ACCOUNT_VERIFIED_SUCCESSFULLY;
	}

	static async logIn({ email, password }) {
		const foundCandidate = await CandidateRepository.findCandidateByEmail(email);

		if (!foundCandidate) {
			throw new UnAuthorizedError(FAILIURE_MESSAGES.WRONG_EMAIL_OR_PASSWORD);
		}

		CandidateServices.#isCandidateVerifiedActiveNotDeleted(foundCandidate);

		const isPasswordCorrect = await HashHelper.verify(password, foundCandidate.password);

		if (!isPasswordCorrect) {
			throw new UnAuthorizedError(FAILIURE_MESSAGES.WRONG_EMAIL_OR_PASSWORD);
		}

		// TODO: what is 2fa are enalbed? refactor!

		return await TokenHelper.generateAccessRefreshTokens({ _id: foundCandidate._id, role: ROLES.candidate });
	}

	static async logOut({ userId, accessToken }) {
		console.log({ userId, accessToken });
		// TODO: Deal with sesion service!
		// const isUserLoggedOut = await Session.findOneAndDelete({
		// 	userId,
		// 	accessToken,
		// });

		return SUCCESS_MESSAGES.LOGGED_OUT_SUCCESSFULLY;
	}

	// TODO: work more on temp delete and deleted
	static #isCandidateVerifiedActiveNotDeleted(candidate) {
		CandidateServices.#isCandidateVerified(candidate.isVerified);
		CandidateServices.#isCandidateActive(candidate.isActive);
		CandidateServices.#isCandidateDeleted(candidate.isTempDeleted);
	}

	static #isCandidateVerified(isVerified) {
		if (!isVerified) {
			throw new UnAuthorizedError(FAILIURE_MESSAGES.ACCOUNT_NEED_TO_BE_VERIFIED);
		}
	}

	static #isCandidateActive(isActive) {
		if (!isActive) {
			throw new UnAuthorizedError(FAILIURE_MESSAGES.ACCOUNT_NEET_TO_BE_ACTIVE);
		}
	}

	static #isCandidateDeleted(isTempDeleted) {
		if (isTempDeleted) {
			throw new UnAuthorizedError(FAILIURE_MESSAGES.ACCOUNT_TEMP_DELETED);
		}
	}
}

module.exports = CandidateServices;
