var express = require("express");
var router = express.Router();
var user_controller = require("../controllers/userController");
var jwt = require("jsonwebtoken");
var config = require("../config/session");
var passport = require("passport");

/* GET users listing. */
router.get("/", function(req, res, next) {
  res.send("respond with a resource");
});

router.post("/signup", user_controller.websignup);
router.post(
  "/signin",
  passport.authenticate("user-local-login"),
  user_controller.websignin
);

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
module.exports = router;
