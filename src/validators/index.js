const Joi = require("joi");
const validationMessages = require("./validationMessages");
const { roles } = require("./../constants/index");
const isValidObjectId = require("./../helpers/isValidObjectId");
const { validatePhone } = require("./../helpers/phone");

module.exports = {
	email: Joi.string()
		.trim()
		.min(15)
		.max(40)
		.email({ tlds: { allow: false } })
		.required()
		.messages({ ...validationMessages }),
	token: Joi.string()
		.trim()
		.min(3)
		.max(300)
		.required()
		.messages({ ...validationMessages }),
	userName: Joi.string()
		.alphanum()
		.trim()
		.min(5)
		.max(20)
		.required()
		.messages({ ...validationMessages }),
	password: Joi.string()
		.trim()
		.min(8)
		.max(16)
		.pattern(new RegExp("^(?=(.*[a-z]){2,})(?=(.*[A-Z]){2,})(?=(.*[0-9]){2,})(?=(.*[!@#$%^&*()-__+.]){2,}).{8,16}$"))
		.required()
		.messages({ ...validationMessages }),
	confirmPassword: Joi.string()
		.trim()
		.required()
		.valid(Joi.ref("password"))
		.messages({ ...validationMessages, "any.only": `"confirmPassword" field must match "password" field!` }),
	role: Joi.string()
		.trim()
		.valid(...Object.keys(roles))
		.required()
		.messages({ ...validationMessages }),
	code: Joi.string()
		.trim()
		.trim()
		.length(16)
		.required()
		.pattern(/^[A-Za-z0-9]+$/)
		.messages({ ...validationMessages, "string.pattern.base": "Code should only contain letters and numbers" }),
	id: Joi.string()
		.trim()
		.required()
		.custom((value, helper) => {
			const valid = isValidObjectId(`${value}`);
			return valid ? value : helper.message(validationMessages.custom);
		})
		.messages({ ...validationMessages }),
	phone: Joi.string()
		.trim()
		.required()
		.custom((value, helper) => {
			const { isValid, phone, country } = validatePhone(value);
			return isValid ? { phone, country } : helper.message(validationMessages.custom);
		})
		.messages({ ...validationMessages }),
	code: Joi.string()
		.trim()
		.length(6)
		.required()
		.regex(/^\d+$/)
		.messages({ ...validationMessages, "string.pattern.base": "{{#label}} should contain only numbers" }),
};
