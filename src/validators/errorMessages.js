const errorMessages = {
	string: {
		base: "{#label} must be a string",
		min: "{#label} length must be at least {#limit}",
		max: "{#label} length must be less than or equal to {#limit}",
		email: "{#label} must be a valid email",
		uri: "{#label} must be a valid URI",
		uriCustomScheme: "{#label} must be a valid URI with a scheme matching the {#regex} pattern",
		regex: {
			base: "{#label} must match the pattern {#regex}",
			name: "{#label} must match the pattern {#regexName}",
		},
	},
	number: {
		base: "{#label} must be a number",
		min: "{#label} must be greater than or equal to {#limit}",
		max: "{#label} must be less than or equal to {#limit}",
		greater: "{#label} must be greater than {#limit}",
		less: "{#label} must be less than {#limit}",
		integer: "{#label} must be an integer",
		positive: "{#label} must be a positive number",
		negative: "{#label} must be a negative number",
		precision: "{#label} must have no more than {#limit} decimal places",
		multiple: "{#label} must be a multiple of {#multiple}",
	},
	array: {
		base: "{#label} must be an array",
		min: "{#label} must have at least {#limit} items",
		max: "{#label} must have less than or equal to {#limit} items",
	},
	any: {
		custom: "{#label} failed custom validation because {#error.message}",
	},
};

// const errorMessages = {
// 	string: {
// 		base: "must be a string",
// 		min: "length must be at least {#limit} characters long",
// 		max: "length must be less than or equal to {#limit} characters long",
// 		length: "length must be {#limit} characters long",
// 		regex: "failed to match the required pattern",
// 	},
// 	number: {
// 		base: "must be a number",
// 		min: "must be greater than or equal to {#limit}",
// 		max: "must be less than or equal to {#limit}",
// 		less: "must be less than {#limit}",
// 		greater: "must be greater than {#limit}",
// 		float: "must be a float or double",
// 		integer: "must be an integer",
// 	},
// 	array: {
// 		base: "must be an array",
// 		min: "must have at least {#limit} items",
// 		max: "must have at most {#limit} items",
// 		length: "must have {#limit} items",
// 		unique: "contains duplicate values",
// 	},
// 	object: {
// 		base: "must be an object",
// 		keys: "must contain the following keys: {#label}",
// 		min: "must have at least {#limit} keys",
// 		max: "must have at most {#limit} keys",
// 	},
// 	any: {
// 		required: "is required",
// 		empty: "is not allowed to be empty",
// 		unknown: "is not allowed",
// 		invalid: "contains an invalid value",
// 	},
// 	alternatives: {
// 		base: "does not match any of the allowed alternatives",
// 	},
// 	date: {
// 		base: "must be a valid date",
// 		min: "must be on or after {#limit}",
// 		max: "must be on or before {#limit}",
// 	},
// 	boolean: {
// 		base: "must be a boolean",
// 	},
// 	binary: {
// 		base: "must be a binary string",
// 		min: "length must be at least {#limit} characters long",
// 		max: "length must be less than or equal to {#limit} characters long",
// 		length: "length must be {#limit} characters long",
// 	},
// 	function: {
// 		base: "must be a function",
// 	},
// };

// {
// 	any: {
// 		unknown: "is not allowed",
// 		invalid: "contains an invalid value",
// 		empty: "is not allowed to be empty",
// 		required: "is required",
// 		allowOnly: "must be one of {{valids}}",
// 	},
// 	alternatives: {
// 		base: "does not match any of the allowed types",
// 		child: null,
// 	},
// 	array: {
// 		base: "must be an array",
// 		includes: "at position {{pos}} does not match any of the allowed types",
// 		includesSingle: 'single value of "{{!label}}" does not match the required type',
// 		includesOne: "does not contain {{pos}} required value(s)",
// 		includesOneSingle: "does not match the required type",
// 		length: "must contain {{limit}} items",
// 		max: "must contain less than or equal to {{limit}} items",
// 		min: "must contain at least {{limit}} items",
// 		ordered: "{{pos}} must be one of {{type}}",
// 		sparse: "must not be a sparse array",
// 	},
// 	boolean: {
// 		base: "must be a boolean",
// 	},
// 	binary: {
// 		base: "must be a buffer or a string",
// 		min: "must be at least {{limit}} bytes",
// 		max: "must be less than or equal to {{limit}} bytes",
// 		length: "must be {{limit}} bytes",
// 	},
// 	date: {
// 		base: "must be a number of milliseconds or valid date string",
// 		format: 'must be in the format "{{!format}}"',
// 		strict: "must be a valid date",
// 		min: 'must be greater than or equal to "{{limit}}"',
// 		max: 'must be less than or equal to "{{limit}}"',
// 		isoDate: "must be a valid ISO 8601 date",
// 	},
// 	function: {
// 		base: "must be a function",
// 		arity: "must have an arity of {{n}}",
// 		minArity: "must have an arity greater or equal to {{n}}",
// 		maxArity: "must have an arity lesser or equal to {{n}}",
// 	},
// 	lazy: {
// 		base: "!!schema error: lazy schema must be set",
// 		schema: "!!schema error: lazy schema function must return a schema",
// 	},
// 	number: {
// 		base: "must be a number",
// 		min: "must be greater than or equal to {{limit}}",
// 		max: "must be less than or equal to {{limit}}",
// 		less: "must be less than {{limit}}",
// 		greater: "must be greater than {{limit}}",
// 		integer: "must be an integer",
// 		precision: "must have no more than {{limit}} decimal places",
// 		multiple: "must be a multiple of {{multiple}}",
// 		positive: "must be a positive number",
// 		negative: "must be a negative number",
// 		port: "must be a valid port number",
// 	},
// 	object: {
// 		base: "must be an object",
// 		child: "{{!label}} {{reason}}",
// 		max: "must have less than or equal to {{limit}} keys",
// 		min: "must have at least {{limit}} keys",
// 		pattern: 'must match pattern "{{!pattern}}"',
// 		unknown: "is not allowed",
// 	},
// 	string: {
// 		base: "must be a string",
// 		min: "length must be at least {{limit}} characters long",
// 		max: "length must be less than or equal to {{limit}} ",
// 	},
// };
