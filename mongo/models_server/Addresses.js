var mongoose = require('mongoose');

var AddressSchema = new mongoose.Schema({
    firstName: {
        type: String,
        default: ''
    },
    lastName: {
        type: String,
        default: ''
    },
    company: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    address2: {
        type: String,
        default: ''
    },
    zipcode: {
        type: String,
        default: ''
    },
    city: {
        type: String,
        default: ''
    },
    state: {
        type: String,
        default: ''
    },
    country: {
        type: String,
        default: ''
    },
});

var Address = new mongoose.model('Address', AddressSchema);

module.exports = {
    Address,
}
  