const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModel');
require('dotenv').config();

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwtAdmin;

  // check json web token exists & is verified
  if (token) {
    jwt.verify(token, 'MY_SECRET', (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.redirect('/admin');
      } else {
        next();
      }
    });
  } else {
    res.redirect('/admin');
  }
};

// check current user
const checkUser = (req, res, next) => {
  const token = req.cookies.jwtAdmin;
  if (token) {
    jwt.verify(token, 'MY_SECRET', async (err, decodedToken) => {
      if (err) {
        res.locals.admin = null;
        next();
      } else {
        const admin = await Admin.findById(decodedToken.id);
        res.locals.admin = admin;
        next();
      }
    });
  } else {
    res.locals.admin = null;
    next();
  }
};


module.exports = { requireAuth, checkUser };