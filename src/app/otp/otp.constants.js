module.exports = {
	SUCCESS_MESSAGES: {
		OTP_SENT_SUCCESSFULLY: "Please, check your mailbox for the OTP code!",
		OTP_CONFIRMED_SUCCESSFULLY: "OTP is enabled successfully!",
		OTP_DISABLED_SUCCESSFULLY: "You disabled OTP successfully!",
		OTP_VERIFIED_SUCCESSFULLY: "The OTP verified successfully!",
	},
	FAILURE_MESSAGES: {
		OTP_ALREADY_ENABLED: "Sorry, the OTP feature is already enabled!",
		OTP_ALREADY_DISABLED: "Sorry, the otp feature is already disabled!",
		ALREADY_HAVE_VALID_OTP: "Sorry, you still have a valid OTP in your mailbox!",
		EXPIRED_OTP: "Sorry, the otp may be expired!",
		INVALID_OTP: "Sorry, your OTP is invalid!",
		REACHED_MAXIMUM_WRONG_TRIES: "Sorry, You have reached your maximum wrong tries!",

		OTP_CREATE_FAILED: "Sorry, the otp creation process failed!",
		OTP_READ_FAILED: "Sorry, the otp read process failed!",
		OTP_UPDATE_FAILED: "Sorry, the otp update process failed!",
		OTP_DELETE_FAILED: "Sorry, the otp delete process failed!",
	},
};
