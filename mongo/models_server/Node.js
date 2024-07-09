var mongoose = require('mongoose');

var NodeSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true,
        unique: true
    },
    weigh: { 
        type: Number,      // 0, 1, 2
        required: true
    },
    online: { 
        type: Boolean,
        default: true
    },
    info: { type: Object },     // { }
});

var Node = new mongoose.model('Node', NodeSchema);

module.exports = {
    Node,
}
  