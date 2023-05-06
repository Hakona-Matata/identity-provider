const testEnv = require("./test.env");
const devEnv = require("./dev.env");
const stageEnv = require("./stage.env");
const prodEnv = require("./prod.env");

const currentEnv = process.env.NODE_ENV || "development";

const environments = {
	testing: testEnv,
	development: devEnv,
	staging: stageEnv,
	production: prodEnv,
};

module.exports = environments[currentEnv];
