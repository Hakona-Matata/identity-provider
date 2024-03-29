const {
	SUCCESS_MESSAGES: {
		DEACTIVATED_SUCCESSFULLY,
		CHECK_MAIL_BOX,
		ACTIVATED_SUCCESSFULLY,
		ACCOUNT_DELETED_SUCCESSFULLY,
		CANCELED_ACCOUNT_DELETION,
	},
	FAILURE_MESSAGES: {
		ACCOUNT_NEED_TO_BE_VERIFIED,
		ACCOUNT_NEED_TO_BE_ACTIVE,
		ACCOUNT_ALREADY_ACTIVE,
		ALREADY_HAVE_VALID_ACTIVATION_LINK,
		ALREADY_CANCELED_ACCOUNT_DELETION,
		ACCOUNT_IS_DELETED,
	},
} = require("./account.constants");

const { BadRequestException, ForbiddenException } = require("./../../../shared/exceptions");

const { TokenHelper, HashHelper } = require("../../../shared/helpers");

const SessionServices = require("./../session/session.services");
const AccountRepository = require("./account.repositories");

/**
 * @class AccountServices
 * @description Contains methods for handling account related operations
 */
class AccountServices {
	/**
	 * Deactivates an account by setting its 'isActive' field to false.
	 * Also deletes all sessions associated with the account.
	 *
	 * @param {string} accountId - The ID of the account to be deactivated.
	 * @returns {string} A success message indicating that the account was deactivated successfully.
	 */
	static async deactivate(accountId) {
		await AccountServices.updateOne({ _id: accountId }, { isActive: false, activeStatusChangedAt: new Date() });

		await SessionServices.deleteMany({ accountId });

		return DEACTIVATED_SUCCESSFULLY;
	}

	/**
	 * Initiates the account activation process by generating an activation token and sending an email to the user's
	 * email address containing a link to activate their account.
	 *
	 * @param {string} email - The email of the account to be activated.
	 * @returns {string} A success message indicating that an email has been sent with instructions to activate the account.
	 */
	static async initiateActivation(email) {
		const account = await AccountServices.findOne({ email });

		if (!account) {
			return CHECK_MAIL_BOX;
		}

		account && account.isActive && AccountServices.#isAccountAlreadyActive(account.isActive);

		await AccountServices.isAccountVerified(account.isVerified);
		await AccountServices.isAccountDeleted(account.isDeleted);

		await AccountServices.#hasValidActivationToken(account.activationToken);

		const activationToken = await TokenHelper.generateActivationToken({
			accountId: account._id,
			role: account.role,
		});

		const activationLink = `${process.env.BASE_URL}:${process.env.PORT}/auth/account/activate/${activationToken}`;

		// TODO: Send email
		if (process.env.NODE_ENV === "development") console.log({ activationLink });

		await AccountServices.updateOne({ _id: account._id }, { activationToken });

		return CHECK_MAIL_BOX;
	}

	/**
	 * Confirms the account activation by verifying the activation token and setting the 'isActive' field of the account
	 * to true.
	 *
	 * @param {string} activationToken - The activation token generated during the activation process.
	 * @returns {string} A success message indicating that the account was activated successfully.
	 */
	static async confirmActivation(activationToken) {
		const { accountId } = await TokenHelper.verifyActivationToken(activationToken);

		const account = await AccountServices.findById(accountId);

		await AccountServices.#isAccountAlreadyActive(account.isActive);

		await AccountServices.isAccountVerified(account.isVerified);
		await AccountServices.isAccountDeleted(account.isDeleted);

		await AccountServices.updateOne(
			{ _id: accountId },
			{ isActive: true, activeStatusChangedAt: new Date() },
			{ activationToken: 1 }
		);

		return ACTIVATED_SUCCESSFULLY;
	}

	/**
	 * Terminates an account by setting its 'isDeleted' field to true.
	 *
	 * @param {string} accountId - The ID of the account to be terminated.
	 * @returns {string} A success message indicating that the account was deleted successfully.
	 */
	static async terminate(accountId) {
		await AccountServices.updateOne({ _id: accountId }, { isDeleted: true, isDeletedAt: new Date() });

		return ACCOUNT_DELETED_SUCCESSFULLY;
	}

	/**
	 * Cancels the termination process of the authenticated user's account.
	 *
	 * @param {string} email - The email of the account to cancel the deletion.
	 * @returns {Promise<string>} A promise that resolves to a string indicating the cancellation of the account deletion.
	 * @throws {BadRequestException} If the account is already deleted or not found.
	 */
	static async cancelTermination(email) {
		const foundAccount = await AccountServices.findOne({ email });

		if (!foundAccount) {
			throw new BadRequestException(ACCOUNT_IS_DELETED);
		}

		if (!foundAccount.isDeleted) {
			throw new BadRequestException(ALREADY_CANCELED_ACCOUNT_DELETION);
		}

		await AccountServices.updateOne({ _id: foundAccount._id }, { isDeleted: false }, { isDeletedAt: 1 });

		return CANCELED_ACCOUNT_DELETION;
	}

