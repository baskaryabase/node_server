var express = require("express");
var router = express.Router();
var user_controller = require("../controllers/userController");
var vendorController = require("../controllers/vendorController");
var authentication = require("../controllers/vendorauthentication");
var jwt = require("jsonwebtoken");
var config = require("../config/session");
var passport = require("passport");
var multer = require("multer");

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function(req, file, cb) {
    cb(null, new Date().toJSON().slice(0, 10) + file.originalname);
  }
});

const upload = multer({ storage: storage });

// /* GET home page. */
// router.get("/", function(req, res) {
//   res.redirect("/api");
// });

router.post("/user/signup", user_controller.signup);
router.post("/user/login", user_controller.login);

/* GET signin page. */
router.post(
  "/vendor/profile/upload-pic",
  upload.any(),
  vendorController.vendorGymPicUpdate
);

router.get("/vendor", function(req, res) {
  res.render("signin");
});
// get signup page
router.get("/vendor/signup", function(req, res) {
  res.render("signup");
});

/* GET Home page. */
router.get("/", function(req, res) {
  res.render("home", { user: req.session.user });
});

/* GET How it works page. */
router.get("/aboutus", function(req, res) {
  res.render("aboutus", { user: req.session.user });
});

/* GET How it works page. */
router.get("/userprofile", function(req, res) {
  res.render("userprofile", { user: req.session.user });
});

/* GET How it works page. */
router.get("/howitworks", function(req, res) {
  res.render("howitworks", { user: req.session.user });
});

/* GET dashboard page. */
router.get("/vendor/dashboard", isLoggedIn, function(req, res) {
  res.render("index", { user: req.session.user });
});

router.get("/vendor/profile", isLoggedIn, vendorController.vendorProfilePage);

router.post("/vendor/profile/update", vendorController.vendorProfileUpdate);

router.post("/user/signup", user_controller.signup);
router.post("/user/login", user_controller.login);

router.get("/vendor/currentbookings", function(req, res) {
  res.render("currentbooking");
});

router.get("/userlogin", function(req, res) {
  res.render("userlogin");
});

router.get("/exploregyms", function(req, res) {
  res.render("exploregyms");
});

router.get("/vendor/futurebookings", function(req, res) {
  res.render("futurebooking");
});

router.get("/vendor/consumedbookings", function(req, res) {
  res.render("consumedbooking");
});

router.get("/vendor/otpverification", function(req, res) {
  res.render("otpverification", { user: req.session.user });
});

function isLoggedIn(req, res, next) {
  var token = req.headers.token || req.cookies.token || req.query.token;
  jwt.verify(token, config.secret, function(err, decoded) {
    if (err) {
      res.redirect("/vendor");
    } else {
      next();
    }
  });
}

// router.get("/loggedin/:token", isLoggedIn, function(req, res) {
//   res.render("loggedin");
// });

module.exports = router;
