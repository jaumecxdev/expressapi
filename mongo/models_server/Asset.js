const mongoose = require('mongoose');
// https://mongoosejs.com/docs/schematypes.html

const AssetSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true,
        unique: true
    },
    publicKey: { 
        type: String,
        required: true
    },
    privateKey: {
        type: String,
        required: true
    },
    owner_account_address: {
        type: String,
        required: true
    },
    bundle_address: {
        type: String,
        default: null
    },
    queue_address:  {
        type: String,
        default: null
    },
    codes: {
        type: {},           
    },
    info: {
        type: {},           
    },
});

const Asset = new mongoose.model('Asset', AssetSchema);

module.exports = {
    Asset
}