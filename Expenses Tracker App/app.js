//Requires
var express = require("express");
var passport = require("passport");
var localStrategy = require("passport-local");
var bodyParser = require("body-parser");
var user = require("./models/user");
var mongoose = require("mongoose") ;

mongoose.connect("mongodb://lkannan:CSProjectFall2018!@ds145019.mlab.com:45019/cs252");

var passportLocalMongoose = require("passport-local-mongoose");
var app = express();


//Uses
app.use(require("express-session")(
{
    secret: "i love dogs!",
    resave: false,
    saveUninitialized: false

}));

app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({extended: true}));


passport.use(new localStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use(function(req,res,next)
{
    CURR = req.user;
    res.locals.currentUser = req.user;
    next();
});



//Get Requests


//Get Home Page
app.get("/", function(req,res)
{

  res.render("home.ejs", {currentUser: req.user});

});

var path;


//Get Sign up Page
app.get("/register", function(req, res)
{
	res.render("register.ejs");
});


//Get Login Page
app.get("/login", function(req, res)
{
	res.render("login.ejs");
});


//Get Add Expenses Page
app.get("/addExpenses", function(req,res)
{

  res.render("addExpenses.ejs");

});


//Logout
app.get("/logout", function(req,res)
{

    req.logout();
    res.redirect("/");

});


//Get Show Expenses page
app.get("/showExpenses", isLoggedIn, function(req,res)
{

  user.find({username : req.user.username},function(err  , person)
  {
     if(err)
     {
        console.log("Error") ;
     }
     else
     {
                 
       var expenses = person[0].expenses;

       res.render("showExpenses.ejs" , {expenses : expenses}) ;
            
    }

  });

});





//Post Requests


//Login Post Route
app.post("/login", passport.authenticate("local",{
    //successRedirect: "/saved",
    failureRedirect: "/login"

} ),function(req,res){

  res.redirect("/addExpenses");  
 
});


//Register Post Route
app.post("/register", function(req,res){

    user.register(new user({username: req.body.username}), req.body.password, function(err, user)
    {
        if(err)
        {
            console.log(err);
            return res.render('register.ejs');
        }

        passport.authenticate("local")(req, res, function(){
           res.redirect("/addExpenses");
        });

    }); 


});



//Add expenses Post Route
var expenseName;
var type;
var date;
var cost;
var expenseString;

app.post("/addExpenses", isLoggedIn, function(req,res)
{

	expenseName = req.body.name;
	type = req.body.type;
	date = req.body.date;
	cost = req.body.amount;


	console.log(req.body);

	expenseString = expenseName + type + date + cost;

	console.log(expenseString);



        user.update({username : req.user.username}  , {$push: {expenses  : expenseName}}, function(err,numberAffected , rawResponse){
            if(err)
            {
                console.error("error!") ; 
            }

        }) ;


        res.redirect("/showExpenses");
       

}) ;





//Checking if user is logged in
function isLoggedIn(req,res,next){

    if(req.isAuthenticated()){
        return next(); 
    }

    res.render("login.ejs");

}




//Starting the server
var port = process.env.PORT || 1234;
app.listen(port, function(){
    console.log("App has started!");
});