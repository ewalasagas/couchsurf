var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/couch")
var Comment = require("../models/comment")

//=====================================
// COMMENTS ROUTE
//=====================================

router.get("/new", isLoggedIn, function(req, res) {
	//find couch by id
	Couch.findById(req.params.id, function(err, couch) {
		if(err) {
			console.log(err);
		} else {
			res.render("comments/new", {couch: couch});
		}
	})
});

router.post("/", isLoggedIn, function(req, res) {
	//lookup couch using ID
	//create a new comment
	//connect new comment to couch
	//redirect couch show page
	Couch.findById(req.params.id, function(err, couch) {
		if(err) {
			console.log(err);
			res.redirect("/couches");
		} else {
			console.log(req.body.comment);
			Comment.create(req.body.comment, function(err, comment) {
				if(err) {
					console.log(err);
				} else {
					couch.comments.push(comment);
					couch.save();
					res.redirect("/couches/" + couch._id);
				}
			});
		}
	});
});

//This is als the middleware to check if logged in function
function isLoggedIn(req, res, next) {
		if(req.isAuthenticated()) {
			return next();
		}
	res.redirect("/login");
}

module.exports = router;