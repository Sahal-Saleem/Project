const jwt = require('jsonwebtoken')
const Admin = require('../models/adminModel')
const bcrypt = require('bcrypt');
const Cart = require('../models/cartModel');
const orderHelper = require('../helpers/orderHelper')
const Order = require('../models/orderModel');
const adminHelper = require('../helpers/adminHelper')
const couponHelper = require('../helpers/couponHelper')
const Coupon = require('../models/couponModel')
const Category = require('../models/categoryModel')
const Product = require('../models/productModel')


// login
const loadAdmin = async(req,res)=>{
    try {
        res.render('login')
    } catch (error) {
       console.log( error.message);
    }
}

// create token

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, 'MY_SECRET', {  
    expiresIn: maxAge
  }); 
};

// verify login
const verifyLogin = async(req,res)=>{
    try {
        const username = req.body.username;
        const password = req.body.password;
        
        const adminData =await Admin.findOne({username:username})


        if(adminData.password === password){
            // const passwordMatch = await bcrypt.compare(password,userData.password)
            if(adminData){
                const token = createToken(adminData._id);
                res.cookie('jwtAdmin', token, { httpOnly: true, maxAge: maxAge * 1000 });
                res.redirect('/admin/category')
            }else{
                res.render('login',{message:"Email and Password are Incorrect"});
            }
            
        }else{
            res.render('login',{message:"Email and Password are Incorrect"});
        }
        
    } catch (error) {
        console.log(error.message);
    }
}

// logout 

const logout = async (req,res)=>{
    try {
        res.cookie('jwtAdmin', '' ,{maxAge : 1})
        res.redirect('/admin')
    } catch (error) {
        console.log(error.message);
    }
}

// category management



const categoryManagement = async(req,res)=>{
    try {
        res.render('categoryManagement')
    } catch (error) {
        console.log(error.message);
    }
}

// order admin side

