const couponHelper = require('../helpers/couponHelper')
const Coupon = require('../models/couponModel')

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



  module.exports = {
    verifyCoupon,
    applyCoupon
  }



    
