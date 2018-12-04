var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({

	username: String,
	password: String,
	expenseName: [String], 
	type: [String], 
	date: [String], 
	cost: [String]

});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);


