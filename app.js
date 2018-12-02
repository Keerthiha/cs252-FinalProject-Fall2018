var express = require("express");x
var app = express();


app.get("/", function(req,res){

  res.render("home.ejs", {currentUser: req.user});

});


var port = process.env.PORT || 1234;
app.listen(port, function(){
    console.log("App has started!");
});