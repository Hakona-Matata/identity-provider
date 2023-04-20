require("dotenv").config();

const express = require("express");

// This package is for not using try-catch block in every handler/controller!
require("express-async-errors");

const connect_DB = require("./utils/db.connection.js");

const registerMiddlewares = require("./middlewares/registerMiddlewares.js");
//==================================================

const app = express();

registerMiddlewares(app);

connect_DB(app);

// (1) After intializing our server istance, let's connect to MongoDB!

module.exports = app;
