function CustomError(code, message) {
	const error = new Error(message);
	Object.setPrototypeOf(error, CustomError.prototype);
	error.code = code;
	throw error;
}

CustomError.prototype = Object.create(Error.prototype, {
	name: { value: "CustomError", enumerable: false },
});

module.exports = CustomError;
