const express = require("express");
const router = express.Router({ mergeParams: true });
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync.js");
const { saveRedirectUrl, isLoggedIn } = require("../middleware.js");
const usersController = require("../controllers/users.js");

router.route("/signup")
    .get(usersController.renderSignup)
    .post(wrapAsync(usersController.signup));

router.route("/login")
    .get(usersController.renderLogin)
    .post(saveRedirectUrl, passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }), usersController.login);


// Logout route
router.get("/logout", isLoggedIn, usersController.logout);

module.exports = router;