const mongoose = require('mongoose');
//const { BalanceSchema } = require('./Balance')
// https://mongoosejs.com/docs/schematypes.html

const TestCoinSchema = new mongoose.Schema({
    
    address: {
        type: String,
        required: true,
        unique: true
    },
    code: {
        type: String,
        required: true
    },
});

const TestCoin = new mongoose.model('TestCoin', TestCoinSchema);

module.exports = {
    TestCoin, TestCoinSchema
}
  