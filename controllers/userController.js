var User = require("../models/user");
var Booking = require("../models/booking");
var Coupon = require("../models/coupon");
var slotController = require("./slotController");
var utils = require("../utils/utils");
var User = require("../models/user.js");
var mailer = require("nodemailer");

var shortid = require("shortid");
var config = require("../config/session");
var validator = require("validator");
var jwt = require("jsonwebtoken");
var async = require("async");

exports.signup = async function(req, res, next) {
  try {
    // check phone number already in use
    var user = await User.findOne({ phone: req.body.phone });
    if (user != null) {
      throw new Error("Phone number already in use");
    }
    // check referral code validity
    var frnd_user = null;
    if (req.body.referral_code != null) {
      frnd_user = await User.findOne({ referral_code: req.body.referral_code });
      if (frnd_user == null) {
        throw new Error("Invalid Referral code");
      }
    }
    // create user
    var referral_code = shortid.generate();
    user = await User.create({
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      gender: req.body.gender,
      password: req.body.password,
      joined_through: req.body.joined_through,
      referral_code: referral_code
    });
    var token = jwt.sign({ _id: user._id }, config.secret, {
      expiresIn: "60d"
    });
    // add points to frnd_user
    if (frnd_user != null) {
      var expiry_date = new Date();
      expiry_date.setDate(expiry_date.getDate() + 30);
      expiry_date = utils.toLocalTime(expiry_date);
      var expiry_date_self = expiry_date;
      if (frnd_user.expiry_date != null) expiry_date = frnd_user.expiry_date;

      frnd_user = await User.findByIdAndUpdate(frnd_user._id, {
        $inc: { points: 2 },
        expiry_date: expiry_date
      });
    }
    return res.json({ auth: true, token: token });
  } catch (error) {
    console.log(error);
    return res.status(422).json({ error: error.message });
  }
};

exports.login = function(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;

  if (!/^\d{10}$/.test(username)) {
    res.status(400).json({ error: "Invalid user name" });
  }

  User.findOne({ phone: username }, function(err, user) {
    if (err) return res.status(500).json({ error: "Internal server error" });
    if (!user) return res.status(404).send("No user found.");

    console.log(user);
    var isMatch = user.comparePassword(password);
    if (isMatch) {
      var token = jwt.sign({ _id: user._id }, config.secret, {
        expiresIn: "60d"
      });
      return res.json({ auth: true, token: token });
    } else {
      return res.status(401).json({ error: "Incorrect Password" });
    }
  });
};

exports.authenticate = function(req, res, next) {
  const token = req.body.token || req.query.token || req.headers["token"];
  if (!token) {
    return res.status(422).json({
      message: "Fatal error, No token available"
    });
  }
  jwt.verify(token, config.secret, function(err, decoded) {
    if (err) {
      return res
        .status(422)
        .json({ message: "Authentication token expired. Please login again" });
    }
    req.decoded = decoded;
    req.body.userId = decoded._id;
    next();
  });
};

exports.get_bookings = function(req, res, next) {
  var userId = req.body.userId;
  const localDate = utils.toLocalTime(new Date());
  console.log(localDate);
  try {
    Booking.find(
      { _user: userId, slotDate: { $gt: localDate } },
      "-bookedThrough -_user"
    )
      .sort({ slotDate: -1 })
      .populate("_vendor")
      .lean()
      .exec(function(err, documents) {
        if (err)
          return res.status(500).json({ error: "Internal server error" });
        //TODO: modify this output
        bookings = [];
        documents.forEach(document => {
          var booking = {};
          booking._id = document._id;
          var dateTime = new String(document.slotDate);
          var pieces = dateTime.split(" ");
          const date =
            pieces[0] + " " + pieces[1] + " " + pieces[2] + " " + pieces[3];
          booking.date = date;
          booking.time = slotController.numToTime(document.slotTime);
          booking.otp = document.otp;
          booking.vendor = document._vendor.name;
          booking.place = document._vendor.area;
          bookings.push(booking);
        });
        return res.json(bookings);
      });
  } catch (ex) {
    console.log(ex);
  }
};

exports.get_points = function(req, res, next) {
  const userId = req.body.userId;
  console.log("GET user points");
  User.findById(userId, "_id name points expiry_date referral_code", function(
    err,
    doc
  ) {
    if (err) return res.status(500).json({ error: "Internal server error" });
    console.log(doc);
    var result = {};
    result.name = doc.name;
    result.points = doc.points;
    if (doc.expiry_date != null)
      result.expiry_date = doc.expiry_date.toString();
    result.userId = doc._id;
    result.referral_code = doc.referral_code;

    return res.json(result);
  });
};

exports.get_coupons = async function(req, res, next) {
  const userId = req.body.userId;
  console.log("GET user coupons");
  try {
    var coupons = await Coupon.find(
      { _user: userId },
      "coupon expiryDate -_id"
    );
    var result = coupons || {};
    return res.json(result);
  } catch (ex) {
    return res.status(422).json({ error: ex.message });
  }
};

////////////////////////////////////////
// userController for web api endpoints
////////////////////////////////////////

function tokenForUser(user) {
  const timestamp = new Date().getTime();
  var token = jwt.sign({ _id: user._id }, config.secret, {
    expiresIn: "60d"
  });
  return token;
}

exports.websignin = function(req, res, next) {
  req.session.user = req.user;
  res.cookie("token", tokenForUser(req.user));
  // res.redirect("/vandor/dashboard");
  res.send({ token: tokenForUser(req.user), user: req.user });
};

exports.websignup = function(req, res, next) {
  const referral_code = shortid.generate();

  var frnd_user = null;
  if (req.body.referral_code != null) {
    frnd_user = User.findOne({ referral_code: req.body.referral_code });
    if (frnd_user == null) {
      throw new Error("Invalid Referral code");
    }
  }
  if (frnd_user != null) {
    var expiry_date = new Date();
    expiry_date.setDate(expiry_date.getDate() + 30);
    expiry_date = utils.toLocalTime(expiry_date);
    if (frnd_user.expiry_date != null) expiry_date = frnd_user.expiry_date;

    frnd_user = User.findByIdAndUpdate(frnd_user._id, {
      $inc: { points: 2 },
      expiry_date: expiry_date
    });
  }

  if (!req.body.phone || !req.body.password) {
    res.status(422).send({ error: "checkout all field" });
  }
  // check wheather email id exists in db
  User.findOne({ phone: req.body.phone }, function(err, existingUser) {
    if (err) {
      return next(err);
    }

    if (existingUser) {
      return res.status(422).send({ error: "email is in use" });
    }
    // create user
    const user = new User({
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      gender: req.body.gender,
      password: req.body.password,
      joined_through: req.body.joined_through,
      referral_code: referral_code
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
