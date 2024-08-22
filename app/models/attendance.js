var mongoose 				= require("mongoose"),
	passportLocalMongoose 	= require("passport-local-mongoose");

const USER_ROLES = require('../config/webKeys').USER_ROLES

var attendanceSchema = new mongoose.Schema({

    instance: Date,
    adminId: String, // id of admin (org)
    studentId: String, //id of student/student
    infos: mongoose.Schema.Types.Mixed,
});

module.exports = mongoose.model("Attendance", attendanceSchema);