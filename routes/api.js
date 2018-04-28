var express = require('express');
var router = express.Router();
var app = express();

var pass_controller = require('../controllers/passController');
var vendor_controller = require('../controllers/vendorController');
var slot_controller = require('../controllers/slotController');
var user_controller = require('../controllers/userController');
var booking_controller = require('../controllers/bookingController');
var coupon_controller = require('../controllers/couponController');



router.use(user_controller.authenticate); //route middleware to authenticate and check token
router.get('/passes', pass_controller.pass_list);
router.post('/passes', pass_controller.pass_create_post);
router.put('/passes/:postId', pass_controller.update);
router.delete('/passes/:postId', pass_controller.delete);

router.post('/coupons', coupon_controller.create_coupon );
router.get('/coupons', coupon_controller.verify_code);

router.post('/vendors', vendor_controller.create_vendor);
router.get('/vendors/all', vendor_controller.get_all);
router.get('/vendors', vendor_controller.get_nearby);
router.get('/vendors/:vendorId', vendor_controller.get);
router.delete('/vendors/:vendorId', vendor_controller.delete_vendor);

router.get('/slots', slot_controller.slot_list);

router.post('/bookings', booking_controller.make_booking);

router.get('/user/bookings', user_controller.get_bookings);

router.get('/user/points', user_controller.get_points);

router.get('/user/coupons', user_controller.get_coupons);

module.exports = router;