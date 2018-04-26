var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CouponType = new Schema({
    code: {type:String, required:true},
    discount: {type:Number, required:true}, //in percentage
    expiry: {type:Number, required:true} // in days
})

var CouponSchema = new Schema({
    _user:{type:Schema.Types.ObjectId, ref:'User', required:true},
    coupon:CouponType,
    expiryDate: {type:Date, required:true}
});

module.exports = mongoose.model('Coupon',CouponSchema);