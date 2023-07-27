const mongoose = require('mongoose');

const userListSchema = new mongoose.Schema({
    fname:{
        type:String,
        required:true

    },
    lname:{
        type:String,
        required:true

    },
    email:{
        type:String,
        required:true
        
    },
    mobile:{
        type:String,
        required:true
       
    },
    is_blocked:{
        type:Boolean,
        required:true,
        default:false
    }

   
});

module.exports = mongoose.model('userData',userListSchema);