const orderListAdmin = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1; // Current page number, default is 1
      const limit = parseInt(req.query.limit) || 5; // Number of items per page, default is 10
  
      const totalOrders = await Order.aggregate([
        { $unwind: "$orders" },
        { $group: { _id: null, count: { $sum: 1 } } },
      ]);
      const count = totalOrders.length > 0 ? totalOrders[0].count : 0;
      const totalPages = Math.ceil(count / limit);
      
  
      const skip = (page - 1) * limit;
  
      const orders = await Order.aggregate([
        { $unwind: "$orders" },
        { $sort: { "orders.createdAt": -1 } },
        { $skip: skip },
        { $limit: limit },
      ]);
      
      res.render("orderList", { orders, totalPages, page,limit });
      
    } catch (error) {
      console.log(error.message);
    }
  };
  
  
  
  
  
  
  const orderDetailsAdmin = async (req,res)=>{
      try {
        const id = req.query.id
        orderHelper.findOrderAdmin(id).then((orders) => {
          const address = orders[0].shippingAddress
          const products = orders[0].productDetails 
          res.render('orderDetails',{orders,address,products}) 
        });
          
      } catch (error) {
        console.log(error.message);
      }
    
    }

    const changeStatus = async(req,res)=>{
      const orderId = req.body.orderId
      const status = req.body.status
      adminHelper.changeOrderStatus(orderId, status).then((response) => {
        console.log(response);
        res.json(response);
      });
    
    }

    const cancelOrder = async(req,res)=>{
        const userId = req.body.userId
      
        const orderId = req.body.orderId
        const status = req.body.status      
        adminHelper.cancelOrder(orderId,userId,status).then((response) => {
          res.send(response);
        });
      
      }
      const returnOrder = async(req,res)=>{
        const orderId = req.body.orderId

        const status = req.body.status
        const userId = req.body.userId       
        adminHelper.returnOrder(orderId,userId,status).then((response) => {
          res.send(response);
        });
      
      }

      // coupon 

      const loadCouponAdd = async(req,res)=>{
        try {
            res.render('addCoupon')
        } catch (error) {
            console.log(error.message);
        }
    }
    
    
    const generateCouponCode = (req,res)=>{
        couponHelper.generatorCouponCode().then((couponCode) => { 
            res.send(couponCode);
          });
    }
    
    
    const addCoupon =  (req, res) => {
        try {
            const data = {
                couponCode: req.body.coupon,
                validity: req.body.validity,
                minPurchase: req.body.minPurchase,
                minDiscountPercentage: req.body.minDiscountPercentage,
                maxDiscountValue: req.body.maxDiscount,
                description: req.body.description,
              };
              couponHelper.addCoupon(data).then((response) => {
                res.json(response);
              });
            
        } catch (error) {
            console.log(error.message);  
        }
       
      }
    
      const couponList = async(req,res)=>{
        try {
            const couponList = await Coupon.find()
            res.render('couponList',{couponList})
        } catch (error) {
            
        }
      }
     
    const removeCoupon = async(req,res)=>{
        try {
            const id = req.body.couponId
            await Coupon.deleteOne({_id:id})
            res.json({status:true})
            
        } catch (error) {
            
        }
    }

    // dashboard

    const loadDashboard = async(req,res)=>{
      try {
        const orders = await Order.aggregate([
          { $unwind: "$orders" },
          {
            $group: {
              _id: null,
              totalPriceSum: { $sum: { $toInt: "$orders.totalPrice" } },
              count: { $sum: 1 }
            }
          }
    
          
    
    
        ])
    
        const salesData = await Order.aggregate([
          { $unwind: "$orders" },
          {
            $match: {
              "orders.orderStatus": "Delivered"  // Consider only completed orders
            }
          },
          {
            $group: {
              _id: {
                $dateToString: {  // Group by the date part of createdAt field
                  format: "%Y-%m-%d",
                  date: "$orders.createdAt"
                }
              },
              dailySales: { $sum: { $toDouble: "$orders.totalPrice" } }  // Calculate the daily sales
            }
          },
          {
            $sort: {
              _id: 1  // Sort the results by date in ascending order
            }
          }
        ])
    
        const salesCount = await Order.aggregate([
          { $unwind: "$orders" },
          {
            $match: {
              "orders.orderStatus": "Delivered"  // Consider only completed orders
            }
          },
          {
            $group: {
              _id: {
                $dateToString: {  // Group by the date part of createdAt field
                  format: "%Y-%m-%d",
                  date: "$orders.createdAt"
                }
              },
              orderCount: { $sum: 1 }  // Calculate the count of orders per date
            }
          },
          {
            $sort: {
              _id: 1  // Sort the results by date in ascending order
            }
          }
        ])
    
    
    
        const categoryCount  = await Category.find({}).count()
        const productsCount  = await Product.find({}).count()
        const onlinePay = await adminHelper.getOnlineCount()
        const latestorders = await Order.aggregate([
          {$unwind:"$orders"},
          {$sort:{
            'orders.createdAt' :-1
          }},
          {$limit:10}
        ]) 
          res.render('dashboard',{orders,productsCount,categoryCount,onlinePay,salesData,order:latestorders,salesCount})
      } catch (error) {
          console.log(error)
      }
    }

    //  sales report

    const getSalesReport =  async (req, res) => {
      const report = await adminHelper.getSalesReport();
      let details = [];
      const getDate = (date) => {
        const orderDate = new Date(date);
        const day = orderDate.getDate();
        const month = orderDate.getMonth() + 1;
        const year = orderDate.getFullYear();
        return `${isNaN(day) ? "00" : day} - ${isNaN(month) ? "00" : month} - ${
          isNaN(year) ? "0000" : year
        }`;
      };
    
      report.forEach((orders) => {
        details.push(orders.orders);
      });
    
      res.render('salesReport',{details,getDate})
    
      
    }
    
    const postSalesReport =  (req, res) => {
      let details = [];
      const getDate = (date) => {
        const orderDate = new Date(date);
        const day = orderDate.getDate();
        const month = orderDate.getMonth() + 1;
        const year = orderDate.getFullYear();
        return `${isNaN(day) ? "00" : day} - ${isNaN(month) ? "00" : month} - ${
          isNaN(year) ? "0000" : year
        }`;
      };
    
      adminHelper.postReport(req.body).then((orderData) => {
        orderData.forEach((orders) => {
          details.push(orders.orders);
        });
        res.render("salesReport", {details,getDate});
      });
    }
    


module.exports = {
    loadAdmin,
    verifyLogin,
    categoryManagement,
    logout,
    orderListAdmin,
    orderDetailsAdmin,
    cancelOrder,
    returnOrder,
    changeStatus, 
    loadCouponAdd,
    generateCouponCode,
    addCoupon,
    couponList,
    removeCoupon,
    loadDashboard,
    getSalesReport,
    postSalesReport

    
}