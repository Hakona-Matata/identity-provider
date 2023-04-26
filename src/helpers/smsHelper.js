/**
 * A helper class for sending SMS messages using Twilio API.
 * @class
 * @classdesc A helper class that provides methods to send SMS messages using Twilio API.
 */
const twilio = require("twilio");

const client = new twilio(process.env.TWILIO_ACCOUNT_ID, process.env.TWILIO_AUTH_TOKEN);

class SmsHelper {
	/**
	 * Sends an SMS message to the given phone number using Twilio API.
	 * @async
	 * @param {string} phoneNumber - The phone number of the recipient in E.164 format.
	 * @param {string} message - The message to be sent.
	 * @returns {Promise<*>} A Promise that resolves to the result of the SMS message sending operation.
	 * @throws {Error} If an error occurs while sending the SMS message.
	 */
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
