module.exports = async function validate(validator, args) {
	return await validator.validateAsync(args, { abortEarly: false });
};
