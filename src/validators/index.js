const Joi = require("joi");
const { roles } = require("./../constants/index");
const isValidObjectId = require("./../helpers/isValidObjectId");
const { validatePhone } = require("./../helpers/phone");

const stringMessages = {
	base: `"{#key}" field has to be of type string!`,
	email: `"{#key}" field has to be a valid email!`,
	empty: `"{#key}" field can't be empty!`,
	min: `"{#key}" field can't be less than {#limit} characters!`,
	max: `"{#key}" field can't be more than {#limit} characters!`,
};

const passwordMessages = {
	base: `"{#key}" field has to be of type string!`,
	empty: `"{#key}" field can't be empty!`,
	min: `"{#key}" field can't be less than {#limit} characters!`,
	max: `"{#key}" field can't be more than {#limit} characters!`,
	pattern: `"password" field must include at least(2 upper, 2 lower characters, 2 numbers and 2 special characters)`,
};

const customMessages = {
	required: `"{#key}" field is required!`,
	alphanum: `"{#key}" field can only contain alphabet and numbers!`,
	only: `Sorry, the only allowed {#key} are [${Object.keys(roles)}]!`,
	length: `"{#key}" field length must be {#limit} characters!`,
	custom: `the {#key} field is not valid!`,
};

module.exports = {
	email: Joi.string().trim().min(15).max(40).email().required().messages(stringMessages),
	token: Joi.string().trim().min(3).max(300).required().messages(stringMessages),
	userName: Joi.string().alphanum().trim().min(5).max(20).required().messages(stringMessages),
	password: Joi.string()
		.trim()
		.min(8)
		.max(16)
		.pattern(new RegExp("^(?=(.*[a-z]){2,})(?=(.*[A-Z]){2,})(?=(.*[0-9]){2,})(?=(.*[!@#$%^&*()-__+.]){2,}).{8,16}$"))
		.required()
		.messages(passwordMessages),
	confirmPassword: Joi.string()
		.required()
		.valid(Joi.ref("password"))
		.messages({ only: `"confirmPassword" field doesn't match "password" field` }),
	role: Joi.string()
		.valid(...Object.keys(roles))
		.required()
		.messages(customMessages),
	code: Joi.string().length(16).required().messages(customMessages),
	otp: Joi.number().integer().positive().required().min(100_000).max(999999).messages(customMessages),
	id: Joi.string()
		.required()
		.custom((value, helper) => {
			const valid = isValidObjectId(`${value}`);
			return valid ? value : helper.message(customMessages.custom);
		})
		.messages(customMessages),
	phone: Joi.string()
		.required()
		.custom((value, helper) => {
			const { isValid, phone, country } = validatePhone(value);
			return isValid ? { phone, country } : helper.message(customMessages.custom);
		})
		.messages(customMessages),

	totp: Joi.string().length(6).required().messages({
		"string.base": `"totp" field has to be of type string!`,
		"string.empty": `"totp" field can't be empty!`,
		"string.length": `"totp" field length must be 6 digits!`,
		"any.required": `"totp" field is required!`,
	}),
};

// module.exports = {
// 	email: Joi.string().trim().min(15).max(40).email().required().messages({
// 		"string.base": `"email" field has to be of type string!`,
// 		"string.email": `"email" field has to be a valid email!`,
// 		"string.empty": `"email" field can't be empty!`,
// 		"string.min": `"email" field can't be less than 15 characters!`,
// 		"string.max": `"email" field can't be more than 40 characers!`,
// 		"any.required": `"email" field is required!`,
// 	}),
// 	token: Joi.string().trim().min(3).max(300).required().messages({
// 		"string.base": `"token" has to be of type string!`,
// 		"string.empty": `"token" can't be empty!`,
// 		"string.min": `"token" can't be true!`,
// 		"string.max": `"token" can't be true!`,
// 		"any.required": `"token" is required!`,
// 	}),

