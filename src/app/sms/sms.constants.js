module.exports = {
	SUCCESS_MESSAGES: {
		SMS_SENT_SUCCESSFULLY: "The OTP code sent to your phone successfully!",
		SMS_ENABLED_SUCCESSFULLY: "The OTP over SMS feature is enabled successfully!",
		SMS_DISABLED_SUCCESSFULLY: "The OTP over SMS feature disabled successfully!",
		SMS_VERIFIED_SUCCESSFULLY: "the OTP is verified successfully!",
	},
	FAILURE_MESSAGES: {
		SMS_ALREADY_ENABLED: "Sorry, you already enabled SMS!",
		ALREADY_HAVE_VALID_SMS: "Sorry, the OTP sent to your phone is still valid!",
		EXPIRED_SMS: "Sorry, the given otp is expired!",
		INVALID_OTP: "Sorry, the given otp is invalid!",
		ALREADY_DISABLED_SMS: "Sorry, you already disabled OTP over SMS feature!",

		SMS_CREATE_FAILED: "Sorry, the creation of otp over sms failed!",
		SMS_READ_FAILED: "Sorry, the finding of otp over sms failed!",
		SMS_UPDATE_FAILED: "Sorry, the otp over sms update failed!",
		SMS_DELETE_FAILED: "Sorry, the deletion of otp over sms failed!",
	},
};
