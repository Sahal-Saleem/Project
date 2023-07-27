const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    name:{type:String},
    proId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    message: { type: String, required: true },
  });

  const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;