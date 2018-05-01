var Moment = require('moment-timezone');
module.exports = {
    toLocalTime: function toLocalTime(utcDatetime) {
        var d = new Moment(utcDatetime);
        var n = d.tz('Asia/Kolkata').format();
        return n;
    }
}