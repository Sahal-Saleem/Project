const User = require('../models/userModel')





const loadUsers = async(req,res)=>{
    try {
  const page = parseInt(req.query.page) || 1; // Current page number
  const pageSize = parseInt(req.query.pageSize) || 5; // Number of items per page
  const skip = (page - 1) * pageSize;
  const totalCount = await User.countDocuments({});
  const totalPages = Math.ceil(totalCount / pageSize);
  
  
  
  
      var search = ''
      if(req.query.search){
          search = req.query.search
      }
      const usersData = await User.find({
          $or:[
              {fname:{$regex:'.'+search+'.'}},
              {lname:{$regex:'.'+search+'.'}},
              {email:{$regex:'.'+search+'.'}},
              {mobile:{$regex:'.'+search+'.'}},
          ]
      }).skip(skip)
      .limit(pageSize)
     
      res.render('userList',{user:usersData,page,
          pageSize,
          totalPages}) 
  } catch (error) {
      console.log(error.message);
  }
  }


  
  const blockUser = async(req,res)=>{
    try {
      const id = req.query.id
      await User.findByIdAndUpdate({_id:id},{$set:{is_blocked:true}})
      res.redirect('/admin/users')
    } catch (error) {
      console.log(error)
    }
  }

  const unBlockUser = async(req,res)=>{
    try {
      const id = req.query.id
      await User.findByIdAndUpdate({_id:id},{$set:{is_blocked:false}})
      res.redirect('/admin/users')
    } catch (error) {
      console.log(error.message)
    }
  }

  module.exports = {
    loadUsers,
    blockUser,
    unBlockUser 

}