// 	userName: Joi.string().alphanum().trim().min(5).max(20).required().messages({
// 		"string.base": `"userName" field has to be of type string!`,
// 		"string.min": `"userName" field can't be less than 5 characters!`,
// 		"string.max": `"userName" field can't be more than 20 characers!`,
// 		"any.required": `"userName" field is required!`,
// 		"string.alphanum": `"userName" field can only contains alphabet and numbers!`,
// 	}),
// 	password: Joi.string()
// 		.trim()
// 		.min(8)
// 		.max(16)
// 		.pattern(new RegExp("^(?=(.*[a-z]){2,})(?=(.*[A-Z]){2,})(?=(.*[0-9]){2,})(?=(.*[!@#$%^&*()-__+.]){2,}).{8,16}$"))
// 		.required()
// 		.messages({
// 			"string.base": `"password" field has to be of type string!`,
// 			"string.empty": `"password" field can't be empty!`,
// 			"string.min": `"password" field can't be less than 8 characters!`,
// 			"string.max": `"password" field can't be more than 16 characers!`,
// 			"any.required": `"password" field is required!`,
// 			"string.pattern.base": `"password" field must include at least(2 upper, 2 lower characters, 2 numbers and 2 special characters)`,
// 		}),
// 	confirmPassword: Joi.string().required().valid(Joi.ref("password")).messages({
// 		"any.only": `"confirmPassword" field doesn't match "password" field`,
// 	}),
// 	role: Joi.string()
// 		.valid(...Object.keys(roles))
// 		.required()
// 		.messages({
// 			"any.required": `"role" field is required!`,
// 			"any.only": `Sorry, the only allowed roles are [${Object.keys(roles)}]!`,
// 			"string.empty": `"role" field can't be empty!`,
// 			"string.base": `"role" field has to be of type string!`,
// 		}),
// 	// backup code
// 	code: Joi.string().length(16).required().messages({
// 		"string.base": `"code" field has to be of type string!`,
// 		"string.empty": `"code" field can't be empty!`,
// 		"string.length": `"code" field length must be 16 characters!`,
// 		"any.required": `"code" field is required!`,
// 	}),

// 	otp: Joi.number().integer().positive().required().min(100_000).max(999999).messages({
// 		"any.required": `"otp" field is required!`,
// 		"number.base": `"otp" field has to be of type number!`,
// 		"number.integer": `"otp" field has to be integer!`,
// 		"number.positive": `"otp" field has to be positive!`,
// 		"number.min": `"otp" field has to be 6 digits!`,
// 		"number.max": `"otp" field has to be 6 digits!`,
// 	}),

// 	id: Joi.string()
// 		.required()
// 		.custom((value, helper) => {
// 			const valid = isValidObjectId(`${value}`);

// 			return valid ? value : helper.error("any.custom");
// 		})
// 		.messages({
// 			"string.base": `the id field has to be of type string!`,
// 			"string.empty": `the id field can't be empty!`,
// 			"any.custom": `the id field is not a valid ID`,
// 			"any.required": `the id field is required!`,
// 		}),

// 	phone: Joi.string()
// 		.required()
// 		.custom((value, helper) => {
// 			const { isValid, phone, country } = validatePhone(value);

// 			return !isValid ? helper.error("any.custom") : { phone, country };
// 		})
// 		.messages({
// 			"string.base": `"phone" field has to be of type string!`,
// 			"string.empty": `"phone" field can't be empty!`,
// 			"any.required": `"phone" field is required!`,
// 			"any.custom": `"phone" field is invalid (Must be in "E.164" format)`,
// 		}),

// 	totp: Joi.string().length(6).required().messages({
// 		"string.base": `"totp" field has to be of type string!`,
// 		"string.empty": `"totp" field can't be empty!`,
// 		"string.length": `"totp" field length must be 6 digits!`,
// 		"any.required": `"totp" field is required!`,
// 	}),
// };
