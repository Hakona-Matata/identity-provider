const express = require("express");

const TOTP_controllers = require("./../controllers/TOTP.controllers");
const protect = require("./../../middlewares/protect");
const isVerified = require("./../../middlewares/isVerified");


const router = express.Router();

module.exports = router;
