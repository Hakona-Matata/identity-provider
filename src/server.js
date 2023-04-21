require("dotenv").config();

const express = require("express");

// This package is for not using try-catch block in every handler/controller!
require("express-async-errors");

const connect_DB = require("./utils/db.connection.js");

const applyAllMiddlewares = require("./middlewares/applyAllMiddlewares.js");
//==================================================

const app = express();

connect_DB(app);

applyAllMiddlewares(app);

module.exports = app;
