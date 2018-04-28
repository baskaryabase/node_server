var Coupon = require('../models/coupon');
var utils = require('../utils/utils');

exports.create_coupon = function (req, res, next) {
    console.log('create coupon');
    const targetUserId = req.body.targetId;
    const code = req.body.code;
    const discount = parseInt(req.body.discount); //percentage
    const expiry = parseInt(req.body.expiry);
    var expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiry);
    var row = {};
    var coupon = {};
    coupon.code = code;
    coupon.discount = discount;
    coupon.expiry = expiry;
    row._user = targetUserId;
    row.coupon = coupon;
    row.expiryDate = utils.toLocalTime(expiryDate);
    console.log(row);
    try {
        Coupon.create(row, function (err, coupon) {
            if (err) res.status(500).json({ error: 'Internal server error' });
            return res.json({ status: 'Success. Coupon applied for the user' });
        });
    }
    catch (ex) {
        console.log(ex);
    }
}

exports.verify_code = function (req, res, next) {
    const userId = req.body.userId;
    const couponCode = req.query.code;
    console.log(couponCode);
    Coupon.findOne({ _user: userId, 'coupon.code': couponCode }, "coupon -_id", function (err, coupon) {
        if (err) res.status(500).json({ error: 'Internal server error' });
        if (coupon == null) {
            res.json({ error: 'Coupon code Invalid' });
        }
        res.json(coupon);
    });
}