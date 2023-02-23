require("dotenv").config();

const express = require("express");

const connect_DB = require("./utils/db.connection.js");

// const configure_middlewares = require("./app.js");
const access_middlewares = require("./middlewares/access.middleware");
const thirdParty_middlewares = require("./middlewares/thirdParth.middlewares");

//==================================================
const app = express();

// (1) After intializing our server istance, let's connect to MongoDB!
connect_DB(app);

// (2) Let's apply our third party middlewares!
thirdParty_middlewares({ app, express });

// (3) Let's apply our own application middlwars! 
access_middlewares(app);
