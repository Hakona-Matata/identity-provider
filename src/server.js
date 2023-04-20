require("dotenv").config();

const express = require("express");

// This package is for not using try-catch block in every handler/controller!
require("express-async-errors");

const connect_DB = require("./utils/db.connection.js");

const registerMiddlewares = require("./middlewares/registerMiddlewares.js");
//==================================================
const app = express();

registerMiddlewares(app);

// (1) After intializing our server istance, let's connect to MongoDB!
process.env.NODE_ENV === "test" ? "" : connect_DB(app);

module.exports = app;
