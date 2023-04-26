module.exports = {
	env: {
		browser: true,
		commonjs: true,
		es2021: true,
		node: true,
		jest: true,
	},

	plugins: ["jest"],

	extends: "eslint:recommended",
	overrides: [],
	globals: {
		process: false,
		// next: false,
	},
	parserOptions: {
		ecmaVersion: "latest",
	},
	rules: {
		// "no-undef": "off",
	},
};
