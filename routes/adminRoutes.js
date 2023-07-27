const express = require('express');
const admin_route = express();
const adminController = require('../controllers/adminController');
const categoryController = require('../controllers/categoryController');
const userListController = require('../controllers/userListController');
const productController = require('../controllers/productController');
const orderController = require('../controllers/orderController')
const couponController = require('../controllers/couponController')
const validate = require('../middlewares/adminAuth')
const bannerController = require('../controllers/bannerController')
// const multer = require("../multer/multer");
const multer = require("../multer/multer");
const multers = require('multer')
const path = require('path');



const storage = multers.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, "../public/product-images"));
    }, 
    filename: function (req, file, cb) {
      cb(null, Date.now() + "-" + file.originalname);
    },
  });
  
  const upload = multers({ storage: storage });
  const multipleUpload = upload.fields([{ name: 'image1', maxCount: 1 }, { name:"image2" ,maxCount:1 }, { name:"image3" ,maxCount:1 }])




// view engine
admin_route.set('view engine','ejs');
admin_route.set('views','./views/admin');

//parser
admin_route.use(express.json());
admin_route.use(express.urlencoded({extended:true}));

//  login 
admin_route.get('/',adminController.loadAdmin);
admin_route.post('/verifyLogin',adminController.verifyLogin);
admin_route.get('/categoryManagement',adminController.categoryManagement);

// logout
admin_route.get('/logout',adminController.logout);

// category
admin_route.get('/category',validate.requireAuth,categoryController.loadCategory);
admin_route.get('/addCategory',validate.requireAuth,categoryController.loadAddCategory); 
admin_route.post('/addCategory',validate.requireAuth,categoryController.createCategory);
admin_route.get('/editCategory',validate.requireAuth,categoryController.loadUpdateCategory);
admin_route.post('/editCategory',validate.requireAuth,categoryController.updateCategory);
admin_route.get('/unListCategory',validate.requireAuth,categoryController.unListCategory);
admin_route.get('/reListCategory',validate.requireAuth,categoryController.reListCategory);

// userList
admin_route.get('/users',validate.requireAuth,userListController.loadUsers);
admin_route.get('/blockUser',validate.requireAuth,userListController.blockUser)
admin_route.get('/unBlockUser',validate.requireAuth,userListController.unBlockUser)


// product 
admin_route.get('/product',validate.requireAuth,productController.Products)
admin_route.get('/addProduct',validate.requireAuth,productController.loadProducts)
admin_route.post("/addProduct", multipleUpload,productController.createProduct)
admin_route.get('/reListProduct',productController.reListProduct)
admin_route.get('/unListProduct',productController.unListProduct)
admin_route.get('/updateProduct',validate.requireAuth,productController.loadUpdateProduct )
admin_route.post('/updateProduct',multipleUpload,productController.updateProduct) 
// admin_route.post('/productList',productController.productList)

// orders

admin_route.get('/orderList',validate.requireAuth,adminController.orderListAdmin)
admin_route.get('/orderDetails',validate.requireAuth,adminController.orderDetailsAdmin)
admin_route.put('/orderStatus',validate.requireAuth,adminController.changeStatus)
admin_route.put('/cancelStatus',validate.requireAuth,adminController.cancelOrder)
admin_route.put('/returnOrder',validate.requireAuth,adminController.returnOrder)


// coupon

admin_route.get('/getCoupon',validate.requireAuth,adminController.loadCouponAdd )
admin_route.get('/generate-coupon-code',validate.requireAuth,adminController.generateCouponCode) 
admin_route.get('/couponList',validate.requireAuth,adminController.couponList)
admin_route.post('/addCoupon',validate.requireAuth,adminController.addCoupon)
admin_route.delete('/removeCoupon',validate.requireAuth,adminController.removeCoupon)

// banner 
admin_route.get('/addBanner',bannerController.addBannerGet)
admin_route.post('/addBanner',multer.addBannerupload,bannerController.addBannerPost)
admin_route.get('/bannerList',bannerController.bannerList)
admin_route.get('/deleteBanner',bannerController.deleteBanner)

// sales report
admin_route.get('/salesReport',validate.requireAuth,adminController.getSalesReport)
admin_route.post('/salesReport',adminController.postSalesReport)

// dashboard
admin_route.get('/dashboard',adminController.loadDashboard)




module.exports = admin_route 