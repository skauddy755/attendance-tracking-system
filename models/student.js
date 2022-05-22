var mongoose 				= require("mongoose"),
	passportLocalMongoose 	= require("passport-local-mongoose");

const USER_ROLES = require('../config/webKeys').USER_ROLES

var studentSchema = new mongoose.Schema({
	// userId: String, // id of user schema
    full_name: String,
    email: String,
    contact: String,
    orgs: [String], // array of Admin Ids
    infos: mongoose.Schema.Types.Mixed,
});

module.exports = mongoose.model("Student", studentSchema);