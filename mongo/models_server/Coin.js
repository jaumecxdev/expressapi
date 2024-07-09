var mongoose = require('mongoose');

// https://mongoosejs.com/docs/schematypes.html
var CoinSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true,
        unique: true
    },
    public: { 
        type: String,
        required: true
    },
    private: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
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
        default: null
    },
    // to.markModified('balances');
    exchanges: { 
        type: {},
     },
    // to.markModified('info');
    info:  { 
        type: {},
     }
});

var Coin = new mongoose.model('Coin', CoinSchema);

module.exports = {
    Coin
}
  