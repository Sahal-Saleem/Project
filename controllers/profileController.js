const Product = require("../models/productModel");
const Address = require("../models/adressModel");
const profileHelper = require("../helpers/profileHelper")
const User = require('../models/userModel')
const Order = require('../models/orderModel')
const bcrypt = require('bcrypt')


const securePassword = async(password)=>{
  try {
      
      const passwordHash =await bcrypt.hash(password,10)
      return passwordHash
  } catch (error) {
      console.log(error.message);
  }
}



// profile render
const profile = async (req, res) => {
    try {
  
      const user = res.locals.user;
      const address = await Address.find({user:user._id});
      const ad = address.forEach((x) => {
        return (arr = x.addresses);
      });
      res.render("profile", { user});
    } catch (error) {
      console.log(error.message);
    }
  }; 

// const profile = async (req, res) => {
//     try {
//       const user = res.locals.user;
//       const address = await Address.find({ user: user._id });
//       const arr = address.map((x) => x.addresses); // Extract addresses into arr variable
//       res.render("profile", { user, arr }); // Pass arr to the view template
//     } catch (error) {
//       console.log(error.message);
//     }
//   };

//   submit address

  const submitAddress = async (req, res) => {
    try {
      const userId = res.locals.user._id;
      const name = req.body.name;
      const mobileNumber = req.body.mno;
      const address = req.body.address;
      const locality = req.body.locality;
      const city = req.body.city;
      const pincode = req.body.pincode;
      const state = req.body.state;
  
      // Create a new address object
      const newAddress = {
        name: name,
        mobileNumber: mobileNumber,
        address: address,
        locality: locality,
        city: city,
        pincode: pincode,
        state: state,
      };

    
  
    const updatedUser = await profileHelper.updateAddress(userId, newAddress);
      if (!updatedUser) {
        // No matching document found, create a new one
        await profileHelper.createAddress(userId, newAddress);
      }
  
      res.json({ message: "Address saved successfully!" });
  
    //   res.redirect("/profile"); // Redirect to the profile page after saving the address
    } catch (error) {
      console.log(error.message);
    }
  };


  ///edit address

const editAddress = async (req, res) => {
    console.log("hai");
    const id = req.body.id;
    const name = req.body.name;
    const address = req.body.address;
    const locality = req.body.locality;
    const city = req.body.city;
    const pincode = req.body.pincode;
    const state = req.body.state;
    const mobileNumber = req.body.mobileNumber;
  
    const update = await Address.updateOne(
      { "addresses._id": id }, // Match the document with the given ID
      {
        $set: {
          "addresses.$.name": name,
          "addresses.$.address": address,
          "addresses.$.locality": locality,
          "addresses.$.city": city,
          "addresses.$.pincode": pincode,
          "addresses.$.state": state,
          "addresses.$.mobileNumber": mobileNumber,
        },
      }
    );
  
    res.redirect("/profile");
  };


///delete address

const deleteAddress = async (req, res) => {
    const userId = res.locals.user._id;
    const addId = req.query.id;  
    const deleteobj = await Address.updateOne(
      { user: userId }, // Match the user based on the user ID
      { $pull: { addresses: { _id: addId } } } // Remove the object with matching _id from addresses array
    );
  
    res.redirect("/profile");
  };

  ///edit info

const editInfo = async (req, res) => {
    try {
      userId = res.locals.user._id;
      const { fname, lname, email, mobile } = req.body;
      const result = await User.updateOne(
        { _id: userId }, // Specify the user document to update based on the user ID
        { $set: { fname, lname, email, mobile } } // Set the new field values
      );
  
      res.redirect("/profile");
    } catch (error) {
      console.log(error.message);
    }
  };
  
  //editPassword
  const editPassword = async (req, res) => {
    try {
      const newPass = req.body.newPassword;
      userId = res.locals.user._id;
        const spassword = await securePassword(newPass);
        const result = await User.updateOne(
          { _id: userId }, 
          { $set: { password: spassword } } 
        );
        res.redirect('/profile')
      
    } catch (error) {
      console.log(error.message);
    }
  };

  const checkOutAddress = async (req, res) => {
    try {
      const userId = res.locals.user._id;
      const name = req.body.name;
      const mobileNumber = req.body.mno;
      const address = req.body.address;
      const locality = req.body.locality;
      const city = req.body.city;
      const pincode = req.body.pincode;
      const state = req.body.state;
  
      // Create a new address object
      const newAddress = {
        name: name,
        mobileNumber: mobileNumber,
        address: address,
        locality: locality,
        city: city,
        pincode: pincode,
        state: state,
      };
  
      const updatedUser = await profileHelper.updateAddress(userId, newAddress);
      if (!updatedUser) {
        // No matching document found, create a new one
        await profileHelper.createAddress(userId, newAddress);
      }
  
      // res.json({ message: "Address saved successfully!" });
  
      res.redirect("/checkOut"); // Redirect to the profile page after saving the address
    } catch (error) {
      console.log(error.message);
    }
  };

  const profileDetails = async (req, res) => {
    try {
      const id = res.locals.user._id;
      const user = await User.findOne({ _id: id });  
      res.render("profileDetails", { user });
    } catch (error) {
      console.log(error.message);
    }
  };

  //profile Order List

  const profileOrderList  = async(req,res)=>{
    try {
      const user  = res.locals.user
      // const order = await Order.findOne({user:user._id})
      const orders = await Order.aggregate([
        {$match:{user:user._id}},
        { $unwind: "$orders" },
        { $sort: { "orders.createdAt": -1 } },
      ])
      res.render('profileOrderList',{orders})
  
      
     
    } catch (error) {
      console.log(error.message);
      
    }
  }

  const profileAdress = async (req, res) => {
    try {
      let arr = []
      const user = res.locals.user;
      const address = await Address.find({user:user._id.toString()});
      if(address){
        const ad = address.forEach((x) => {
          return (arr = x.addresses);
        });
        res.render("profileAdress", { user, arr });
      }
      
    } catch (error) {
      console.log(error.message);
    }
  };

  
  



  module.exports = {
    profile,
    submitAddress,
    editAddress,
    deleteAddress,
    editInfo,
    editPassword,
    checkOutAddress,
    profileDetails,
    profileOrderList,
    profileAdress,
  
    
  }