const express = require("express");

const access_controllers = require("./../controllers/access.controllers");

//=============================================================================
const router = express.Router();

router.route("/sign-up").post(access_controllers.signUp_POST_controller);

module.exports = router;