	/**
	 * Checks whether the account is verified and active. Throws an exception if the account is not verified or active.
	 *
	 * @param {Object} account - The account object to be checked.
	 * @throws {UnAuthorizedException} If the account is not verified or active.
	 * @returns {void}
	 */

	static isAccountVerifiedNotDeletedActive(account) {
		AccountServices.isAccountVerified(account.isVerified);
		AccountServices.isAccountDeleted(account.isDeleted);
		AccountServices.isAccountActive(account.isActive);
	}

	/**
	 * Checks whether the account is verified. Throws an exception if the account is not verified.
	 *
	 * @param {boolean} isVerified - The 'isVerified' field of the account object.
	 * @throws {UnAuthorizedException} If the account is not verified.
	 * @returns {void}
	 */
	static isAccountVerified(isVerified) {
		if (!isVerified) {
			throw new ForbiddenException(ACCOUNT_NEED_TO_BE_VERIFIED);
		}
	}

	/**
	 * Checks if the account is active and throws an exception if it is not.
	 *
	 * @param {boolean} isActive - A boolean value indicating if the account is active.
	 * @throws {UnAuthorizedException} Throws an exception if the account is not active.
	 * @returns {void}
	 */
	static isAccountActive(isActive) {
		if (!isActive) {
			throw new ForbiddenException(ACCOUNT_NEED_TO_BE_ACTIVE);
		}
	}

	/**
	 * Checks if the account is deleted and throws an exception if it is.
	 *
	 * @param {boolean} isActive - A boolean value indicating if the account is deleted.
	 * @throws {UnAuthorizedException} Throws an exception if the account is deleted.
	 * @returns {void}
	 */
	static isAccountDeleted(isDeleted) {
		if (isDeleted) {
			throw new ForbiddenException(ACCOUNT_IS_DELETED);
		}
	}

	/**
	 * Checks if the account is already active or not.
	 *
	 * @param {boolean} isActive - Indicates whether the account is active or not.
	 * @throws {BadRequestException} Throws an error if the account is already active.
	 * @private
	 */
	static #isAccountAlreadyActive(isActive) {
		if (isActive) {
			throw new ForbiddenException(ACCOUNT_ALREADY_ACTIVE);
		}
	}

	/**
	 * Checks if the provided activation token is valid or not.
	 *
	 * @param {string} activationToken - The activation token provided by the user.
	 * @throws {BadRequestException} Throws an error if the provided activation token is already verified.
	 * @private
	 */
	static async #hasValidActivationToken(activationToken) {
		if (activationToken) {
			const decodedActivationToken = await TokenHelper.verifyActivationToken(activationToken);

			if (decodedActivationToken) {
				throw new BadRequestException(ALREADY_HAVE_VALID_ACTIVATION_LINK);
			}
		}
	}

	/**
	 * Create an account in the database with the provided payload.
	 *
	 * @async
	 * @static
	 * @param {Object} payload - The account payload.
	 * @param {string} payload.email - The email of the account.
	 * @param {string} payload.password - The password of the account.
	 * @param {string} payload.firstName - The first name of the account owner.
	 * @param {string} payload.lastName - The last name of the account owner.
	 * @returns {Object} Returns the created account object.
	 */
	static async createOne(payload) {
		const password = await HashHelper.generate(payload.password);

		return await AccountRepository.insertOne({ ...payload, password });
	}

	/**
	 * Find an account by its ID.
	 *
	 * @async
	 * @static
	 * @param {string} accountId - The ID of the account to find.
	 * @returns {Object} Returns the account object if found, else null.
	 */
	static async findById(accountId) {
		return await AccountRepository.findById(accountId);
	}

	/**
	 * Find an account by the provided payload.
	 *
	 * @async
	 * @static
	 * @param {Object} payload - The account payload to search for.
	 * @returns {Object} Returns the account object if found, else null.
	 */
	static async findOne(payload) {
		return await AccountRepository.findOne(payload);
	}

	/**
	 * Update an account with the provided filter, setPayload, and unsetPayload.
	 *
	 * @async
	 * @static
	 * @param {Object} filter - The filter to find the account to update.
	 * @param {Object} setPayload - The payload to set on the account.
	 * @param {Object} unsetPayload - The payload to unset from the account.
	 * @returns {Object} Returns the updated account object.
	 */
	static async updateOne(filter, setPayload, unsetPayload) {
		return await AccountRepository.updateOne(filter, setPayload, unsetPayload);
	}

	/**
	 * Delete an account with the provided accountId.
	 *
	 * @async
	 * @static
	 * @param {string} accountId - The ID of the account to delete.
	 * @returns {Object} Returns the deletion result object.
	 */
	static async deleteOne(accountId) {
		return await AccountRepository.deleteOne(accountId);
	}
}

module.exports = AccountServices;
