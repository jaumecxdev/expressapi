var { mongoose } = require('mongoose');

var TokenSchema = new mongoose.Schema({
    access: {
        type: String,
        required: true,
        unique: true
    },
    refresh: { 
        type: String,
        required: true,
        index: true
    },
    userId: {
        type: String,
        unique: true
    }
});

var Token = new mongoose.model('Token', TokenSchema);

module.exports = {
    Token
}
  