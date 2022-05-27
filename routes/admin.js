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
async function get_sidebar_data(userId) {
    let data = {
        menu_userId: userId,
        menu_username: "--username--",
        menu_role: webKeys.USER_ROLES.ADMIN,
    
        menu_admin_companyName: "--companyName--",
        menu_admin_email: "--email--",
        menu_admin_contact: "--contact--",
        menu_admin_students: [],

        menu_links: []
    };
    
    adminUser = await User.findById(userId);
    admin = await Admin.findById(adminUser.detailsId);
    data = {
        menu_userId: userId,
        menu_username: adminUser.username,
        menu_role: webKeys.USER_ROLES.ADMIN,
    
        menu_admin_companyName: admin.companyName,
        menu_admin_email: admin.email,
        menu_admin_contact: admin.contact,
        menu_admin_students: admin.students,

        menu_links: [
            {
                title: "My Profile",
                link: `${webKeys.WEB_ORIGIN}/admin/${userId}/profile`
            },
            {
                title: "Dashboard",
                link: `${webKeys.WEB_ORIGIN}/admin/${userId}/dashboard`
            },
            {
                title: "View Students",
                link: `${webKeys.WEB_ORIGIN}/admin/${userId}/view_students`
            },
            {
                title: "Track Attendance",
                link: `${webKeys.WEB_ORIGIN}/admin/${userId}/track_attendance`
            },
        ]
    };

    return data;
}
// =====================================

router.get('/:userId/dashboard', middlewareObj.isLoggedIn, middlewareObj.checkOwnership, (req, res) => {
    
    page = "admin/admin_dashboard.ejs";
    Admin.findById(req.user.detailsId, async (err, item) => {
        if(err) res.redirect('/index/home');
        else {
            data = item;
            console.log(page, data);
            const sidebar = await get_sidebar_data(req.params.userId);
            res.render(page, {sidebar, detailsData: data, userId: req.params.userId, origin: webKeys.WEB_ORIGIN});
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
            Admin.findById(user.detailsId, async (err, admin) => {
                admin.username = user.username;
                const sidebar = await get_sidebar_data(req.params.userId);
                res.render('admin/admin_profile.ejs', {sidebar, adminData: admin, userId: req.params.userId, origin: webKeys.WEB_ORIGIN});
            });
        }
    });
})

// =================================================================================
// VIEW STUDENTS:
// =================================================================================
router.get('/:userId/view_students', middlewareObj.isLoggedIn, middlewareObj.checkOwnership, (req, res) => {
    User.findById(req.params.userId, (err, au) => {
        if(err) res.redirect('/index/home');
        else {
            Admin.findById(au.detailsId, (err, admin) => {
                if(err) res.redirect('/index/home');
                else {
                    const ht = new Map();
                    for(s of admin.students) ht.set(s, true);

                    User.find({}, async (err, sus) => {
                        if(err) res.redirect('/index/home');
                        else {
                            const data = [];
                            for(su of sus) {
                                console.log(String(su._id));
                                if(!ht.get(String(su._id))) continue;
                                const std = await Student.findById(su.detailsId);
                                std.userId = su._id;
                                std.username = su.username;
                                data.push(std);
                            }
                            console.log(data);
                            const sidebar = await get_sidebar_data(req.params.userId);
                            res.render('admin/admin_view_students', {sidebar, detailsData: data, userId: req.params.userId, origin: webKeys.WEB_ORIGIN})
                        }
                    });
                }
            });
        }
    });
    
});

router.get('/:userId/view_student/:stdUserId', middlewareObj.isLoggedIn, middlewareObj.checkOwnership, (req, res) => {
    User.findById(req.params.stdUserId, async (err, user) => {
        if(err) res.redirect('/index/home');
        else {
            Student.findById(user.detailsId, async (err, std) => {
                std.username = user.username;
                const sidebar = await get_sidebar_data(req.params.userId);
                res.render('admin/admin_student_profile.ejs', {sidebar, studentData: std, userId: req.params.userId, origin: webKeys.WEB_ORIGIN});
            });
        }
    });
});


// =================================================================================
// ADD STUDENTS:
// =================================================================================
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
            const sidebar = await get_sidebar_data(req.params.userId);
            res.render('admin/admin_add_students.ejs', {sidebar, detailsData: data, userId: req.params.userId, origin: webKeys.WEB_ORIGIN});
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
                        else res.redirect(`/admin/${req.params.userId}/view_students`);
                    });
                }
            });
        }
    });
});


// =================================================================================
// TRACK ATTENDANCE:
// =================================================================================
router.get('/:userId/track_attendance', (req, res) => {
    Attendance.find({adminId: req.params.userId}, async (err, attData) => {
        if(err) res.redirect('/index/home');
        else {
            for(let i=0; i<attData.length; i++) {
                const stdUser = await User.findById(attData[i].studentId);
                const std = await Student.findById(stdUser.detailsId);
                attData[i].full_name = std.full_name;
            }
            const sidebar = await get_sidebar_data(req.params.userId);
            console.log(attData);
            res.render('admin/track_attendance.ejs', {sidebar, attData, userId: req.params.userId, origin: webKeys.WEB_ORIGIN});
        }
    });
});

module.exports = router;