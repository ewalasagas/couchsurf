//require("dotenv").config();
var express = require("express");
var app 	= express();
var axios 	= require("axios");
var path	= require("path");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
mongoose.connect('mongodb+srv://elaine09:Bella&Pudg3@cluster-couchsurf.2y3tp.mongodb.net/<dbname>?retryWrites=true&w=majority', {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true
}).then(() => {
	console.log('Connected to DB!');
}).catch(err => {
	console.log('ERROR:', err.message);
});

var flash = require("connect-flash");
var Couch = require("./models/couch");
var methodOverride = require("method-override");
var Comment = require("./models/comment");
var User = require("./models/user");
//var seedDB = require("./seed");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var User = require("./models/user");
var middleware = require('./middleware/index');
/*var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};

//var url = process.env.DATABASEURL || "mongod://localhost//yelp_camp_dyn_price";
*/

//seedDB();
mongoose.set("useFindAndModify", false);
//mongoose.connect("mongodb://localhost/couch_surf", {useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true });
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());


//PASSPORT CONFIGURATION 
app.use(methodOverride('_method'));
app.use(require("express-session")({
	secret: "Bella is the cutest dog!",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Defining app.use for loggedin user check and to display
app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
   next();
});

app.get("/", function(req, res) {
	res.render("landing");
});


//INDEX - get all campgrounds list
app.get("/couches", function(req, res) {
	console.log("we're in INDEX - get all couches list");
	//console.log(req.user);
	//get all campgrounds from DB
	Couch.find({}, function(err, allCouches) {
		if(err) {
			console.log(err);
		} else {
			res.render("couches/index", {couches:allCouches});
		}
	})
});

//CREATE - add new campground to DB
app.post("/couches", middleware.isLoggedIn, function(req, res) {
	//get data from format and add to couches array
	var name = req.body.name;
	var image = req.body.image;
	var descr = req.body.description;
	var price = req.body.price;
	var author = {
		id: req.user._id,
		username: req.user.username
	}
  	var newCouch = {name: name, price: price, image: image, description: descr, author:author}
    // Create a new campground and save to DB
    Couch.create(newCouch, function(err, newlyCreated){
        if(err){
			req.flash("error", "Something went wrong");
            console.log(err);
        } else {
            //redirect back to couches page
            console.log(newlyCreated);
			req.flash("success", "Sucessfully added a new campground");
            res.redirect("/couches");
        }
    });
});

//NEW - show form to create new couch
app.get("/couches/new", middleware.isLoggedIn, function(req, res) {
	res.render("couches/new");
});

//SHOW - shows info about each couches
app.get("/couches/:id", function(req, res){
	console.log("we're in show couches/:id");
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


//=====================================
// EDIT/UPDATE COUCHES ROUTE
//=====================================
// EDIT CAMPGROUND ROUTE
app.get("/couches/:id/edit", middleware.checkCouchOwnership, function(req, res){
	console.log("we're in edit couch route");
    Couch.findById(req.params.id, function(err, foundCouch){
        res.render("couches/edit", {couch: foundCouch});
    });
});

// UPDATE COUCH ROUTE
app.put("/couches/:id", middleware.checkCouchOwnership, function(req, res){
    // find and update the correct couch
    Couch.findByIdAndUpdate(req.params.id, req.body.couch, function(err, updatedCouch){
       if(err){
		   console.log(err);
           //res.redirect("/couches");
       } else {
           //redirect somewhere(show page)
           res.redirect("/couches/" + req.params.id);
       }
    });
});

// DELETE COUCH ROUTE
app.delete("/couches/:id", middleware.checkCouchOwnership, async(req, res) => {
	try {
		let foundCouch = await Couch.findById(req.params.id);
		await foundCouch.remove();
		res.redirect("/couches");
	} catch(error) {
		console.log(error.message);
		//res.redirect("/couches");
	}
});

//=====================================
// COMMENTS ROUTE
//=====================================

//couches new
app.get("/couches/:id/comments/new", middleware.isLoggedIn, function(req, res){
    // find couch by id
    console.log(req.params.id);
    Couch.findById(req.params.id, function(err, couch){
        if(err){
            console.log(err);
        } else {
             res.render("comments/new", {couch: couch});
        }
    })
});

//Comments create
app.post("/couches/:id/comments", middleware.isLoggedIn, function(req, res){
   //lookup couch using ID
   Couch.findById(req.params.id, function(err, couch){
       if(err){
		   req.flash("error", "Something went wrong");
           console.log(err);
           res.redirect("/couches");
       } else {
        Comment.create(req.body.comment, function(err, comment){
           if(err){
               console.log(err);
           } else {
               //add username and id to comment
               comment.author.id = req.user._id;
               comment.author.username = req.user.username;
               //save comment
               comment.save();
               campground.comments.push(comment);
               campground.save();
               console.log(comment);
			   req.flash("success", "Sucessfully added comment");
               res.redirect('/couches/' + campground._id);
           }
        });
       }
   });
});

//Comment edit
app.get("/couches/:id/comments/:comments_id/edit", middleware.checkCommentOwnership, function(req, res) {
	Comment.findById(req.params.comments_id, function(err, foundComment) {
		if(err) {
			res.redirect("back");
		} else {
			res.render("comments/edit", {couch_id: req.params.id, comment: foundComment});
		}
	})
});

//Comment update
app.put("/couches/:id/comments/:comments_id", middleware.checkCommentOwnership, function(req, res) {
	Comment.findByIdAndUpdate(req.params.comments_id, req.body.comment, function(err, updatedComments) {
		if(err) {
			res.redirect("back");
		} else {
			res.redirect("/couches/" + req.params.id);
		}
	});
});

//Comment destroy
app.delete("/couches/:id/comments/:comments_id", function(req, res){
    //findByIdAndRemove
    Comment.findByIdAndRemove(req.params.comments_id, function(err){
       if(err){
           res.redirect("back");
       } else {
           res.redirect("/couches/" + req.params.id);
       }
    });
});

//=====================================
// REGISTER ROUTE
//=====================================

//Show signup form
app.get("/register", function(req, res) {
	res.render("register");
});

//handling user signup
app.post("/register", function(req, res) {
	req.body.username;
	req.body.password;
	User.register(new User({username: req.body.username}), req.body.password, function(err, user) {
		if(err) {
			console.log(err);
			return res.render("register", {error: "Sorry. That username already exists or is invalid. Try again."});
		}
		passport.authenticate("local")(req, res, function() {
			req.flash("success", "Welcome to CouchSurf " + user.username);
			res.redirect("/couches");
		});
	});
});

//=====================================
// LOGIN ROUTE
//=====================================

// SHOW login form
app.get("/login", function(req, res) {
	res.render("login");
});

//middle-ware - from the passport.authenticate onward...
app.post("/login", passport.authenticate("local", {
	successRedirect: "/couches",
	failureRedirect: "/login",
	failureFlash: true
	}), function(req, res) {
});

//logout function
app.get("/logout", function(req, res) {
	req.logout();
	req.flash("success", "Logged you out!");
	res.redirect("/couches");
})

//=====================================
// SERVER ROUTE
//=====================================
const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("CouchSurf Server Has Started!");
});
// app.listen(3000, function() {
// 	console.log("CouchSurf Server started");
// });