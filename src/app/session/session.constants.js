/**
 * A module that exports success and failure messages related to session operations.
 * @module session.constants
 */

module.exports = {
	/**
	 * Success messages related to session operations.
	 * @type {Object}
	 * @property {string} SESSION_CANCELED_SUCCESSFULLY - The message for successful session cancellation.
	 */
	SUCCESS_MESSAGES: { SESSION_CANCELED_SUCCESSFULLY: "The session is canceled successfully!" },

	/**
	 * Failure messages related to session operations.
	 * @type {Object}
	 * @property {string} SESSION_NOT_FOUND - The message for session not found error.
	 * @property {string} SESSIONS_NOT_FOUND - The message for sessions not found error.
	 * @property {string} SESSION_CREATION_FAILED - The message for session creation failed error.
	 * @property {string} SESSION_DELETION_FAILED - The message for session deletion failed error.
	 * @property {string} SESSIONS_DELETION_FAILED - The message for sessions deletion failed error.
	 * @property {string} SESSION_REVOKED - The message for already revoked session error.
	 */
	FAILURE_MESSAGES: {
		SESSION_NOT_FOUND: "Sorry, the session is not found!",
		SESSIONS_NOT_FOUND: "Sorry, the sessions are not found!",
		SESSION_CREATION_FAILED: "Sorry, the session creation operation failed!",
		SESSION_DELETION_FAILED: "Sorry, the session deletion process failed!",
		SESSIONS_DELETION_FAILED: "Sorry, the sessions deletion process failed!",
		SESSION_REVOKED: "Sorry, the session may be already revoked!",
	},
};
