const SmsHelper = require("./../sms");
const twilio = require("twilio");

jest.mock("twilio", () => {
	const mockClient = {
		messages: {
			create: jest.fn(),
		},
	};

	return jest.fn(() => mockClient);
});

describe("sendSms", () => {
	afterEach(() => {
		jest.clearAllMocks();
	});
	
	it("should send SMS in production environment", async () => {
		process.env.NODE_ENV = "production";
		process.env.TWILIO_ACCOUNT_ID = "test-account-id";
		process.env.TWILIO_AUTH_TOKEN = "test-auth-token";
		process.env.TWILIO_MESSAGING_SERVICE_ID = "test-messaging-service-id";

		const phoneNumber = "+123456789";
		const message = "test message";

		const mockTwilioClient = new twilio();

		// {sid: 'test-sid'}  => single key-value pairs object
		const mockCreate = jest.fn().mockResolvedValue({ sid: "test-sid" });

		mockTwilioClient.messages.create.mockImplementation(mockCreate);

		const result = await SmsHelper.sendSms(phoneNumber, message);

		expect(mockCreate).toHaveBeenCalledTimes(1);
		expect(mockCreate).toHaveBeenCalledWith({
			messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_ID,
			to: phoneNumber,
			body: message,
		});
		expect(result.sid).toEqual("test-sid");
	});

	it("should log the message and phone number when NODE_ENV is not production", async () => {
		process.env.NODE_ENV = "development";

		const consoleSpy = jest.spyOn(console, "log");

		const phoneNumber = "+123456789";
		const message = "test message";

		await SmsHelper.sendSms(phoneNumber, message);

		expect(consoleSpy).toHaveBeenCalledTimes(1);
		expect(consoleSpy).toHaveBeenCalledWith({ phoneNumber, message });
	});
});
