var mongoose 				= require("mongoose"),
	passportLocalMongoose 	= require("passport-local-mongoose");

const USER_ROLES = require('../config/webKeys').USER_ROLES

var adminSchema = new mongoose.Schema({
	// userId: String, // id of user schema
    email: String,
    contact: String,
    companyName: String,
    students: [String] // userIds (not studentIds) of students who are part of the oranisation which the admin represents
});

module.exports = mongoose.model("Admin", adminSchema);