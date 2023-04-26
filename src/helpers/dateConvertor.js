/**
 * A utility class for converting dates and durations.
 */
class DateConvertor {
	/**
	 * Converts an ISO date string and an expiration duration into an object
	 * containing the remaining days, hours, and minutes until expiration.
	 *
	 * @param {string} ISODate - The ISO date string representing the start date.
	 * @param {number} expiresAfterSeconds - The duration in seconds until expiration.
	 * @returns {object} An object with the remaining days, hours, and minutes.
	 */
	static dateToDaysHoursMinutes(ISODate, expiresAfterSeconds) {
		const currentDate = Date.now();
		const givenDate = new Date(ISODate);
		givenDate.setSeconds(givenDate.getSeconds() + expiresAfterSeconds);

		const difference = givenDate.getTime() - currentDate;
		if (difference < 0) {
			return { days: 0, hours: 0, minutes: 0 };
		}

		const days = Math.floor(difference / (24 * 60 * 60 * 1000));
		const hours = Math.floor((difference / (60 * 60 * 1000)) % 24);
		const minutes = Math.floor((difference / (60 * 1000)) % 60);

		return { days, hours, minutes };
	}
}

module.exports = DateConvertor;
