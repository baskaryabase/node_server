var Booking = require('../models/booking');
var User = require('../models/user');
var Slot = require('../models/slot');
var scheduler = require('../scheduler/scheduler')

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

exports.make_booking = async function (req, res, next) {
    const slotId = req.body.slotId;
    const userId = req.body.userId;
    const sourceType = req.body.sourceType; // android, ios or web
    try {
        var user = await User.findById(userId);
        var slot = await Slot.findById(slotId);
        if (user == null || slot == null) {
            throw new Error('Resource not found');
        }
        // check if enough points
        if (user.points < slot.points_cost) {
            throw new Error('Not enough points to book this slot');
        }
        // check slot availability
        if (slot.seats_available == 0) {
            throw new Error('Requested slot is not available');
        }
        /*
         *Book now
         *1)deduct points from user
         *2)update slot availability
         *3)create booking
         */
        var expiry_date = user.expiry_date;
        if (user.points - slot.points_cost == 0) {
            expiry_date = null;
        }
        var cost = slot.points_cost;
        user = await User.findByIdAndUpdate(userId, { $inc: { points: -cost }, expiry_date: expiry_date });
        slot = await Slot.findByIdAndUpdate(slotId, { $inc: { seats_available: -1 } });
        var slot_time = slot.start_time;
        var vendorId = slot._vendor;
        var otp = Math.floor(10000 + Math.random() * 90000);
        var date = scheduler.toLocalTime(new Date()); // 
        var userRef = mongoose.Types.ObjectId(userId);
        var slotDate = slot.date;

        var booking = await Booking.create({
            _user: userRef,
            _vendor: vendorId,
            slotDate: slotDate,
            slotTime: slot_time,
            otp: otp,
            bookedThrough: sourceType,
            bookedOn: date,
            status: 'booked'
        });
        return res.json({ result: 'Booking Successful' });

    } catch (ex) {
        console.log(ex);
        return res.status(422).json({ error: ex.message });
    }
};
