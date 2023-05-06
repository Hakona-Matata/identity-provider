/**
 * Object representing success messages for SMS OTP feature.
 * @typedef {Object} SUCCESS_MESSAGES
 * @property {string} SMS_SENT_SUCCESSFULLY - Message indicating that the OTP code has been sent successfully.
 * @property {string} SMS_ENABLED_SUCCESSFULLY - Message indicating that the OTP over SMS feature has been enabled successfully.
 * @property {string} SMS_DISABLED_SUCCESSFULLY - Message indicating that the OTP over SMS feature has been disabled successfully.
 */

/**
 * Object representing failure messages for SMS OTP feature.
 * @typedef {Object} FAILURE_MESSAGES
 * @property {string} SMS_ALREADY_ENABLED - Message indicating that the OTP over SMS feature is already enabled.
 * @property {string} ALREADY_HAVE_VALID_SMS - Message indicating that the OTP sent to the user's phone is still valid.
 * @property {string} EXPIRED_SMS - Message indicating that the OTP code is expired.
 * @property {string} INVALID_OTP - Message indicating that the OTP code is invalid.
 * @property {string} ALREADY_DISABLED_SMS - Message indicating that the OTP over SMS feature is already disabled.
 * @property {string} SMS_NOT_FOUND - Message indicating that the SMS document is not found.
 * @property {string} SMS_CREATE_FAILED - Message indicating that the creation of the OTP over SMS feature has failed.
 * @property {string} SMS_READ_FAILED - Message indicating that the finding of the OTP over SMS feature has failed.
 * @property {string} SMS_UPDATE_FAILED - Message indicating that the update of the OTP over SMS feature has failed.
 * @property {string} SMS_DELETION_FAILED - Message indicating that the deletion of the OTP over SMS feature has failed.
 */

/**
 * Object representing the SMS OTP feature messages.
 * @typedef {Object} SMS_OTP_MESSAGES
 * @property {SUCCESS_MESSAGES} SUCCESS_MESSAGES - Object representing success messages for SMS OTP feature.
 * @property {FAILURE_MESSAGES} FAILURE_MESSAGES - Object representing failure messages for SMS OTP feature.
 */

/**
 * @type {SMS_OTP_MESSAGES} The object containing the success and failure messages for the SMS OTP feature.
 */
module.exports = {
	SUCCESS_MESSAGES: {
		SMS_SENT_SUCCESSFULLY: "The OTP code sent to your phone successfully!",
		SMS_ENABLED_SUCCESSFULLY: "The OTP over SMS feature is enabled successfully!",
		SMS_DISABLED_SUCCESSFULLY: "The OTP over SMS feature disabled successfully!",
	},
	FAILURE_MESSAGES: {
		SMS_ALREADY_ENABLED: "Sorry, you already enabled SMS!",
		ALREADY_HAVE_VALID_SMS: "Sorry, the OTP sent to your phone is still valid!",
		EXPIRED_SMS: "Sorry, the given otp is expired!",
		INVALID_OTP: "Sorry, the given otp is invalid!",
		REACHED_MAXIMUM_WRONG_TRIES: "Sorry, You have reached your maximum wrong tries!",
		ALREADY_DISABLED_SMS: "Sorry, you already disabled OTP over SMS feature!",
		CANNOT_VERIFY: "Sorry, you can't verify OTP over SMS!",
		SMS_NOT_FOUND: "Sorry, the sms document is not found!",
		SMS_CREATE_FAILED: "Sorry, the creation of otp over sms failed!",
		SMS_READ_FAILED: "Sorry, the finding of otp over sms failed!",
		SMS_UPDATE_FAILED: "Sorry, the otp over sms update failed!",
		SMS_DELETION_FAILED: "Sorry, the deletion of otp over sms failed!",
	},
};
