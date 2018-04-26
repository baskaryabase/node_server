const passport = require("passport");
const VendorAdmin = require("../models/vendorAdmin.js");
const User = require("../models/user.js");
const config = require("../config/session");
const jwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const LocalStrategy = require("passport-local");

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader("authorization"),
  secretOrKey: config.secret
};

const localOption = { usernameField: "email" };

const localLogin = new LocalStrategy(localOption, function(
  email,
  password,
  done
) {
  VendorAdmin.findOne({ email: email }, function(err, user) {
    if (err) {
      return done(err);
    }
    if (!user) {
      return done(null, false);
    }

    user.comparePassword(password, function(err, isMatch) {
      if (err) {
        return done(null);
      }
      if (!isMatch) {
        return done(null, false);
      }

      return done(null, user);
    });
  });
});

const jwtLogin = new jwtStrategy(jwtOptions, function(payload, done) {
  VendorAdmin.findById(payload.sub, function(err, user) {
    if (err) {
      return done(err, false);
    }
    if (new Date() <= payload.iat + 6000) {
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } else {
      return done(null, false);
    }
  });
});

const userLocalOption = { usernameField: "phone" };

const userLocalLogin = new LocalStrategy(userLocalOption, function(
  phone,
  password,
  done
) {
  User.findOne({ phone: phone }, function(err, user) {
    if (err) {
      return done(err);
    }
    if (!user) {
      return done(null, false);
    }

    const isMatch = user.comparePassword(password);
    if (isMatch) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  });
});

passport.use("jwt", jwtLogin);
passport.use("local", localLogin);
passport.use("user-local-login", userLocalLogin);
