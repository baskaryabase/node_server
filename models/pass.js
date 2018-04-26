var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var PassSchema = new Schema(
    {
        name: {type: String, required: true, maxlength: 100},
        price: {type: Number, required: true},
        validity: {type: Number, required: true},
        points: {type: Number, required: true}
    }
);

module.exports = mongoose.model('Pass', PassSchema);