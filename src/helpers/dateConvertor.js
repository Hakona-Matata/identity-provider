class DateConvertor {
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
