const Joi = require("joi");
const validationMessages = require("./validationMessages");
const { roles } = require("./../constants/index");
const isValidObjectId = require("./../helpers/isValidObjectId");
const { validatePhone } = require("../helpers/phoneValidator");

/**
 * Joi validation schema for email.
 *
 * @type {import("joi").StringSchema}
 */
const email = Joi.string()
	.trim()
	.min(15)
	.max(40)
	.email({ tlds: { allow: false } })
	.required()
	.messages({ ...validationMessages });

/**
 * Joi validation schema for token.
 *
 * @type {import("joi").StringSchema}
 */
const token = Joi.string()
	.trim()
	.min(64)
	.max(300)
	.required()
	.messages({ ...validationMessages });

/**
 * Joi validation schema for userName.
 *
 * @type {import("joi").StringSchema}
 */
const userName = Joi.string()
	.alphanum()
	.trim()
	.min(5)
	.max(20)
	.required()
	.messages({ ...validationMessages });

/**
 * Joi validation schema for password.
 *
 * @type {import("joi").StringSchema}
 */
const password = Joi.string()
	.trim()
	.pattern(new RegExp("^(?=(.*[a-z]){2,})(?=(.*[A-Z]){2,})(?=(.*[0-9]){2,})(?=(.*[!@#$%^&*()-__+.]){2,}).{8,16}$"))
	.required()
	.messages({
		...validationMessages,
		"string.pattern.base": `"password" field must include at least(2 upper, 2 lower characters, 2 numbers and 2 special characters) and (8-16) characters`,
	});

/**
 * Joi validation schema for confirmPassword.
 *
 * @type {import("joi").StringSchema}
 */
const confirmPassword = Joi.string()
	.trim()
	.required()
	.valid(Joi.ref("password"))
	.messages({ ...validationMessages, "any.only": `"confirmPassword" field must match "password" field!` });

/**
 * Joi validation schema for role.
 *
 * @type {import("joi").StringSchema}
 */
const role = Joi.string()
	.trim()
	.valid(...Object.keys(roles))
	.required()
	.messages({ ...validationMessages });

/**
 * Joi validation schema for code.
 *
 * @type {import("joi").StringSchema}
 */
const code = Joi.string()
	.trim()
	.trim()
	.length(16)
	.required()
	.pattern(/^[A-Za-z0-9]+$/)
	.messages({ ...validationMessages, "string.pattern.base": "Code should only contain letters and numbers" });

/**
 * Joi validation schema for id.
 *
 * @type {import("joi").StringSchema}
 */
const id = Joi.string()
	.trim()
	.required()
	.custom((value, helper) => {
		const valid = isValidObjectId(`${value}`);
		return valid ? value : helper.message(validationMessages.custom);
	})
	.messages({ ...validationMessages });

/**
 * Joi validation schema for phone.
 *
 * @type {import("joi").StringSchema}
 */
const phone = Joi.string()
	.trim()
	.required()
	.custom((value, helper) => {
		const { isValid, phone, country } = validatePhone(value);
		return isValid ? { phone, country } : helper.message(validationMessages.custom);
	})
	.messages({ ...validationMessages });

module.exports = {
	email,
	token,
	userName,
	password,
	confirmPassword,
	role,
	code,
	id,
	phone,
};
