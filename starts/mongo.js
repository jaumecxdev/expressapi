const dbConfig = require('../config/mongo.config.js');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(dbConfig.url, {
    //useNewUrlParser: true
    autoIndex: false
}).then(() => {
    console.log("Database Connected Successfully.");    
}).catch(err => {
    console.log('Could not connect to the database', err);
    process.exit();
});

//mongoose.set('autoIndex', false);