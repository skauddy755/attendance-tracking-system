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
    
    page = "admin/admin_dashboard.ejs";
    Admin.findById(req.user.detailsId, (err, item) => {
        if(err) res.redirect('/index/home');
        else {
            data = item;
            console.log(page, data);
            res.render(page, {detailsData: data, userId: req.params.userId, origin: webKeys.WEB_ORIGIN});
        }
    });
})

router.get('/:userId/add_students', middlewareObj.isLoggedIn, middlewareObj.checkOwnership, (req, res) => {
    User.find({}, async (err, users) => {
        if(err) res.redirect('/index/home');
        else {
            data = [];
            for(const u of users) {
                if(u.role === webKeys.USER_ROLES.STUDENT) {
                    const s = await Student.findById(u.detailsId);
                    s.userId = u._id,
                    s.username = u.username,
                    data.push(s);
                }
            }
            console.log(data);
            res.render('admin/admin_add_students.ejs', {detailsData: data, userId: req.params.userId, origin: webKeys.WEB_ORIGIN});
        }
    });
})

router.post('/:userId/add_students', middlewareObj.isLoggedIn, middlewareObj.checkOwnership, (req, res) => {
    selected = JSON.parse(req.body.selectedList);
    console.log(selected);
    User.findById(req.params.userId, (err, user) => {
        if(err) res.redirect('/index/home');
        else {
            Admin.findById(user.detailsId, (err, admin) => {
                if(err) res.redirect('/index/home');
                else {
                    if(!admin.students) admin.students = [];
                    for(s of selected) admin.students.push(s);

                    admin.save((err, item) => {
                        if(err) res.redirect('/index/home');
                        else res.redirect('/add_students');
                    });
                }
            });
        }
    });
});

module.exports = router;