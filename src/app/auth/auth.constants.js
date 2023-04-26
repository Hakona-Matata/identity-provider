/**
 * A module that exports success and failure messages related to authentication.
 *
 * @module authMessages
 * @property {Object} SUCCESS_MESSAGES - An object containing success messages related to authentication.
 * @property {string} SUCCESS_MESSAGES.SIGN_UP_SUCCESSFULLY - A success message for when a user signs up successfully.
 * @property {string} SUCCESS_MESSAGES.ACCOUNT_VERIFIED_SUCCESSFULLY - A success message for when a user's account is verified successfully.
 * @property {string} SUCCESS_MESSAGES.LOGGED_OUT_SUCCESSFULLY - A success message for when a user logs out successfully.
 * @property {Object} FAILURE_MESSAGES - An object containing failure messages related to authentication.
 * @property {string} FAILURE_MESSAGES.ACCOUNT_ALREADY_VERIFIED - A failure message for when a user's account is already verified.
 * @property {string} FAILURE_MESSAGES.WRONG_EMAIL_OR_PASSWORD - A failure message for when the email or password is incorrect.
 */
module.exports = {
	SUCCESS_MESSAGES: {
		SIGN_UP_SUCCESSFULLY: "Please, check your mailbox to verify your email address!",
		ACCOUNT_VERIFIED_SUCCESSFULLY: "Your account is verified successfully!",
		LOGGED_OUT_SUCCESSFULLY: "Logged out successfully!",
	},
	FAILURE_MESSAGES: {
		ACCOUNT_ALREADY_VERIFIED: "Sorry, your account is already verified!",
		WRONG_EMAIL_OR_PASSWORD: "Sorry, email or password are incorrect!",
	},
};
