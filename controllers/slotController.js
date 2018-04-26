var Slot = require('../models/slot');

var async = require('async');
var _ = require('underscore');

function numToTime(num) {
    // param - num, eg: 600 or 2100 
    // returns time, eg: 6:00 AM or 9:00 PM
    var hours = Math.floor(num / 100);
    var minutes = num % 100;
    if (minutes < 10)
        minutes = minutes + "0";
    if (hours < 12)
        return hours + ":" + minutes + " AM";
    else if (hours == 12)
        return hours + ":" + minutes + "PM";
    else
        return (hours - 12) + ":" + minutes + " PM";
}

module.exports = {
    numToTime: numToTime,
    slot_list: function (req, res, next) {
        Slot.find({ _vendor: req.query.vendorId },
            '_id date start_time end_time seats_available')
            .lean()
            .sort({ date: 1, start_time: 1 })
            .exec(function (err, slotList) {
                slotList.forEach(slot => {
                    slot.start_time = numToTime(slot.start_time);
                    slot.end_time = numToTime(slot.end_time);
                    var dateTime = new String(slot.date);
                    var pieces = dateTime.split(' ');
                    const date = pieces[0] + ' ' + pieces[1] + ' ' + pieces[2] + ' ' + pieces[3];
                    slot.date = date;
                    slot.dateTime = dateTime;
                })
                if (err) res.status(500).json({ error: 'Internal server error' });
                try {
                    var grouped = _.groupBy(slotList, "date");
                } catch (ex) {
                    console.log(ex);
                }
                var result = [];
                console.log(grouped);

                Object.keys(grouped).forEach(key => {
                    resultItem = {};
                    resultItem.date = key;
                    resultItem.slots = grouped[key];
                    result.push(resultItem);
                })

                return res.json(result);
            });
    }
}