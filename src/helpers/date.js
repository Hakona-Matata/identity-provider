const date_to_days_hours_minutes = ({ ISODate, expiresAfterSeconds }) => {
	const currentDate = new Date().getTime();
	const givenDate = new Date(ISODate).getTime() + expiresAfterSeconds;

	const difference = givenDate - currentDate;

	const days = Math.floor(difference / 86400_000);
	const hours = Math.floor((difference % 86400000) / 3600000);
	const minutes = Math.floor((difference % 3600000) / 60000);

	return { days, hours, minutes };
};

module.exports = date_to_days_hours_minutes;
