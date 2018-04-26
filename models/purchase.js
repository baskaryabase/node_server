var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PurchaseSchema = new Schema({
    _user: { type: Schema.Types.ObjectId, ref:'User', required: true },
    orderType: {type:String, enum:['points','socials'], required:true},
    orderId: {type:String, required:true},
    orderQty:{type:Number, required:true},
    itemName: { type: String, required: true },
    date: { type: Date, default: Date.now() },
    baseAmt: { type: Number, required: true },
    discount: {type: Number, default:0},
    taxAmt: { type: Number, required: true },
    totAmt: { type: Number, required: true },
    txnId: { type: String },
    deviceType: { type: String, enum: ['ios', 'android', 'web'], required: true },
    txnStatus: {type:String, enum:['pending','success'], required:true}
});

module.exports = mongoose.model('Purchase', PurchaseSchema);