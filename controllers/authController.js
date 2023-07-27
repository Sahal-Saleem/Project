// const userModel = require('../models/userModel')
// const jwt = require('jsonwebtoken')

// jwt token

// const maxAge = 3*24*60*60;
// const createToken = (id) =>{
//     return jwt.sign({id},'secret',{
//         expiresIn: maxAge 
//     });
// }

// module.exports.signup_get = (req,res)=>{
//     res.render('signup');
// }

// module.exports.login_get = (req,res)=>{
//     res.render('login');
// }

// module.exports.signup_post = async(req,res)=>{
//     const{ name,email,password,mobile} = req.body;
    

//     try {
//        const user =  userModel.create({name,email,password,mobile});
//        const token = createToken(user._id);
//        res.cookie('jwt', token , {httpOnly:true, maxAge:maxAge*1000});
//        res.status(201).json({user:user._id});
        
//     } catch (error) {
//         console.log(err); 
//         res.status(404).send('error,user not created');
//     }
// }

// module.exports.login_post = async(req,res)=>{
//     res.send('user login');
// } 