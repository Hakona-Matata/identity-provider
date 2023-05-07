/**
 * A module for defining success and failure messages related to TOTP feature.
 * @module TOTP_MESSAGES
 *
 * @property {Object} SUCCESS_MESSAGES - An object containing success messages related to TOTP feature.
 * @property {string} SUCCESS_MESSAGES.TOTP_ENABLED_SUCCESSFULLY - The message for successful TOTP feature enabling.
 * @property {string} SUCCESS_MESSAGES.TOTP_DISABLED_SUCCESSFULLY - The message for successful TOTP feature disabling.
 *
 * @property {Object} FAILURE_MESSAGES - An object containing failure messages related to TOTP feature.
 * @property {string} FAILURE_MESSAGES.TOTP_ALREADY_ENABLED - The message for already enabled TOTP feature.
 * @property {string} FAILURE_MESSAGES.TOTP_ALREADY_DISABLED - The message for already disabled TOTP feature.
 * @property {string} FAILURE_MESSAGES.TOTP_ALREADY_CONFIRMED - The message for already confirmed TOTP feature.
 * @property {string} FAILURE_MESSAGES.TOTP_NOT_ENABLED - The message for TOTP feature not enabled.
 * @property {string} FAILURE_MESSAGES.START_FROM_SCRATCH - The message for starting TOTP feature from scratch.
 * @property {string} FAILURE_MESSAGES.INVALID_TOTP - The message for invalid TOTP.
 * @property {string} FAILURE_MESSAGES.TOTP_NOT_FOUND - The message for TOTP not found.
 */
module.exports = {
	SUCCESS_MESSAGES: {
		TOTP_ENABLED_SUCCESSFULLY: "The TOTP feature is enabled successfully!",
		TOTP_DISABLED_SUCCESSFULLY: "The TOTP feature is disabled successfully!",
	},
	FAILURE_MESSAGES: {
		TOTP_ALREADY_ENABLED: "Sorry, you already enabled TOTP!",
		TOTP_ALREADY_DISABLED: "Sorry, you already disabled TOTP!",
		TOTP_ALREADY_CONFIRMED: "Sorry, you already confirmed TOTP!",
		TOTP_NOT_ENABLED: "Sorry, the TOTP feature is not enabled!",
		START_FROM_SCRATCH: "Sorry, you need to start from scratch!",
		INVALID_TOTP: "Sorry, the totp is invalid!",
		TOTP_NOT_FOUND: "Sorry, the TOTP is not found!",
	},
};
