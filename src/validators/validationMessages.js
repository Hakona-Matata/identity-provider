module.exports = {
	"string.base": `Invalid type, expected a string for {#label}!`,
	"string.empty": `{#label} field is required!`,
	"string.min": `{#label} field should have a minimum length of {#limit}!`,
	"string.max": `{#label} field should have a maximum length of {#limit}!`,
	"string.length": `{#label} field should have a length of {#limit}!`,
	"string.email": `Invalid email address for {#label}!`,
	"string.uri": `Invalid URI for {#label}!`,
	"string.uriCustomScheme": `Invalid URI scheme for {#label}, expected {#scheme}!`,
	"string.domain": `Invalid domain name for {#label}!`,
	"string.alphanum": `{#label} field should only contain alpha-numeric characters!`,
	"string.token": `{#label} field should only contain alpha-numeric characters and underscore!`,
	"string.regex.base": `{#label} field with value {#value} fails to match the required pattern!`,
	"string.regex.name": `{#label} field with value {#value} does not match the required format for a name!`,
	"string.regex.address": `{#label} field with value {#value} does not match the required format for an address!`,
	"string.regex.username": `{#label} field with value {#value} does not match the required format for a username!`,
	"string.regex.password": `{#label} field with value {#value} does not match the required format for a password!`,
	"string.regex.uuid": `{#label} field with value {#value} does not match the required format for a UUID!`,
	"string.isoDate": `{#label} field with value {#value} is not a valid ISO date!`,
	"string.hex": `{#label} field with value {#value} is not a valid hexadecimal number!`,
	"string.hostname": `{#label} field with value {#value} is not a valid hostname!`,
	"string.lowercase": `{#label} field should only contain lowercase characters!`,
	"string.uppercase": `{#label} field should only contain uppercase characters!`,
	"string.trim": `{#label} field should not have leading or trailing whitespace!`,
	"string.normalize": `{#label} field should be Unicode normalized in the {#form} form!`,
	"string.creditCard": `{#label} field with value {#value} is not a valid credit card number!`,
	"string.guid": `{#label} field with value {#value} is not a valid GUID!`,
	"string.dataUri": `{#label} field with value {#value} is not a valid data URI!`,
	"string.base64": `{#label} field with value {#value} is not a valid base64 string!`,
	"string.uriRelativeOnly": `{#label} field with value {#value} is not a valid relative URI!`,
	"string.uriCustomOnly": `{#label} field with value {#value} is not a valid URI with a custom scheme of {#scheme}!`,
	"string.alternative": `{#label} field with value {#value} is not a valid alternative!`,
	"number.base": `Invalid type, expected a number for {#label}!`,
	"number.empty": `{#label} field is required!`,
	"number.min": `{#label} field should be	greater than or equal to {#limit}!`,
	"number.max": `{#label} field should be less than or equal to {#limit}!`,
	"number.less": `{#label} field should be less than {#limit}!`,
	"number.greater": `{#label} field should be greater than {#limit}!`,
	"number.precision": `{#label} field should have no more than {#limit} decimal places!`,
	"number.integer": `{#label} field should be an integer!`,
	"number.negative": `{#label} field should be a negative number!`,
	"number.positive": `{#label} field should be a positive number!`,
	"number.multiple": `{#label} field should be a multiple of {#limit}!`,
	"number.port": `{#label} field should be a valid TCP port number!`,
	"number.infinity": `{#label} cannot be infinity!`,
	"number.unsafe": `{#label} must be a safe number!`,
	"any.custom": `Invalid value for "{#label}"!`,
	"any.default": `{#label} failed default value validation!`,
	"any.required": `{#label} field is required!`,
	"any.invalid": `Invalid value for "{#label}"!`,
	"any.only": `{#label} field must match {#valids}!`,
	"any.unknown": `{#label} field is not allowed!`,
};
