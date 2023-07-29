const Order = require('../models/orderModel')
const User = require ('../models/userModel')
const mongoose = require ('mongoose')
const Product = require('../models/productModel')
const { ObjectId } = require("mongodb");



const cancelOrder = (orderId,userId, status) => {
  try {

    return new Promise(async (resolve, reject) => {
      Order.findOne({ "orders._id": new ObjectId(orderId) }).then(async(orders) => {
        const order = orders.orders.find((order) => order._id == orderId);
        if(order.paymentMethod=='cod'){

        if (status == 'Cancel Accepted') {
          Order.updateOne(
            { "orders._id": new ObjectId(orderId) },
            {
              $set: {
                "orders.$.cancelStatus": status,
                "orders.$.orderStatus": status,
                "orders.$.paymentStatus": "No Refund"
              }
            }
          )
          
          .then(async(response) => {
            await addToStock(orderId,userId)
            resolve(response);
          });
        }else if(status == 'Cancel Declined'){
          Order.updateOne(
            { "orders._id": new ObjectId(orderId) },
            {
              $set: {
                "orders.$.cancelStatus": status,
                "orders.$.orderStatus": status,
                "orders.$.paymentStatus": "No Refund"
              }
            }
          ).then(async(response) => {
            resolve(response);
          });
          

        }
      }else if(order.paymentMethod=='wallet'||order.paymentMethod=='razorpay'){
        if(status == 'Cancel Accepted'){
          Order.updateOne(
            { "orders._id": new ObjectId(orderId) },
            {
              $set: {
                "orders.$.cancelStatus": status,
                "orders.$.orderStatus": status,
                "orders.$.paymentStatus": "Refund Credited to Wallet"
              }
            }
          ).then(async (response) => {
            const user = await User.findOne({ _id: userId});
            user.wallet += parseInt(order.totalPrice);
            await user.save();
            await addToStock(orderId,userId)
            const walletTransaction = {
              date:new Date(),
              type:"Credit",
              amount:order.totalPrice,
            }
            const walletupdated = await User.updateOne(
              { _id: userId },
              {
                $push: { walletTransaction: walletTransaction },
              }
            )
            resolve(response);
          });

        }else if(status == 'Cancel Declined'){
          Order.updateOne(
            { "orders._id": new ObjectId(orderId) },
            {
              $set: {
                "orders.$.cancelStatus": status,
                "orders.$.orderStatus": status,
                "orders.$.paymentStatus": "No Refund"
              }
            }
          ).then((response) => {
            resolve(response);
          });
        }

      }
      });
    });
  } catch (error) {
    console.log(error.message);
  }
};

  const returnOrder = async (orderId,userId,status) => {
    try {
      return new Promise(async (resolve, reject) => {
        Order.findOne({ "orders._id": new mongoose.Types.ObjectId(orderId) }).then((orders) => {
          const order = orders.orders.find((order) => order._id == orderId);
       
          if(order.paymentMethod == 'cod'){
          if (status == 'Return Declined') {
            Order.updateOne(
              { "orders._id": new mongoose.Types.ObjectId(orderId) },
              {
                $set: {
                  "orders.$.cancelStatus": status,
                  "orders.$.orderStatus": status,
                  "orders.$.paymentStatus": "No Refund"
                } 
              }
            ).then((response) => {
              resolve(response);
            });
          }else if(status == 'Return Accepted'){
            Order.updateOne(
              { "orders._id": new mongoose.Types.ObjectId(orderId) },
              {
                $set: {
                  "orders.$.cancelStatus": status,
                  "orders.$.orderStatus": status,
                  "orders.$.paymentStatus": "Refund Credited to Wallet"
                }
              } 
            ).then(async (response) => {
              const user = await User.findOne({ _id: userId});
              
              user.wallet += parseInt(order.totalPrice);
              await user.save();
              resolve(response); 
            });
 
          }
        }else if(order.paymentMethod=='wallet'|| order.paymentMethod=='razorpay' ){
          if(status == 'Return Accepted'){
            Order.updateOne(
              { "orders._id": new mongoose.Types.ObjectId(orderId) },
              {
                $set: {
                  "orders.$.cancelStatus": status,
                  "orders.$.orderStatus": status,
                  "orders.$.paymentStatus": "Refund Credited to Wallet"
                }
              }
            ).then(async (response) => {
              const user = await User.findOne({ _id: userId});
              user.wallet += parseInt(order.totalPrice);
              await user.save();
              resolve(response);
            });

          }else if(status == 'Return Declined'){
            Order.updateOne(
              { "orders._id": new mongoose.Types.ObjectId(orderId) },
              {
                $set: {
                  "orders.$.cancelStatus": status,
                  "orders.$.orderStatus": status,
                  "orders.$.paymentStatus": "No Refund"
                }
              }
            ).then((response) => {
              resolve(response);
            });
          }
        }
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  const changeOrderStatus = (orderId, status) => {
    try {
      return new Promise((resolve, reject) => {
        Order.updateOne(
          { "orders._id": new mongoose.Types.ObjectId(orderId) },
          {
            $set: { "orders.$.orderStatus": status },
          }
        ).then((response) => {
          resolve({status:true,orderStatus:status});
        });
      });

    } catch (error) {
      console.log(error.message);
    }
  }

  const getOnlineCount =  () => {
    return new Promise(async (resolve, reject) => {
      let response = await Order.aggregate([
        {
          $unwind: "$orders",
        },
        {
          $match: {
            "orders.paymentMethod": "razorpay",
          },
        },
        {
          $group:{
            _id: null,
          totalPriceSum: { $sum: { $toInt: "$orders.totalPrice" } },
          count: { $sum: 1 }

          }

        }

      ]);
      resolve(response);
    });
  }

  const getSalesReport =  () => {
    try {
      return new Promise((resolve, reject) => {
        Order.aggregate([
          {
            $unwind: "$orders",
          },
          {
            $match: {
              "orders.orderStatus": "Delivered",
            },
          },
        ]).then((response) => {
          resolve(response);
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  }

  const postReport = (date) => {
    try {
      const start = new Date(date.startdate);
      const end = new Date(date.enddate);
      return new Promise((resolve, reject) => {
        Order.aggregate([
          {
            $unwind: "$orders",
          },
          {
            $match: {
              $and: [
                { "orders.orderStatus": "Delivered" },
                {
                  "orders.createdAt": {
                    $gte: start,
                    $lte: new Date(end.getTime() + 86400000),
                  },
                },
              ],
            },
          },
        ])
          .exec()
          .then((response) => {
            resolve(response);
          });
      });
    } catch (error) {
      console.log(error.message);
    }
  }

  const addToStock = async(orderId,userId)=>{
  
    Order.findOne({ "orders._id": new ObjectId(orderId) }).then(async(orders) => {
      const order = orders.orders.find((order) => order._id == orderId);
      const cartProducts = order.productDetails
      for(const cartProduct of cartProducts ){
        const productId = cartProduct.productId;
        const quantity = cartProduct.quantity;
        const product = await Product.findOne({_id:productId})
        await Product.updateOne({_id:productId},
          {$inc:{stock:quantity}}
          )
      }  
    })
  }


  module.exports = {
    cancelOrder,
    returnOrder,
    changeOrderStatus,
    getOnlineCount,
    getSalesReport,
    postReport
  }