var mongoose = require("mongoose");
var Schema = mongoose.Schema;
const bcrypt = require("bcrypt-nodejs");

//TODO: validation and seats_available
const GeoSchema = new Schema({
  type: {
    type: String,
    default: "point"
  },
  coordinates: {
    type: [Number],
    index: "2dsphere"
  }
});

var WorkingHourSchema = new Schema({
  name: { type: String },
  from: { type: Date },
  to: { type: Date }
});

var VendorContactSchema = new Schema({
  name: { type: String },
  phone: { type: Number },
  email: { type: String }
});

var VendorSchema = new Schema({
  name: { type: String, maxlength: 100 },
  address: { type: String },
  area: { type: String, maxlength: 50 },
  city: { type: String, maxlength: 50 },
  location: GeoSchema,
  logo: { type: String },
  points_cost: { type: Number },
  capacity: { type: Number, default: 100 },
  is_active: { type: Boolean, default: true },
  images: [{ url: { type: String } }],
  working_hours: [WorkingHourSchema],
  contact: VendorContactSchema
});

var VendorAdminSchema = new Schema({
    _vendor: { required: true, type: Schema.Types.ObjectId, ref: 'Vendor' },
  phone: {
    required: true,
    type: String,
    trim: true
  },
  email: {
    required: true,
    type: String,
    trim: true,
    unique: true,
    lowercase: true
  },
  name: { required: true, type: String, trim: true },
  password: { required: true, type: String, trim: true },
  profile: VendorSchema
});

VendorAdminSchema.pre("save", function(next) {
  const user = this;
  bcrypt.genSalt(10, function(err, salt) {
    if (err) {
      return next(err);
    }

    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) {
        return next(err);
      }

      user.password = hash;
      next();
    });
  });
});

VendorAdminSchema.methods.comparePassword = function(
  candidatePassword,
  callback
) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) {
      return callback(err);
    }

    callback(null, isMatch);
  });
};

const VendorAdmin = mongoose.model("VendorAdmin", VendorAdminSchema);

module.exports = VendorAdmin;
