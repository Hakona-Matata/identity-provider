/**
 * Object containing success and failure messages related to the Backup codes feature.
 * @typedef {Object} BackupCodeMessages
 * @property {Object} SUCCESS_MESSAGES - Object containing success messages related to the Backup codes feature.
 * @property {string} SUCCESS_MESSAGES.BACKUP_ENABLED_SUCCESSFULLY - The message to show when the Backup codes feature is enabled successfully.
 * @property {string} SUCCESS_MESSAGES.BACKUP_DISABLED_SUCCESSFULLY - The message to show when the Backup codes feature is disabled successfully.
 * @property {Object} FAILURE_MESSAGES - Object containing failure messages related to the Backup codes feature.
 * @property {string} FAILURE_MESSAGES.BACKUP_ALREADY_ENABLED - The message to show when the Backup codes feature is already enabled.
 * @property {string} FAILURE_MESSAGES.BACKUP_ALREADY_DISABLED - The message to show when the Backup codes feature is already disabled.
 * @property {string} FAILURE_MESSAGES.BACKUP_CANNOT_ENABLED - The message to show when backup codes cannot be generated because no 2fa methods are enabled.
 * @property {string} FAILURE_MESSAGES.BACKUP_NOT_GENERATED - The message to show when backup codes have not yet been generated.
 * @property {string} FAILURE_MESSAGES.BACKUP_NOT_ENABLED - The message to show when backup codes are not enabled.
 * @property {string} FAILURE_MESSAGES.BACKUP_ALREADY_GENERATED - The message to show when backup codes have already been generated.
 * @property {string} FAILURE_MESSAGES.INVALID_BACKUP - The message to show when an invalid backup code is provided.
 * @property {string} FAILURE_MESSAGES.NEED_TO_HAVE_GENERATED - The message to show when backup codes can only be regenerated if they have already been generated once.
 */

/**
 * Exported object containing success and failure messages related to the Backup codes feature.
 * @type {BackupCodeMessages}
 */
module.exports = {
	SUCCESS_MESSAGES: {
		BACKUP_ENABLED_SUCCESSFULLY: "The Backup codes feature is enabled successfully!",
		BACKUP_DISABLED_SUCCESSFULLY: "The backup codes feature is disabled successfully!",
	},
	FAILURE_MESSAGES: {
		BACKUP_ALREADY_ENABLED: "Sorry, the backup codes feature is already enabled!",
		BACKUP_ALREADY_DISABLED: "Sorry, the backup codes feature is already disabled!",
		BACKUP_CANNOT_ENABLED: "Sorry, you can't generate backup codes without any enabled 2fa methods!",
		BACKUP_NOT_GENERATED: "Sorry, you have to generate the backup codes first!",
		BACKUP_NOT_ENABLED: "Sorry, the backup codes feature is not enabled!",
		BACKUP_ALREADY_GENERATED: "Sorry, you already generated backup codes!",
		INVALID_BACKUP: "Sorry, the given backup code is invalid!",
		NEED_TO_HAVE_GENERATED: "Sorry, you can only regenerate backup codes if you have already generated them once!",
	},
};
