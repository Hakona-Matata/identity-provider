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
	 * @property {string} SESSION_REVOKED - The message for already revoked session error.
	 */
	FAILURE_MESSAGES: {
		SESSION_REVOKED: "Sorry, the session may be already revoked!",
	},
};
