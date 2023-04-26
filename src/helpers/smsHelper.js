const twilio = require("twilio");

const client = new twilio(process.env.TWILIO_ACCOUNT_ID, process.env.TWILIO_AUTH_TOKEN);

class SmsHelper {
	static async sendSms(phoneNumber, message) {
		if (process.env.NODE_ENV === "production") {
			return await client.messages.create({
				messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_ID,
				to: phoneNumber,
				body: message,
			});
		}

		console.log({ phoneNumber, message });
	}
}

module.exports = SmsHelper;
