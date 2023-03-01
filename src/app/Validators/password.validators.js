const Joi = require("joi");

module.exports = {
	changePassword: Joi.object({
		oldPassword: Joi.string()
			.trim()
			.min(8)
			.max(16)
			.pattern(
				new RegExp(
					"^(?=(.*[a-z]){2,})(?=(.*[A-Z]){2,})(?=(.*[0-9]){2,})(?=(.*[!@#$%^&*()-__+.]){2,}).{8,16}$"
				)
			)
			.required()
			.messages({
				"string.base": `"oldPassword" field has to be of type string!`,
				"string.empty": `"oldPassword" field can't be empty!`,
				"string.min": `"oldPassword" field can't be less than 8 characters!`,
				"string.max": `"oldPassword" field can't be more than 16 characers!`,
				"any.required": `"oldPassword" field is required!`,
				"string.pattern.base": `"oldPassword" field must include at least(2 upper, 2 lower characters, 2 numbers and 2 special characters)`,
			}),
		newPassword: Joi.string()
			.trim()
			.min(8)
			.max(16)
			.pattern(
				new RegExp(
					"^(?=(.*[a-z]){2,})(?=(.*[A-Z]){2,})(?=(.*[0-9]){2,})(?=(.*[!@#$%^&*()-__+.]){2,}).{8,16}$"
				)
			)
			.required()
			.messages({
				"string.base": `"newPassword" field has to be of type string!`,
				"string.empty": `"newPassword" field can't be empty!`,
				"string.min": `"newPassword" field can't be less than 8 characters!`,
				"string.max": `"newPassword" field can't be more than 16 characers!`,
				"any.required": `"newPassword" field is required!`,
				"string.pattern.base": `"newPassword" field must include at least(2 upper, 2 lower characters, 2 numbers and 2 special characters)`,
			}),
		confirmNewPassword: Joi.string()
			.required()
			.valid(Joi.ref("newPassword"))
			.messages({
				"any.only": `"confirmNewPassword" field doesn't match "password" field`,
			}),
	}),
};
