var mongoose = require('mongoose');

// define the schema for our user model

var nodesSchema= mongoose.Schema({
        Node: String,
        timestamp : Number,
        date : String,
        Temp: Number,
        Humd: Number,
        
});


// create the model for users and expose it to our app
module.exports = mongoose.model('Nodes', nodesSchema);
