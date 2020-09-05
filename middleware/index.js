var Campground = require("../models/couch");
var Comment = require("../models/comment");

// all the middleare goes here
var middlewareObj = {};
//COUCHES
middlewareObj.checkCouchOwnership = function(req, res, next) {
	console.log("I'M IN checkCouchOwnership");
 if(req.isAuthenticated()){
        Couch.findById(req.params.id, function(err, foundcouch){
			console.log("Author TOOT: " + foundcouch.author.id);
			console.log("\nUser ID: " + req.user._id);
           if(err){
			   req.flash("error", "Couch not found");
               res.redirect("back");
           }  else {
               // does user own the couch?
			console.log("foundCouch.author.id.equals");
            if(foundCouch.author.id.equals(req.user._id)) {
                next();
            } else {
				req.flash("error", "You don't have permission to do that");
                res.redirect("back");
            }
           }
        });
    } else {
		req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
}


//COMMENTS
middlewareObj.checkCommentOwnership = function(req, res, next) {
	console.log("I'M IN checkCommentOwnership");
	console.log(req.params.comments_id);
 if(req.isAuthenticated()){
        Comment.findById(req.params.comments_id, function(err, foundComment){
           if(err){
			   console.log("i'm in comment: " + err);
               res.redirect("back");
           }  else {
               // does user own the comment?
            if(foundComment.author.id.equals(req.user._id)) {
                next();
            } else {
				req.flash("error", "You don't have permission to do that");
                res.redirect("back");
            }
           }
        });
    } else {
		req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
}

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
	req.flash("error", "You need to be logged in to do that");
    res.redirect("/login");
}

module.exports = middlewareObj;