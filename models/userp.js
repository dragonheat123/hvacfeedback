var mongoose = require('mongoose');

// define the schema for our user model

var userpSchema= mongoose.Schema({
        user: String,
        timestamp : Number,
        date : String,
        area: Number,
        pvalue: Number,
        
});


// create the model for users and expose it to our app
module.exports = mongoose.model('Userp', userpSchema);
