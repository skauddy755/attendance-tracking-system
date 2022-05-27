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
const attendance = require("../models/attendance");
const { rmSync } = require("fs");


const router = express.Router();

// HELPER FUNCTIONS:
// =====================================
async function get_sidebar_data(userId) {
    let data = {
        menu_userId: userId,
        menu_username: "--username--",
        menu_role: webKeys.USER_ROLES.STUDENT,
    
        menu_student_full_name: "--full_name--",
        menu_student_email: "--email--",
        menu_student_contact: "--contact--",
        menu_student_orgs: [],
        menu_student_infos: {},

        menu_links: []
    };
    
    stdUser = await User.findById(userId);
    std = await Student.findById(stdUser.detailsId);
    data = {
        menu_userId: userId,
        menu_username: stdUser.username,
        menu_role: webKeys.USER_ROLES.STUDENT,
    
        menu_student_full_name: std.full_name,
        menu_student_email: std.email,
        menu_student_contact: std.contact,
        menu_student_orgs: [],
        menu_student_infos: {},

        menu_links: [
            {
                title: "My Profile",
                link: `${webKeys.WEB_ORIGIN}/student/${userId}/profile`
            },
            {
                title: "Dashboard",
                link: `${webKeys.WEB_ORIGIN}/student/${userId}/dashboard`
            },
            {
                title: "Track Attendance",
                link: `${webKeys.WEB_ORIGIN}/student/${userId}/track_attendance`
            },
        ]
    };

    return data;
}

async function get_admins(stdUserId) {
    const data = [];
    let adminUsers = await User.find({role: webKeys.USER_ROLES.ADMIN});
    for(let adminUser of adminUsers) {
        let admin = await Admin.findById(adminUser.detailsId);
        for(let student of admin.students) {
            if(student == stdUserId) {
                admin.userId = adminUser._id;
                data.push(admin);
                break;
            }
        }
    }
    return data;
}

// =====================================

router.get('/:userId/dashboard', middlewareObj.isLoggedIn, middlewareObj.checkOwnership, (req, res) => {
    
    page = "student/student_dashboard.ejs";
    Student.findById(req.user.detailsId, async (err, item) => {
        if(err) res.redirect('/index/home');
        else {
            data = item;
            console.log(page, data);
            const sidebar = await get_sidebar_data(req.params.userId);
            console.log(sidebar);
            res.render(page, {detailsData: data, userId: req.params.userId, origin: webKeys.WEB_ORIGIN, sidebar});
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
            Student.findById(user.detailsId, async (err, std) => {
                std.username = user.username;
                const sidebar = await get_sidebar_data(req.params.userId);
                res.render('student/student_profile.ejs', {sidebar, studentData: std, userId: req.params.userId, origin: webKeys.WEB_ORIGIN});
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
            Admin.find({}, async (err, admins) => {
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
                const sidebar = await get_sidebar_data(req.params.userId);
                res.render('student/student_view_orgs.ejs', {sidebar, detailsData: data, userId: req.params.userId, origin: webKeys.WEB_ORIGIN});
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
            const sidebar = await get_sidebar_data(req.params.userId);
            res.render('student/give_attendance_select_org.ejs', {sidebar, adminData: data, userId: req.params.userId, origin: webKeys.WEB_ORIGIN});
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
    User.find({}, async (err, users) => {
        const data = [];
        for(user of users) {
            if(user.role === webKeys.USER_ROLES.STUDENT) {
                data.push(user);
            }
        }
        const sidebar = await get_sidebar_data(req.params.userId);
        res.render('student/give_attendance.ejs', {sidebar, stdData: data, userId: req.params.userId, origin: webKeys.WEB_ORIGIN, stdUserId, adminUserId});
    });
});

router.post('/:userId/give_attendance/:adminUserId', middlewareObj.isLoggedIn, middlewareObj.checkOwnership, (req, res) => {
    console.log(req.body.present);
    let att = new Attendance({
        instance: new Date(),
        adminId: req.params.adminUserId, // id of admin (org)
        studentId: req.params.userId, //id of student/student
        infos: {}
    });
    att.save((err) => {
        if(err) res.redirect('/index/home');
        else {
            res.redirect(`/student/${req.params.userId}/dashboard`);
        }
    });
});


// =================================================================================
// REGISTER FACE:
// =================================================================================
router.get('/:userId/register_face', middlewareObj.isLoggedIn, middlewareObj.checkOwnership, (req, res) => {
    User.findById(req.params.userId, async (err, stdUser) => {
        if(err) res.redirect('/index/home');
        else {
            const sidebar = await get_sidebar_data(req.params.userId);
            res.render('student/student_register_face.ejs', {sidebar, stdData: stdUser, userId: req.params.userId, origin: webKeys.WEB_ORIGIN});
        }
    });
});


router.post('/:userId/register_face', middlewareObj.isLoggedIn, middlewareObj.checkOwnership, (req, res) => {
    User.findById(req.params.userId, (err, stdUser) => {
        if(err) res.redirect('/index/home');
        else {
            console.log(req.files);
            var mf = req.files.myNewFile;
            var filename = mf.name;
            mf.mv('./public/assets1/face-api/images/' + req.params.userId + '.jpg', (err) => {
                if(err) {
                    console.log(err);
                    res.redirect(`/student/${req.params.userId}/dashboard`);
                }
                else res.redirect(`/student/${req.params.userId}/dashboard`);
            });
        }
    });
});

// =================================================================================
// TRACK ATTENDANCE:
// =================================================================================
router.get('/:userId/track_attendance', (req, res) => {
    Attendance.find({studentId: req.params.userId}, async (err, attData) => {
        if(err) res.redirect('/index/home');
        else {
            for(let i=0; i<attData.length; i++) {
                const adminUser = await User.findById(attData[i].adminId);
                const admin = await Admin.findById(adminUser.detailsId);
                attData[i].companyName = admin.companyName;
            }
            const sidebar = await get_sidebar_data(req.params.userId);
            const admins = await get_admins(req.params.userId);
            console.log(admins);
            console.log(attData);
            res.render('student/track_attendance.ejs', {sidebar, admins, attData, userId: req.params.userId, origin: webKeys.WEB_ORIGIN});
        }
    });
});

module.exports = router;