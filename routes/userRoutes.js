const express = require("express");
const user_route = express();
const userController = require('../controllers/userController');
const profileController = require('../controllers/profileController')
const productController = require('../controllers/productController')
const cartController = require('../controllers/cartController')
const orderController = require('../controllers/orderController')
const wishListController = require('../controllers/wishListController')
const block = require('../middlewares/blockMiddleware');
const path = require("path");
const multer = require("multer");
const validate = require('../middlewares/userAuthJwt')
const session = require('express-session')
const nocache = require('nocache')
user_route.use(nocache())



user_route.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  }));

// view engine
user_route.set('view engine','ejs');
user_route.set('views','./views/users');

//parser
user_route.use(express.json());
user_route.use(express.urlencoded({extended:true}));

//middlewares


//register
user_route.get('/register',userController.loadRegister);
user_route.post('/register',userController.insertUser);
user_route.post('/verifyOtp',userController.verifyOtp);


//home
user_route.all('*',validate.checkUser);
user_route.get('/',block.checkBlocked,userController.loadHome);
user_route.get('/home',block.checkBlocked,userController.loadHome);

//login
user_route.get('/login',userController.loginLoad);
user_route.post('/login', userController.verifyLogin);

// logout
user_route.get('/logout',userController.logout)

// forget password
user_route.get('/forgetPassword',userController.forgetPass);
user_route.post('/forgetPassword',userController.forgotPasswordOtp);
user_route.post('/forgetPasswordVerify',userController.resetPasswordOtpVerify);

// set new password
user_route.post('/setNewPassword',userController.setNewPassword);

// resend otp
user_route.get('/resendOtp',userController.resendOTP)
 
// user shop
user_route.get('/shop',block.checkBlocked,userController.displayProduct)

// profile
user_route.get('/profile',block.checkBlocked,validate.requireAuth,profileController.profile)
user_route.post('/submitAddress',profileController.submitAddress)
user_route.post('/updateAddress',profileController.editAddress)
user_route.get('/deleteAddress',block.checkBlocked,profileController.deleteAddress)
user_route.post('/editInfo',profileController.editInfo)
user_route.post('/editPassword',profileController.editPassword)
user_route.get('/profileDetails',profileController.profileDetails)
user_route.get('/profileOrderList',profileController.profileOrderList)
user_route.get('/profileAddress',profileController.profileAdress) 


// product details
user_route.get('/productPage',block.checkBlocked,productController.productPage)
user_route.get('/categoryShop',block.checkBlocked,userController.categoryPage)

// cart
user_route.post('/addToCart/:id',validate.requireAuth,cartController.addToCart)
user_route.get('/cart',block.checkBlocked,validate.requireAuth,cartController.loadCart)
user_route.put('/updateQuantity',cartController.updateQuantity)
user_route.delete('/delete',cartController.deleteProduct)
 
// order 
user_route.get('/checkOut',block.checkBlocked,validate.requireAuth,orderController.checkOut)
user_route.post('/changeDefaultAddress',validate.requireAuth,orderController.changePrimary)
user_route.post('/checkOutAddress',profileController.checkOutAddress)
user_route.post('/postCheckOut',orderController.postCheckOut)
user_route.get('/orderList',block.checkBlocked,orderController.orderList) 
user_route.get('/orderDetails',block.checkBlocked,orderController.orderDetails)
user_route.put('/cancelOrder',orderController.cancelOrder)
user_route.post('/verifyPayment',orderController.verifyPayment)

// coupon

user_route.get('/applyCoupon/:id',block.checkBlocked,userController.applyCoupon)
user_route.get('/couponVerify/:id',block.checkBlocked,userController.verifyCoupon)

// wishList

user_route.get("/wishList", block.checkBlocked,wishListController.getWishList);
user_route.post('/add-to-wishlist',wishListController.addWishList)
user_route.delete("/remove-product-wishlist",wishListController.removeProductWishlist)

// Error 
user_route.get('/error-403',userController.error403)
user_route.get('/error-404',userController.error404)
user_route.get('/error-500',userController.error500)

// invoice
user_route.get('/invoice',orderController.downloadInvoice) 

// review
user_route.post('/postReview',userController.postReview)

 




module.exports = user_route;
   