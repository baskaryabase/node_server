var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//TODO: add only time for slotTime
var BookingSchema = new Schema({
    _user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    _vendor: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
    slotDate: { type: Date, required: true },
    slotTime: { type: Number, required: true },
    otp: { type: Number, required: true },
    bookedOn: {type:Date, required:true},
    status: { type: String, enum: ['booked', 'arrived'], default: 'booked' },
    bookedThrough: { type: String, required: true, enum: ['android', 'ios', 'web'] }
});

module.exports = mongoose.model('Booking', BookingSchema);