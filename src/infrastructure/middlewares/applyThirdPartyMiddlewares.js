const express = require("express");
const hpp = require("hpp");
const helmet = require("helmet");
const xss = require("xss-clean");
const compression = require("compression");
const cors = require("cors");

/**
 * Applies third parties middlewares to the Express app.
 *
 * @module middlewares/applyAppMiddlewares
 * @param {import('express').Express} app - The Express app instance.
 */
module.exports = (app) => {
	/**
	 * Enables Cross-Origin Resource Sharing (CORS).
	 */
	app.use(cors());

	/**
	 * Parses incoming JSON payloads and sets the payload size limit to 2MB.
	 */
	app.use(express.json({ limit: "2mb" }));

	/**
	 * Prevents HTTP Parameter Pollution attacks.
	 */
	app.use(hpp());

	/**
	 * Sets various HTTP headers to enhance security.
	 */
	app.use(helmet());

	/**
	 * Sanitizes user input to prevent Cross-Site Scripting (XSS) attacks.
	 */
	app.use(xss());

	/**
	 * Compresses response bodies for improved performance.
	 */
	app.use(
		compression({
			/**
			 * Custom filter function to exclude certain requests from compression.
			 *
			 * @param {import('express').Request} req - The Express request object.
			 * @param {import('express').Response} res - The Express response object.
			 * @returns {boolean} - Whether to apply compression or not.
			 */
			filter: (req, res) => {
				if (req.headers["x-no-compression"]) {
					return false;
				}

				return compression.filter(req, res);
			},
		})
	);

	/**
	 * Disables the "X-Powered-By" header to prevent information leakage.
	 */
	app.disable("x-powered-by");
};
