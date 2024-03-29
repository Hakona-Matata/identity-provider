/**
 * A module containing success and failure messages.
 * @module messages
 * @namespace
 */

module.exports = {
	/**
	 * Success messages
	 * @type {Object}
	 * @property {string} ACTIVATED_SUCCESSFULLY - The account is activated successfully!
	 * @property {string} ACCOUNT_DELETED_SUCCESSFULLY - The account Will be deleted permanently in 30 days!
	 * @property {string} CANCELED_ACCOUNT_DELETION - The account canceled successfully!
	 * @property {string} CHECK_MAIL_BOX - Please, check your mail box!
	 * @property {string} DEACTIVATED_SUCCESSFULLY - The account is deactivated successfully!
	 */
	SUCCESS_MESSAGES: {
		ACTIVATED_SUCCESSFULLY: "The account is activated successfully!",
		ACCOUNT_DELETED_SUCCESSFULLY: "The account Will be deleted permanently in 30 days!",
		CANCELED_ACCOUNT_DELETION: "The account canceled successfully!",
		CHECK_MAIL_BOX: "Please, check your mail box!",
		DEACTIVATED_SUCCESSFULLY: "The account is deactivated successfully!",
	},
	/**
	 * Failure messages
	 * @type {Object}
	 * @property {string} ACCOUNT_NEED_TO_BE_VERIFIED - Sorry, your email address isn't verified yet!
	 * @property {string} ACCOUNT_NEED_TO_BE_ACTIVE - Sorry, your account is currently deactivated!
	 * @property {string} ACCOUNT_ALREADY_ACTIVE - Sorry, your account is already active!
	 * @property {string} ALREADY_HAVE_VALID_ACTIVATION_LINK - Sorry, you still have a valid activation link in your mailbox!
	 * @property {string} ALREADY_CANCELED_ACCOUNT_DELETION - Sorry, you already canceled account deletion!
	 * @property {string} ACCOUNT_IS_DELETED - Sorry, the account is deleted!
	 */
	FAILURE_MESSAGES: {
		ACCOUNT_NEED_TO_BE_VERIFIED: "Sorry, your email address isn't verified yet!",
		ACCOUNT_NEED_TO_BE_ACTIVE: "Sorry, your account is currently deactivated!",
		ACCOUNT_ALREADY_ACTIVE: "Sorry, your account is already active!",
		ALREADY_HAVE_VALID_ACTIVATION_LINK: "Sorry, you still have a valid activation link in your mailbox!",
		ALREADY_CANCELED_ACCOUNT_DELETION: "Sorry, you already canceled account deletion!",
		ACCOUNT_IS_DELETED: "Sorry, the account is deleted!",
	},
};
