require("dotenv").config();

const express = require("express");

const connect_DB = require("./utils/db.connection.js");

// const configure_middlewares = require("./app.js");
const app_middlewares = require("./middlewares/app/app.middleware");
const thirdParty_middlewares = require("./middlewares/app/thirdParth.middlewares");

//==================================================
const app = express();

// (1) After intializing our server istance, let's connect to MongoDB!
process.env.NODE_ENV === "test" ? "" : connect_DB(app);

// (2) Let's apply our third party middlewares!
thirdParty_middlewares({ app, express });

// (3) Let's apply our own application middlwars!
app_middlewares(app);

module.exports = app;
