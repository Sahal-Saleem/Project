const wishListHelper = require('../helpers/wishListHelper')
const cartHelper = require('../helpers/cartHelper')

const getWishList = async (req, res) => {
    let user = res.locals.user;
    let count = await cartHelper.getCartCount(user._id);
    const wishlistCount = await wishListHelper.getWishListCount(user._id);
    wishListHelper.getWishListProducts(user._id).then((wishlistProducts) => {

      res.render("wishList", {
        user,
        count,
        wishlistProducts,
        wishlistCount,
      });
    });
  }

  const addWishList = async (req, res) => {
    let proId = req.body.proId;
    let userId = res.locals.user._id;
    wishListHelper.addWishList(userId, proId).then((response) => {
      res.send(response);
    });
  }

  const removeProductWishlist = async (req, res) => {
    let proId = req.body.proId;
    let wishListId = req.body.wishListId;
    wishListHelper
      .removeProductWishlist(proId, wishListId)
      .then((response) => {
        res.send(response);
      });
  }

  module.exports = {
    getWishList,
    addWishList,
    removeProductWishlist


  }