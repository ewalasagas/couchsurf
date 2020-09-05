var express = require("express");
var router = express.Router();
var Couch = require("../models/couch");

//INDEX - get all couches list
router.get("/", function(req, res) {
	//get all couches from DB
	Couch.find({}, function(err, allCouches) {
		if(err) {
			console.log(err);
		} else {
			res.render("couches/index", {couches:allCouches});
		}
	})
});

//CREATE - add new couch to DB
router.post("/", function(req, res) {
	//get data from format and add to couches array
	var name = req.body.name;
	var image = req.body.image;
	var descr = req.body.description;
	var newCouch = {name: name, image: image, description: descr};
	//Create a new couch and save to database
	Couch.create(newCouch, function(err, newlyCreated) {
		if(err) {
			console.log(err);
		} else {
			//redirect back to couches page
			res.redirect("/couches");		
		}
	})	
	//couches.push(newCouch);
});

//NEW - show form to create new couch
router.get("/new", function(req, res) {
	res.render("couches/new");
});

//SHOW - shows infor about each couches
router.get("/:id", function(req, res){
	//find the couch with provided ID
	Couch.findById(req.params.id).populate("comments").exec(function(err, foundCouch) {
		if(err) {
			console.log(err);
		} else {
			console.log(foundCouch);
			//render show template with that couch
			res.render("couches/show", {couch: foundCouch});
		}
	});
});

//EDIT COUCH ROUTE
router.get("/:id/edit", function(req, res) {
	res.send("EDIT COUCH ROUTE");
});

//UPDATE COUCH ROUTE



module.exports = router;