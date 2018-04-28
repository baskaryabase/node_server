var session = require("express-session");
var vendorauthroutes = require("./routes/vendorauthrouter");
var api = require("./routes/api");
var users = require("./routes/users");
var index = require("./routes/index");
var express = require("express");
var mongoose = require("mongoose");
var path = require("path");
var favicon = require("serve-favicon");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var Fawn = require("fawn");
var cron = require("cron");
var scheduler = require("./scheduler/scheduler");
var passport = require("passport");
var flash = require("connect-flash");
var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

// setup mongo db
// var mongoDB = require("./config/database");
// mongoose.connect("mongodb://localhost/gym" || mongoDB.url);
var mongoDB = require("./config/database");
mongoose.connect(mongoDB.url);
Fawn.init(mongoose);
mongoose.Promise = global.Promise;

var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

//

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept,"
  );
  next();
});

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(
  session({ secret: "mySecret", resave: false, saveUninitialized: false })
);
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, false);
});
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// payment gateway endpoints
require("./paytm/routes/response")(app);
require("./paytm/routes/txn")(app);
// app.set("views", path.join("paytm", "views"));

//USE FLASH
app.use(flash());

app.use(function(req, res, next) {
  res.locals.currentUser = req.session.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

//Authentication routes
vendorauthroutes(app);
app.use("/", index);
app.use("/users", users);
app.use("/api", api);

// Setup Forest environment variables and do not version them
FOREST_ENV_SECRET =
  "c2f03d5ec0ded84c8d6e04984c1dc1e6e2c8857e51e5a9b4376fee5a516aec9f";
FOREST_AUTH_SECRET = "hBOeIp6e3poeHiy9DD1AdjfAvje4a2Ah";

// Setup the Forest Liana middleware in your app.js file
app.use(
  require("forest-express-mongoose").init({
    modelsDir: __dirname + "/models", // Your models directory.
    envSecret: FOREST_ENV_SECRET,
    authSecret: FOREST_AUTH_SECRET,
    mongoose: require("mongoose") // The mongoose database connection.
  })
);

// setup cron jobs for slot filling
var cronJob = cron.CronJob;
var job = new cronJob(
  "0 2 0 * * *",
  function() {
    var today = scheduler.toLocalTime(new Date());
    console.log("today " + today);
    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow = scheduler.toLocalTime(tomorrow);
    console.log("tommorow " + tomorrow);
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday = scheduler.toLocalTime(yesterday);
    console.log("yesterday " + yesterday);

    // create slots for tomorrow
    scheduler.createNewSlots(tomorrow, 60);
    console.log("inserted new slots");
    // delete slots before today
    scheduler.cleanupSlots(today);
    console.log("deleted old slots");
  },
  false,
  true,
  "Asia/Kolkata"
);
job.start();

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
