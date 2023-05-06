/**
 * A module that contains success and failure messages related to password resetting functionality.
 * @module PasswordResetMessages
 * @type {Object}
 * @property {Object} SUCCESS_MESSAGES - An object containing success messages related to password resetting functionality.
 * @property {string} SUCCESS_MESSAGES.PASSWORD_CHANGED_SUCCESSFULLY - A message indicating that the password has been changed successfully.
 * @property {string} SUCCESS_MESSAGES.ACCOUNT_RESET_SUCCESSFULLY - A message indicating that the password has been reset successfully.
 * @property {string} SUCCESS_MESSAGES.CHECK_MAIL_BOX - A message indicating to the user to check their mailbox.
 * @property {Object} FAILURE_MESSAGES - An object containing failure messages related to password resetting functionality.
 * @property {string} FAILURE_MESSAGES.INCORRECT_PASSWORD - A message indicating that the given password is incorrect.
 * @property {string} FAILURE_MESSAGES.ALREADY_HAVE_VALID_RESET_LINK - A message indicating that the mailbox already has a valid reset link.
 * @property {string} FAILURE_MESSAGES.ALREADY_RESET_ACCOUNT - A message indicating that the user has already reset their password.
 */
module.exports = {
	SUCCESS_MESSAGES: {
		PASSWORD_CHANGED_SUCCESSFULLY: "The password is changed successfully!",
		ACCOUNT_RESET_SUCCESSFULLY: "Password reset successfully!",
		CHECK_MAIL_BOX: "Please, check your mail box!",
	},
	FAILURE_MESSAGES: {
		INCORRECT_PASSWORD: "Sorry, the given password is incorrect!",
		ALREADY_HAVE_VALID_RESET_LINK: "Sorry, your mailbox already has a valid reset link!",
		ALREADY_RESET_ACCOUNT: "Sorry, you already reset your password!",
	},
};
