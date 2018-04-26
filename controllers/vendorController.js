var Vendor = require('../models/vendor');
var constants = require('../config/constants');
var VendorAdmin = require("../models/vendorAdmin");

var async = require("async");

exports.get_all = function (req, res, next) {
    Vendor.find({ is_active: true },
        'name area city location logo points_cost',
        function (err, vendors) {
            if (err) return next(err);
            vendors.forEach(vendor => {
                vendor.logo = vendor.logo_url;
            });
            return res.json(vendors);
        }
    );
};
// show gyms within 4km radius
exports.get_nearby = function (req, res, next) {
    var point = {
        type: "Point",
        coordinates: [parseFloat(req.query.long), parseFloat(req.query.lat)]
    };
    console.log(point);

    Vendor.db.db.command({
        geoNear: "vendors",
        near: point,
        spherical: true,
        distanceMultiplier: 0.001,
        query: { is_active: true },
        maxDistance: 10000  // 10 km
    },
        function (err, result) {
            if (err) res.status(500).json({ error: 'Internal server error' });
            /* remove certain fields*/
            result['results'].forEach(function (item) {
                var vendor = item['obj'];
                delete vendor['is_active'];
                delete vendor['capacity'];
                delete vendor['contacts'];
                if (!vendor['logo']) {
                    // if no logo then use getfyt logo
                    vendor['logo'] = "http://getfyt.co.in/assets/images/logo.png";
                } else {
                    vendor['logo'] = constants['IMG_BASE_URL'] + "venlogo/" + vendor['logo'];
                }
                vendor['images'].forEach(image => {
                    image['url'] = constants['IMG_BASE_URL'] + "vendor/" + image['url'];
                });
            });
            console.log(result);

            return res.json(result);
        });
}

exports.get = function (req, res, next) {
    Vendor.findById(req.params.vendorId, "-contacts -capacity -is_active", function (err, vendor) {
        if (err) res.status(500).json({ error: 'Internal server error' });
        vendor.images = vendor.image_urls;
        vendor.logo = vendor.logo_url;
        return res.json(vendor);
    });
};

exports.create_vendor = function (req, res, next) {
    console.log('create Vendor: ', req.body);
    Vendor.create(req.body, function (err, vendor) {
        if (err) res.status(500).json({ error: 'Internal server error' });
        return res.json(vendor);
    });
};

exports.delete_vendor = function (req, res, next) {
    Vendor.deleteOne({ _id: req.params.vendorId }, function (req, res, err) {
        if (err) res.status(500).json({ error: 'Internal server error' });
        return res.json({ 'result': 'deleted successfully' });
    });
}
exports.vendorProfileUpdate = function(req, res, next) {
  query = req.body.vendorId;
  update = req.body;
  VendorAdmin.findByIdAndUpdate(
    query,
    { $set: { profile: update } },
    { upsert: true, new: true },
    function(err, updated) {
      if (err) {
        // res.send({ msg: "error updating profile try again later" });
        console.log(err);
      }
      console.log(updated);
      res.send("/vendor/profile");
    }
  );
};

exports.vendorGymPicUpdate = function(req, res) {
  var vendorId = req.session.user._id;
  var proId = req.session.user.profile._id;
  req.session.user.profile.images.push({ url: req.files[0].filename });
  VendorAdmin.findOneAndUpdate(
    { _id: vendorId },
    {
      $push: {
        "profile.images": {
          url: req.files[0].filename
        }
      }
    },
    { new: true },
    function(err, updated) {
      if (err) {
        console.log(err);
        res.send({ msg: "error updating profile try again later" });
      }
      console.log(updated);
      res.redirect("/vendor/profile");
    }
  );
  // res.redirect("/vendor/profile");
};

exports.vendorProfilePage = function(req, res) {
  res.render("profile", { user: req.session.user });
};
