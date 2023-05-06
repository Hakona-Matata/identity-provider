/**
 * A module containing constant success and failure messages related to the OTP feature.
 * @module otpMessages
 * @type {Object}
 * @property {Object} SUCCESS_MESSAGES - Contains success messages related to OTP feature.
 * @property {string} SUCCESS_MESSAGES.OTP_SENT_SUCCESSFULLY - Success message when OTP code is sent successfully.
 * @property {string} SUCCESS_MESSAGES.OTP_CONFIRMED_SUCCESSFULLY - Success message when OTP feature is enabled successfully.
 * @property {string} SUCCESS_MESSAGES.OTP_DISABLED_SUCCESSFULLY - Success message when OTP feature is disabled successfully.
 * @property {string} SUCCESS_MESSAGES.OTP_VERIFIED_SUCCESSFULLY - Success message when OTP code is verified successfully.
 * @property {Object} FAILURE_MESSAGES - Contains failure messages related to OTP feature.
 * @property {string} FAILURE_MESSAGES.OTP_ALREADY_ENABLED - Failure message when OTP feature is already enabled.
 * @property {string} FAILURE_MESSAGES.OTP_ALREADY_DISABLED - Failure message when OTP feature is already disabled.
 * @property {string} FAILURE_MESSAGES.ALREADY_HAVE_VALID_OTP - Failure message when a valid OTP code already exists.
 * @property {string} FAILURE_MESSAGES.EXPIRED_OTP - Failure message when OTP code is expired.
 * @property {string} FAILURE_MESSAGES.INVALID_OTP - Failure message when OTP code is invalid.
 * @property {string} FAILURE_MESSAGES.REACHED_MAXIMUM_WRONG_TRIES - Failure message when the maximum number of attempts to enter OTP code is reached.
 */
module.exports = {
	SUCCESS_MESSAGES: {
		OTP_SENT_SUCCESSFULLY: "Please, check your mailbox for the OTP code!",
		OTP_CONFIRMED_SUCCESSFULLY: "OTP is enabled successfully!",
		OTP_DISABLED_SUCCESSFULLY: "You disabled OTP successfully!",
		OTP_VERIFIED_SUCCESSFULLY: "The OTP verified successfully!",
	},
	FAILURE_MESSAGES: {
		OTP_ALREADY_ENABLED: "Sorry, the OTP feature is already enabled!",
		OTP_ALREADY_DISABLED: "Sorry, the otp feature is already disabled!",
		ALREADY_HAVE_VALID_OTP: "Sorry, you still have a valid OTP in your mailbox!",
		EXPIRED_OTP: "Sorry, the otp code may be expired!",
		INVALID_OTP: "Sorry, your OTP is invalid!",
		REACHED_MAXIMUM_WRONG_TRIES: "Sorry, You have reached your maximum wrong tries!",
	},
};
