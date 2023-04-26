const awaitAll = require("./awaitAll");
const DateConvertor = require("./dateConvertor");
const Encryptor = require("./encryptor");
const HashHelper = require("./hashHelper");
const isValidObjectId = require("./isValidObjectId");
const PhoneValidator = require("./phoneValidator");
const RandomGenerator = require("./randomGenerator");
const SmsHelper = require("./smsHelper");
const TokenHelper = require("./tokenHelper");
const TotpHelper = require("./totpHelper");
const validateInput = require("./validateInput");

/**
 * A collection of helper functions.
 * @module helpers
 * @property {Function} awaitAll - A function that awaits multiple promises at once.
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
	awaitAll,
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
