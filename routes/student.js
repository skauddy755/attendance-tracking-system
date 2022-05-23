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

// =================================================================================
// ATTENDANCE:
// =================================================================================
router.get('/:userId/give_attendance_select_org/', middlewareObj.isLoggedIn, middlewareObj.checkOwnership, (req, res) => {
    User.find({}, async (err, adminUsers) => {
        if(err) res.redirect('/index/home');
        else {
            let data = [];
            for(adminUser of adminUsers) {
                if(!(adminUser.role === webKeys.USER_ROLES.ADMIN)) continue;
                let admin = await Admin.findById(adminUser.detailsId);
                for(uid of admin.students) {
                    if(uid == req.params.userId) {
                        admin.userId = adminUser._id;
                        admin.username = adminUser.username;
                        data.push(admin);
                        break;
                    }
                }
            }
            console.log(data);
            res.render('student/give_attendance_select_org.ejs', {adminData: data, userId: req.params.userId, origin: webKeys.WEB_ORIGIN});
        }
    });
});

router.post('/:userId/give_attendance_select_org/', middlewareObj.isLoggedIn, middlewareObj.checkOwnership, (req, res) => {
    let stdUserId = req.params.userId;
    let adminUserId = req.body.adminUserId;
    console.log(stdUserId, adminUserId);
    res.redirect(`/student/${stdUserId}/give_attendance/${adminUserId}`);
});

router.get('/:userId/give_attendance/:adminUserId', middlewareObj.isLoggedIn, middlewareObj.checkOwnership, (req, res) => {
    let stdUserId = req.params.userId;
    let adminUserId = req.params.adminUserId;
    User.find({}, (err, users) => {
        const data = [];
        for(user of users) {
            if(user.role === webKeys.USER_ROLES.STUDENT) {
                data.push(user);
            }
        }
        res.render('student/give_attendance.ejs', {stdData: data, userId: req.params.userId, origin: webKeys.WEB_ORIGIN, stdUserId, adminUserId});
    });
});

router.post('/:userId/give_attendance/:adminUserId', middlewareObj.isLoggedIn, middlewareObj.checkOwnership, (req, res) => {
    console.log(req.body.present);
});


module.exports = router;