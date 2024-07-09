const mongoose = require('mongoose');
//const { BalanceSchema } = require('./Balance')
// https://mongoosejs.com/docs/schematypes.html

const BalanceSchema = new mongoose.Schema({
    ObjectId: Number
});

const TestSchema = new mongoose.Schema({
    
    balances: {},                 // mongoose.Mixed, { {coin_address: balance}, {coin_address2: balance2} },
});

const Test = new mongoose.model('Test', TestSchema);

module.exports = {
    Test, TestSchema
}
  