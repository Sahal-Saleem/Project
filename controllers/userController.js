const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const otpHelper = require('../helpers/otpHelper')
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const couponHelper = require('../helpers/couponHelper')
const orderHelper = require('../helpers/orderHelper')
const Banner = require('../models/bannerModel')
const Review = require ('../models/reviewModel');

// jwt token

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: maxAge
  });
};
 
// password hashing

const securePassword = async(password)=>{
    try {
        const passwordHash = await bcrypt.hash(password,10);
        return passwordHash;
        
    } catch (error) {
        console.log(error.message);
        res.redirect('/error-500')
    }
}


// register page

const loadRegister = async(req,res)=>{
    try {

        res.render('registration');
    } catch (error) {
        console.log(error.message);
        res.redirect('/error-500')
    }

}

const insertUser = async(req,res)=>{
    const email = req.body.email;
    const mobileNumber = req.body.mno
    const existingUser = await User.findOne({email:email})
    if (!req.body.fname || req.body.fname.trim().length === 0) {
        res.render("registration", { message: "Name is required" });
    }
    else if (/\d/.test(req.body.fname) || /\d/.test(req.body.lname)) {
        res.render("registration", { message: "Name should not contain numbers" });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
     if (!emailRegex.test(email)){
         res.render("registration", { message: "Email Not Valid" });
    }
     if(existingUser){
       res.render("registration",{message:"Email already exists"})
    }
    const mobileNumberRegex = /^\d{10}$/;
     if (!mobileNumberRegex.test(mobileNumber)) {
         res.render("registration", { message: "Mobile Number should have 10 digit" });

    }
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(req.body.password)) {
  res.render("registration", { message: "Password should contain at least 8 characters, one number, and a special character" });
    }   


    if(req.body.password!=req.body.confpassword){
         res.render("registration", { message: "Password and Confirm Password must be same" });
    }

    const otp = otpHelper.generateOtp()
    // await otpHelper.sendOtp(mobileNumber,otp)
      console.log(`Otp is ${otp}`)
    try {
        req.session.otp = otp;
        req.session.userData = req.body;
        req.session.mobile = mobileNumber 
        res.render('otp')     
    } catch (error) {
        console.log(error.message);
        res.redirect('/error-500')
    }
}



//login user

const loginLoad = async(req,res)=>{
    try {
        if(res.locals.user!=null){
            res.redirect('/')
        }else{
            res.render('login')
        }
        
    } catch (error) {
        console.log(error.message);
        res.redirect('/error-500')
    }
}

const verifyLogin = async(req,res)=>{
    try {
        const email = req.body.email;
        const password = req.body.password;
        

        const userData = await User.findOne({email:email});

        if(userData){

            const passwordMatch = await bcrypt.compare(password,userData.password);
            

            if(passwordMatch){
                if (userData.is_blocked) {
                    res.render('login',{ message: "Your Account is Blocked" });
                  } else {
                const token = createToken(userData._id)
                res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
                res.redirect('/home');}

            }else{
                res.render('login',{message:"Email and password is incorrect"});
            }




        }else{
            res.render('login',{message:"Email and password is incorrect"});

        }
        

    } catch (error) {
        console.log(error.message);
        res.redirect('/error-500')
    }
}

const loadHome = async(req,res)=>{
    try {
        const banner = await Banner.find({})
        const product = await Product.find({is_listed:true});
        res.render('home',{product:product,banner})    
    } catch (error) {
        console.log(error.message);
        res.redirect('/error-500')
    }
  }


// logout
const logout = async(req,res)=>{
    try {
        res.clearCookie('jwt')
        res.redirect('/')
    } catch (error) {
        console.log(error.message);
        res.redirect('/error-500')
    }
}

// otp section

const verifyOtp = async(req,res)=>{
    const otp = req.body.otp
    try {
    const sessionOTP = req.session.otp;
    const userData = req.session.userData;

    if (!sessionOTP || !userData) {
        res.render('Otp',{ message: 'Invalid Session' });
    }else if (sessionOTP !== otp) {
        res.render('Otp',{ message: 'Invalid OTP' });
    }else{
    const spassword =await securePassword(userData.password)
        const user = new User({
            fname:userData.fname,
            lname:userData.lname,
            email:userData.email,
            mobile:userData.mno,
            password:spassword,
            is_admin:0
        })
        const userDataSave = await user.save()
        if(userDataSave){
            const token = createToken(user._id);
            res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
            res.redirect('/')
        }else{
            res.render('register',{message:"Registration Failed"})
        }
    }


    } catch (error) {
        console.log(error.message);
        res.redirect('/error-500')
    }
}

// resend otp
const resendOTP = async (req, res) => {
    const mobileNumber = req.session.mobile
    try {
      // Retrieve user data from session storage
      const userData = req.session.userData;
  
      if (!userData) {
        res.status(400).json({ message: 'Invalid or expired session' });
      }
  
      // Generate and send new OTP using Twilio
      const otp = otpHelper.generateOtp()

      req.session.otp = otp

    //   await otpHelper.sendOtp(mobileNumber,otp)
      console.log(`Resend Otp is ${otp}`)
  
      res.render('otp',{ message: 'OTP resent successfully' });
    } catch (error) {
      console.error('Error: ', error);
      res.render('otp',{ message: 'Failed to send otp' });
    }
  };

// forget password

const forgetPass = async(req,res)=>{
    try {
        res.render('forgetPassword')
        
    } catch (error) {
        console.log(error.message);
        res.redirect('/error-500')
    }
}


