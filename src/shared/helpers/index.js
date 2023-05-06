const DateConvertor = require("./dateConvertor.helper");
const Encryptor = require("./encryptor.helper");
const HashHelper = require("./hash.helper");
const isValidObjectId = require("./isValidObjectId.helper");
const PhoneValidator = require("./phoneValidator.helper");
const RandomGenerator = require("./randomGenerator.helper");
const SmsHelper = require("./sms.helper");
const TokenHelper = require("./token.helper");
const TotpHelper = require("./totp.helper");
const validateInput = require("./validateInput.helper");

/**
 * A collection of helper functions.
 * @module helpers
 * @property {Object} DateConvertor - An object containing functions to convert dates between different formats.
 * @property {Object} Encryptor - An object containing functions to encrypt and decrypt data.
 * @property {Object} HashHelper - An object containing functions to hash data.
 * @property {Function} isValidObjectId - A function that checks if a string is a valid MongoDB ObjectID.
 * @property {Object} PhoneValidator - An object containing functions to validate phone numbers.
 * @property {Object} RandomGenerator - An object containing functions to generate random data.
 * @property {Object} SmsHelper - An object containing functions to send SMS messages.
 * @property {Object} TokenHelper - An object containing functions to generate and verify JSON Web Tokens (JWT).
 * @property {Object} TotpHelper - An object containing functions to generate and verify Time-based One-time Passwords (TOTPs).
 * @property {Function} validateInput - A function that validates input using a schema and returns a Promise.
 */

module.exports = {
	DateConvertor,
	Encryptor,
	HashHelper,
	isValidObjectId,
	PhoneValidator,
	RandomGenerator,
	SmsHelper,
	TokenHelper,
	TotpHelper,
	validateInput,
};
