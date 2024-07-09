var mongoose = require('mongoose');

// https://mongoosejs.com/docs/schematypes.html
var CoinSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true,
        unique: true
    },
    code: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        default: null
    },
    equal: {
        type: String,
        default: null
    },
    org_address: {
        type: String,
        unique: true
    },
    // to.markModified('balances');
    exchanges: { 
        type: {},
    },

    info: {
        type: {},
    },
});

var Coin = new mongoose.model('Coin', CoinSchema);

module.exports = {
    Coin
}
  