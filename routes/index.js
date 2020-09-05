var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

router.get("/", function(req, res) {
	res.render("landing");
});

//============ AUTH ROUTES ===============

//Show signup form
router.get("/register", function(req, res) {
	res.render("register");
});

//handling user signup
router.post("/register", function(req, res) {
	req.body.username;
	req.body.password;
	User.register(new User({username: req.body.username}), req.body.password, function(err, user) {
		if(err) {
			console.log(err);
			return res.render("register");
		}
		passport.authenticate("local", {
			successRedirect: "/couches",
			failureRedirect: "/register",
			failureFlash: true,
		})(req, res, function() {
			res.redirect("/couches");
		});
	});
});

// SHOW login form
router.get("/login", function(req, res) {
	res.render("login");
});

//middle-ware - from the passport.authenticate onward...
router.post("/login", passport.authenticate("local", {
	successRedirect: "/couches",
	failureRedirect: "/login",
	failureFlash: true,
	}), function(req, res) {
});

//logout function
router.get("/logout", function(req, res) {
	req.logout();
	res.redirect("/couches");
});

module.exports = router;