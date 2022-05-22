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

router.get('/', (req, res) => {
    res.redirect('/index/home');
})

router.get('/home', (req, res) => {
    res.render('index/homepage.ejs', {origin: webKeys.WEB_ORIGIN});
})

router.get('/dashboard/:userId', middlewareObj.isLoggedIn, middlewareObj.checkOwnership, (req, res) => {
    data = {};
    page = "";
    if(req.user.role === webKeys.USER_ROLES.ADMIN) {
        res.redirect('/admin/' + req.params.userId + '/dashboard');
    }
    else if(req.user.role === webKeys.USER_ROLES.COMPANY) {
        res.redirect('/company/' + req.params.userId + '/dashboard');
    }
    else if(req.user.role === webKeys.USER_ROLES.STUDENT) {
        res.redirect('/student/' + req.params.userId + '/dashboard');
    }  
})

// ===================================================================
// REGISTRATION ROUTES:
// ===================================================================

router.get('/register', (req, res) => {
    res.render('index/register_gen.ejs');
})

router.post('/register', (req, res) => {
    let userType = req.body.userType;
    if(userType === "Admin") res.redirect('/index/register_admin');
    else if(userType === "Student") res.redirect('/index/register_student');
    else res.redirect('/register');
})

// Admin Registration:
// -------------------------------------------------------------------
router.get('/register_admin', (req, res) => {
    res.render('index/register_admin.ejs', {origin: webKeys.WEB_ORIGIN});
})

router.post('/register_admin', (req, res) => {
    console.log(req.body);
    
    let nd = new Admin({
        email: req.body.email,
        contact: req.body.contact,
        companyName: req.body.companyName,
    });
    nd.save((err) => {
        if(err) {
            console.log(err);
            res.redirect('/index/register_admin');
        }
        else {
            let nu = new User({
                username: req.body.username,
                isVerified: false,
                role: webKeys.USER_ROLES.ADMIN,
                detailsId: nd._id
            });
            User.register(nu, req.body.password, function(err, item){
                if(err)
                {
                    console.log(err);
                    req.flash("error", err.message);
                    return res.redirect("/index/register_admin");
                }
                passport.authenticate("local")(req, res, function(){
                    console.log(item);
                    req.flash("success", "Successfully signed you in...!!");
                    res.redirect("/index/dashboard/" + item._id);
                });
            });
        }
    });

})

// Company Registration:
// -------------------------------------------------------------------
router.get('/register_company', (req, res) => {
    res.render('register_company.ejs');
})

router.post('/register_company', (req, res) => {
    console.log(req.body);
    
    let nd = new Company({
        email: req.body.email,
        contact: req.body.contact,
        companyName: req.body.companyName,
        infs: [],
        jnfs: []
    });
    nd.save((err) => {
        if(err) {
            console.log(err);
            res.redirect('/index/register_company');
        }
        else {
            let nu = new User({
                username: req.body.username,
                isVerified: false,
                role: webKeys.USER_ROLES.COMPANY,
                detailsId: nd._id
            });
            User.register(nu, req.body.password, function(err, item){
                if(err)
                {
                    console.log(err);
                    req.flash("error", err.message);
                    return res.redirect("/index/register_company");
                }
                passport.authenticate("local")(req, res, function(){
                    console.log(item);
                    req.flash("success", "Successfully signed you in...!!");
                    res.redirect("/index/dashboard/" + item._id);
                });
            });
        }
    });

})

// Student Registration:
// -------------------------------------------------------------------
router.get('/register_student', (req, res) => {
    res.render('index/register_student.ejs', {origin: webKeys.WEB_ORIGIN});
})

router.post('/register_student', (req, res) => {
    console.log(req.body);
    
    let nd = new Student({
        full_name: req.body.full_name,
        email: req.body.email,
        contact: req.body.contact,
    });
    nd.save((err) => {
        if(err) {
            console.log(err);
            res.redirect('/index/register_student');
        }
        else {
            let nu = new User({
                username: req.body.username,
                isVerified: false,
                role: webKeys.USER_ROLES.STUDENT,
                detailsId: nd._id
            });
            User.register(nu, req.body.password, function(err, item){
                if(err)
                {
                    console.log(err);
                    req.flash("error", err.message);
                    return res.redirect("/index/register_student");
                }
                passport.authenticate("local")(req, res, function(){
                    console.log(item);
                    req.flash("success", "Successfully signed you in...!!");
                    res.redirect("/index/dashboard/" + item._id);
                });
            });
        }
    });

})

// ===================================================================
// LOGIN and LOGOUT ROUTES:
// ===================================================================

router.get('/login', (req, res) => {
    res.render('index/login.ejs');
})

router.post(
    '/login',
    passport.authenticate('local', {failureRedirect: '/index/login'}),
    (req, res) => {
        console.log("Logged in succcessfully...");
        console.log(req.user);
        res.redirect('/index/dashboard/' + req.user._id);
    }
)

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/index/login');
})





// ======================================================================================================
// DUMMY ROUTES:
// ======================================================================================================

router.get('/reg', (req, res) => {
    res.render("register.ejs");
});

router.get('/inf', (req, res) => {
    res.render("inf.ejs");
});

router.get('/ip', (req, res) => {
    res.render("indexpage.ejs");
});

router.post('/', (req, res) => {
    console.log(req.body);
    res.json({
           data: req.body
       })
});

module.exports = router;