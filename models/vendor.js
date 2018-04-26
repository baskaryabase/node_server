var mongoose = require('mongoose');
var constants = require('../config/constants')

var Schema = mongoose.Schema;

//TODO: validation and seats_available
const GeoSchema = new Schema(
    {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            index: '2dsphere'
        }
    }
);

var WorkingHourSchema = new Schema(
    {
        name: { type: String, enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], required: true, is_primary: true },
        from: { type: Number, required: true },
        to: { type: Number, required: true },
    }
);

var VendorContactSchema = new Schema(
    {
        name: { type: String, required: true },
        phone: { type: Number, required: true },
        email: { type: String, required: true },
        is_primary: { type: Boolean, default: false, required: true }
    }
);

var VendorSchema = new Schema(
    {
        name: { type: String, required: true, maxlength: 100 },
        address: { type: String, required: true },
        area: { type: String, maxlength: 50 },
        city: { type: String, required: true, maxlength: 50 },
        location: GeoSchema,
        logo: { type: String },
        points_cost: { type: Number, required: true },
        capacity: { type: Number, default: 5 },
        is_active: { type: Boolean, default: true },
        images: [{ url: { type: String } }],
        working_hours: [WorkingHourSchema],
        contacts: [VendorContactSchema]
    }
);

VendorSchema.virtual('logo_url').get(function () {
    var logoBaseUrl = constants['IMG_BASE_URL'] + 'venlogo/';
    return logoBaseUrl + this.logo;
});

VendorSchema.virtual('image_urls').get(function () {
    var imgBaseUrl = constants['IMG_BASE_URL'] + 'vendor/';
    var imgUrls = [];
    this.images.forEach(image => {
        imgUrls.push({
            'url': imgBaseUrl + image.url
        });
    });
    return imgUrls;
});

module.exports = mongoose.model('Vendor', VendorSchema);