const VendorAdmin = require("../models/vendorAdmin.js");
const jwt = require("jwt-simple");
const config = require("../config/config");
const mailer = require("nodemailer");

function tokenForUser(user) {
  const timestamp = new Date().getTime();
  return jwt.encode(
    {
      sub: user.id,
      iat: timestamp
    },
    config.secret
  );
}

exports.signin = function(req, res, next) {
  req.session.user = req.user;
  res.cookie("token", tokenForUser(req.user));
  // res.redirect("/vandor/dashboard");
  res.send({ token: tokenForUser(req.user), user: req.user });
};

exports.signup = function(req, res, next) {
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;
  const phone = req.body.phone;

  if (!email || !password) {
    res.status(422).send({ error: "checkout all field" });
  }
  // check wheather email id exists in db
  VendorAdmin.findOne({ email: email }, function(err, existingUser) {
    if (err) {
      return next(err);
    }

    if (existingUser) {
      return res.status(422).send({ error: "email is in use" });
    }
    // create user
    const user = new VendorAdmin({
      email: email,
      password: password,
      name: name,
      phone: phone,
      profile: { name: name }
    });
    // save user
    user.save(function(err) {
      if (err) {
        return next(err);
      }
      res.json({ token: tokenForUser(user), user: user });
    });
  });
};

exports.isLoggedIn = function(req, res, next) {
  var token = req.headers.authorization || req.cookies.token;
  jwt.verify(token, config.secret, function(err, decoded) {
    if (err) {
      res.redirect("/vendor");
    } else {
      if (new Date() <= decoded.iat + 600000) {
        next();
      } else {
        res.redirect("/vendor");
      }
    }
  });
};

exports.createforgotpasswordlink = function(req, res, next) {
  let email = req.body.email;
  VendorAdmin.findOne({ email: email }, function(err, existingUser) {
    if (err) {
      return next(err);
    }

    if (existingUser) {
      var trans = mailer.createTransport({
        service: "gmail",
        auth: {
          user: "baymax1298@gmail.com",
          pass: "smily2012"
        }
      });

      var link =
        "http://localhost:3000/forgot-password/" + tokenForUser(existingUser);
      let img =
        "https://hdwallsource.com/img/2014/8/colorful-background-pictures-17219-17775-hd-wallpapers.jpg";
      var mailOptions = {
        from: "<baymax1298@yahoo.com>",
        to: email,
        subject: "Password Reset",
        text: "Password Reset",
        html:
          "<br><center><div style=" +
          "background:url(https://hdwallsource.com/img/2014/8/colorful-background-pictures-17219-17775-hd-wallpapers.jpg);padding:15px" +
          "><h1>Hi " +
          existingUser.username +
          "</h1>" +
          "<h3>You've successfully changed your password.</br>" +
          "<br>Here's your new password  " +
          "<a href=" +
          link +
          ">link</a> to reset your password" +
          "</br>" +
          "<br>Thanks for using !</br>" +
          "<br>The  Team</br></h3></div></center>"
      };

      trans.sendMail(mailOptions, function(error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Message sent:", info.messageId, info.response);
          res.send({ success: "mailsentsuccesfully" });
        }
      });
    } else {
      res.send({ error: "username does not exists" });
    }
  });
};
