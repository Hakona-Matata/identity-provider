const express = require("express");
const hpp = require("hpp");
const helmet = require("helmet");
const xss = require("xss-clean");
const compression = require("compression");
const cors = require("cors");

module.exports = (app) => {
	app.use(cors());
	app.use(express.json({ limit: "2mb" }));
	app.use(hpp());
	app.use(helmet());
	app.use(xss());
	app.use(
		compression({
			filter: (req, res) => {
				if (req.headers["x-no-compression"]) {
					return false;
				}

				return compression.filter(req, res);
			},
		})
	);
	app.disable("x-powered-by");
};
