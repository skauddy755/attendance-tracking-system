const express           = require("express"),
      passport          = require('passport'),
      path              = require('path'),
      mongoose          = require("mongoose"),
      session           = require('express-session'),
      localStrategy     = require('passport-local'),
      methodOverride    = require('method-override'),
      flash             = require('connect-flash'),
      dotenv            = require("dotenv").config();

const webKeys           = require("../config/webKeys.js"),
      seedDB            = require("../config/seedDB.js");

const User              = require("../models/user"),
      Admin             = require("../models/admin"),
      Company           = require("../models/company"),
      Student           = require("../models/student"),
      Attendance        = require("../models/attendance"),
      Inf               = require("../models/inf"),
      Jnf               = require("../models/jnf");

const middlewareObj     = require('../middleware/index');


const router = express.Router();

// HELPER FUNCTIONS:
// =====================================
// =====================================

router.get('/:userId/dashboard', middlewareObj.isLoggedIn, middlewareObj.checkOwnership, (req, res) => {
    
    page = "student/student_dashboard.ejs";
    Student.findById(req.user.detailsId, (err, item) => {
        if(err) res.redirect('/index/home');
        else {
            data = item;
            console.log(page, data);
            res.render(page, {detailsData: data, userId: req.params.userId, origin: webKeys.WEB_ORIGIN});
        }
    });
})



// =================================================================================
// VIEW PROFILE:
// =================================================================================
router.get('/:userId/profile', middlewareObj.isLoggedIn, middlewareObj.checkOwnership, (req, res) => {
    User.findById(req.params.userId, async (err, user) => {
        if(err) res.redirect('/index/home');
        else {
            Student.findById(user.detailsId, (err, std) => {
                std.username = user.username,
                res.render('student/student_profile.ejs', {studentData: std, userId: req.params.userId, origin: webKeys.WEB_ORIGIN});
            });
        }
    });
})


// =================================================================================
// VIEW ORGS:
// =================================================================================
router.get('/:userId/view_orgs', middlewareObj.isLoggedIn, middlewareObj.checkOwnership, (req, res) => {
    User.findById(req.params.userId, async (err, user) => {
        if(err) res.redirect('/index/home');
        else {
            Admin.find({}, (err, admins) => {
                const data = [];
                for(a of admins) {
                    if(!a.students) continue;
                    for(s of a.students) {
                        if(s == user._id) {
                            data.push(a);
                            break;
                        }
                    }
                }
                console.log(data);
                res.render('student/student_view_orgs.ejs', {detailsData: data, userId: req.params.userId, origin: webKeys.WEB_ORIGIN});
            });
        }
    });
})

module.exports = router;