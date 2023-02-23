require("dotenv").config();

const express = require("express");

const connect_DB = require("./utils/MongoDB.connection.js");

const app = express();

connect_DB(app);
