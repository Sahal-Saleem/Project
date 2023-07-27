const mongoose=require("mongoose"); 
const {isEmail}=require('validator')

const userSchema = new mongoose.Schema({

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
        required:[true,'please enter an email'],
        validate:[isEmail, 'please enter a valid email']
    },
    mobile:{
        type:String,
        required:[true,'please enter a password'],
        minlength:[10,'mobile number must contain 10 digits']
    }, 
    password:{ 
        type:String,
        required:true,
        minlength: [6,'password must contain 6 characters']
    },
    is_blocked:{
        type:Boolean,
        default:false
    },
    wallet:{
        type:Number,
        default:0
    },
    coupons:{
        type:Array
    }
});

module.exports = mongoose.model('User',userSchema);