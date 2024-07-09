const mongoose = require('mongoose');
const crypto = require("crypto");
// https://mongoosejs.com/docs/schematypes.html

const BlockSchema = new mongoose.Schema({

    count: { 
        type: Number,      // 0, 1, 2
        required: true,
        unique: true
    },

    // to.markModified('date');
    createdAt: {
        type: Date,
        required: true,
    },

    hash: {
        type: String,
        required: true,
        unique: true
    },

    previousHash: {
        type: String,
        required: true,
        unique: true
    },

    nonce: { 
        type: Number,
        required: true
    },

    // to.markModified('payload');
    payload: {
        type: [],
        required: true
    }
});

BlockSchema.method('lcltCalcHash', function () {
    console.log('lcltCalcHash');
    return crypto.createHash('sha256')
        .update(this.count.toString() + 
            this.createdAt.toString() + 
            this.previousHash + 
            this.nonce.toString() + 
            JSON.stringify(this.payload))
        .digest('hex');
});

const Block = new mongoose.model('Block', BlockSchema);

module.exports = {
    Block, BlockSchema
}
  