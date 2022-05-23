const express           = require("express"),
      passport          = require('passport'),
      localStrategy     = require('passport-local'),
      path              = require('path'),
      mongoose          = require("mongoose"),
      session           = require('express-session'),
      methodOverride    = require('method-override'),
      flash             = require('connect-flash'),
      upload            = require("express-fileupload"),
      fs                = require("fs"),
      dotenv            = require("dotenv").config();

const req = require("express/lib/request");
const webKeys           = require("./config/webKeys.js"),
      seedDB            = require("./config/seedDB.js");

const User              = require("./models/user"),
      Admin             = require("./models/admin"),
      Company           = require("./models/company"),
      Student           = require("./models/student"),
      Attendance        = require("./models/attendance"),
      Inf               = require("./models/inf"),
      Jnf               = require("./models/jnf");

const app = new express();

// ================================================================
// MONGO-DB SETUP:
// ================================================================
const mongo_uri = process.env.MONGO_URI_LOCAL;
console.log(mongo_uri);
console.log(process.env.NODE_ENV);
mongoose.connect(mongo_uri, {useUnifiedTopology:true, useNewUrlParser:true})
    .then(() => {});

// ================================================================
// APP UTILITIES SETUP:
// ================================================================
app.use(upload());
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(methodOverride("_method"));
app.use(flash());

// ================================================================
// PASSPORT and SESSION Configuration:
// ================================================================
app.use(require("express-session")({
	secret: "The statemnt that you are trying to read rn, is a waste of time",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.success = req.flash("success");
	res.locals.error = req.flash("error");
	next();
});


// ================================================================
// Serve static assets and use routes:
// ================================================================
app.use("/static/", express.static(path.join(__dirname, 'public', 'assets1')));
app.use("/docs/", express.static(path.join(__dirname, 'public', 'docs')));
// Use routes:
//-----------------------------------------------------------------
app.use("/test", require('./routes/test'));
app.use("/index", require('./routes/index'));
app.use("/company", require('./routes/company'));
app.use("/admin", require('./routes/admin'));
app.use("/student", require('./routes/student'));

app.get('/', (req, res) => {
    if(req.user) {
        console.log(req.user);
        res.redirect('index/dashboard/'+req.user._id);
    }
    else {
        res.redirect('index/home');
    }
});


// ================================================================
// START EXPRESS APP:
// ================================================================
const port = process.env.PORT || 5000;
app.listen(port, function(){
    console.log(`Server is running at Port: ${port}`);
});