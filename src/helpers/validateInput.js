const validateInput = async function validate(validator, args) {
	return validator.validateAsync(args, { abortEarly: false });
};

module.exports = validateInput;
