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


	console.log("in show");

  user.find({username : req.user.username},function(err  , using)
  {
     if(err)
     {
        console.log("Error") ;
     }
     else
     {
        
        console.log(using[0]);

       var expenseName = using[0].expenseName;
       var type = using[0].type;
	   var date = using[0].date;
	   var cost = using[0].cost;

	   console.log(expenseName);
	   console.log(type);
	   console.log(date);
	   console.log(cost);


	//expenses = {"expenseName":expenseName , "type":type , "date":date , "cost":cost};

       res.render("showExpenses.ejs" , {expenseName: expenseName, type:type, date:date, cost:cost}) ;
            
    }

  });

});


//Get About page
app.get("/about", function(req, res)
{
	res.render("about.ejs");
});


//Get page with pie chart by category
app.get("/categoryChart", function(req,res)
{

	user.find({username : req.user.username},function(err  , using)
	{
        if(err)
        {
         console.log("error") ;
         console.log(err);
        }
        else
        {
            var expenseName = using[0].expenseName;
       		var type = using[0].type;
	   		var date = using[0].date;
	   		var cost = using[0].cost;

	   		console.log(date);

	   		var restaurant = [0,0,0,0,0,0,0,0,0,0,0,0];
	   		housing = [0,0,0,0,0,0,0,0,0,0,0,0];
	   		supermarkets = [0,0,0,0,0,0,0,0,0,0,0,0];
	   		general = [0,0,0,0,0,0,0,0,0,0,0,0];
	   		misc = [0,0,0,0,0,0,0,0,0,0,0,0];

	   		for (var i = 0; i<date.length ; i++) 
	   		{
	   			var string = date[i];
	   			var parts = string.split("-");

	   			var month = parts[1];
	   			month = month-1;

	   			//console.log(month);

	   			if(type[i] == "restaurant")
	   			{
	   				restaurant[month] = Number(restaurant[month]) + Number(cost[i]);
	   			}
 				else if(type[i] == "housing")
	  			{
	   				housing[month] = Number(housing[month]) + Number(cost[i]);
	   			}
	   			else if(type[i] == "supermarkets")
	   			{
	   				supermarkets[month] = Number(supermarkets[month]) + Number(cost[i]);
	   			}
	   			else if(type[i] == "general")
	   			{
	   				general[month] = Number(general[month]) + Number(cost[i]);
	   			}
	   			else
	   			{
	   				misc[month] = Number(misc[month]) + Number(cost[i]);
	   			}

	   			
	   		}   		

          res.render("categoryChart.ejs" , {restaurant: restaurant, housing:housing, supermarkets:supermarkets, general:general, misc:misc});
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
var expenses;

app.post("/addExpenses", isLoggedIn, function(req,res)
{

	expenseName = req.body.expenseName;
	type = req.body.type;
	date = req.body.date;
	cost = req.body.cost;


        user.update({username : req.user.username}  , {$push: {expenseName:expenseName, type:type, date:date, cost:cost}}, function(err,numberAffected , rawResponse){
            if(err)
            {
                console.error("error!") ;
                console.error(err) ;

            }

        }) ;



	console.log("going to redirect");
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
var port = process.env.PORT || 7788;
app.listen(port, function(){
    console.log("App has started!");
});