const resetPasswordOtpVerify = async (req,res)  => {
    try{
        const mobile = req.session.mobile
        const otp = req.session.otp
        const reqOtp = req.body.otp

        const otpHolder = await User.find({ mobile : req.body.mobile })
        if(otp==reqOtp){
            res.render('resetPassword')
        }
        else{
            res.render('forgotPasswordOtp',{message:"Your OTP was Wrong"})
        }
    }catch(error){
        console.log(error);
        return console.log("an error occured");
    }
}

const forgotPasswordOtp = async(req, res)=>{       
    const user = await User.findOne({mobile : req.body.mobile})                                     
    // req.session.number = number
    if(!user){
        res.render('forgetPassword',{message:"User Not Registered"})
    }else{
        const OTP = otpHelper.generateOtp()
        // await otpHelper.sendOtp(user.mobile,OTP)
        console.log(`Forgot Password otp is --- ${OTP}`) 
        req.session.otp = OTP
        req.session.email = user.email
        res.render('otpPass')
    }
     
}

const setNewPassword = async (req ,res) => {
    const newpw = req.body.newPassword
    const confpw = req.body.confPassword

    const mobile = req.session.mobile
    const email = req.session.email

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

if (!passwordRegex.test(req.body.newPassword)) {
  res.render("resetPassword", { message: "Password should contain at least 8 characters, one number, and a special character" });
} else if (newpw === confpw) {
  const spassword = await securePassword(newpw);
  const newUser = await User.updateOne({ email: email }, { $set: { password: spassword } });
  res.redirect('/login');
} else {
  res.render('resetPassword', { message: 'Password and Confirm Password do not match' });
}

    

     
}

// shop

const displayProduct = async (req, res) => {
    try {
      const category = await Category.find({});
      const page = parseInt(req.query.page) || 1;
      const limit = 6;
      const skip = (page - 1) * limit; // Calculate the number of products to skip
      const searchQuery = req.query.search || ''; // Get the search query from request query parameters
      const sortQuery = req.query.sort || 'default'; // Get the sort query from request query parameters (default value is 'default')
      const minPrice = parseFloat(req.query.minPrice); // Get the minimum price from request query parameters
      const maxPrice = parseFloat(req.query.maxPrice)

  
      // Build the search filter
      const searchFilter = {
        $and: [
          { is_listed: true },
          
          {
            $or: [
              { name: { $regex: new RegExp(searchQuery, 'i') } },
            ],
          },
        ],
      };
      if (!isNaN(minPrice) && !isNaN(maxPrice)) {
        searchFilter.$and.push({ price: { $gte: minPrice, $lte: maxPrice } });
      }

      let sortOption = {};
      if (sortQuery === 'price_asc' ||sortQuery === 'default' ) {
        sortOption = { price: 1 }; 
      } else if (sortQuery === 'price_desc') {
        sortOption = { price: -1 }; 
      }
  
      const totalProducts = await Product.countDocuments(searchFilter); // Get the total number of products matching the search query
      const totalPages = Math.ceil(totalProducts / limit); // Calculate the total number of pages
  
      const products = await Product.find(searchFilter)
        .skip(skip)
        .limit(limit)
        .sort(sortOption)
        .populate('category');
  
      res.render('shop', { product: products, category, currentPage: page, totalPages });
    } catch (error) {
      console.log(error.message);
      res.redirect('/error-500')

    }
  };
  

//   category
const categoryPage = async (req,res) =>{

    try{
        const category = await Category.find({ })
        const  categoryId = req.query.id
        const categories = await Category.find({ })
        const product = await Product.find({ category:categoryId,  is_listed: true }).populate('category')
        res.render('categoryShop',{product,category })
    }
    catch(err){
        console.log('category page error',err);
    }
}

// coupon 

const verifyCoupon = (req, res) => {
    let couponCode = req.params.id
    let userId = res.locals.user._id
    couponHelper.verifyCoupon(userId, couponCode).then((response) => {
        res.send(response)
    })
  }
  
  const applyCoupon =  async (req, res) => {
    let couponCode = req.params.id 
    let userId = res.locals.user._id
    let total = await couponHelper.totalCheckOutAmount(userId) 
    couponHelper.applyCoupon(couponCode, total).then((response) => {
        res.send(response)
    }) 
  }

//    error 

const error404 = async(req,res)=>{
    try {
      res.render('errorPages/error404')
      
    } catch (error) {
      console.log(error.message);
      
    }
  }
  const error403 = async(req,res)=>{
    try {
      res.render('errorPages/error403')
      
    } catch (error) {
      console.log(error.message);
      
    }
  }

  const error500 = async(req,res)=>{
    try {
      res.render('errorPages/error500')
      
    } catch (error) {
      console.log(error.message);
      
    }
  }

  //  review product
  const postReview = async (req, res) => {
    try {
      const review = new Review({ name: req.body.name, message: req.body.message, proId: req.body.proId });
      await review.save();
      // Redirect with the product ID as a query parameter
      res.redirect('/productPage?id=' + req.body.proId);
    } catch (error) {
      console.log(error);
    }
  };

  




module.exports = {
    loadRegister,
    insertUser,
    loginLoad,
    verifyLogin,
    loadHome,
    verifyOtp,
    forgetPass,
    forgotPasswordOtp,
    resetPasswordOtpVerify,
    setNewPassword,
    logout,
    resendOTP,
    displayProduct,
    categoryPage,
    verifyCoupon,
    applyCoupon,
    error404,
    error403,
    error500,
    postReview,
   
    
}