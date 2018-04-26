var Slot = require('../models/slot');
var Vendor = require('../models/vendor');
var Moment = require('moment-timezone');
var utils = require('../utils/utils');

// width in minutes only
function addHelper(time, width) {
    var timeHH = Math.floor(time / 100);
    var timeMM = time % 100;

    var timeMin = timeHH * 60 + timeMM;
    var finalMin = timeMin + width;
    return [Math.floor(finalMin / 60)] * 100 + finalMin % 60;
}

module.exports = {
    toLocalTime: function toLocalTime(utcDatetime) {
        var d = new Moment(utcDatetime);
        var n = d.tz('Asia/Kolkata').format();
        return n;
    },
    // slot_width 60 means 60 minutes
    createNewSlots: function createNewSlots(date, slot_width) {
        var currDate = new Date(date);
        var dayOfWeek = currDate.getDay();
        console.log('day of week ' + dayOfWeek);

        Vendor.find({ is_active: true }, '_id capacity start_time end_time working_hours points_cost', function (err, vendors) {
            vendors.forEach(vendor => {
                curr_timings = vendor['working_hours'][dayOfWeek]
                start_time = curr_timings['from'];
                end_time = curr_timings['to'];
                if (start_time == null)
                    return;
                if (end_time == null)
                    return;

                var slot_time = start_time;
                var slot_end_time = addHelper(slot_time, slot_width);
                var slots = [];
                while (slot_end_time < end_time && slot_end_time > slot_time) {
                    var slot = {
                        _vendor: null,
                        date: null,
                        start_time: null,
                        end_time: null,
                        points_cost: null,
                        seats_available: null
                    };
                    var slotDate = new Date(date);
                    slot._vendor = vendor._id;
                    slotDate.setHours(Math.round(slot_time/100));
                    slotDate.setMinutes(slot_time%100);
                    slot.date = slotDate;
                    slot.start_time = slot_time;
                    slot.end_time = slot_end_time;
                    slot.points_cost = vendor.points_cost;
                    slot.seats_available = vendor.capacity;
                    slots.push(slot);
                    slot_time = slot_end_time;
                    slot_end_time = addHelper(slot_time, slot_width);                    
                }
                try {
                    Slot.insertMany(slots, function (err, result) {
                        if (err) console.log('error');
                    });
                } catch (e) {
                    console.log(e);
                }
            });
        });
    },

    cleanupSlots: function cleanupSlots(date) {
        // delete yesterday slots
        Slot.deleteMany({ date: { "$lt": date } }, function (err, result) {
            if (err) console.log('error while cleaning up old slots');
            console.log('deleted old slots');
        });
    }
};
