var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SlotSchema = new Schema({
    _vendor: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
    date: { type: Date, required: true },
    start_time: { type: Number, maxlength: 4, required: true },
    end_time: { type: Number, maxlength: 4, required: true },
    points_cost: { type: Number, required: true },
    seats_available: { type: Number, default: 0 },
});

module.exports = mongoose.model('Slot', SlotSchema);