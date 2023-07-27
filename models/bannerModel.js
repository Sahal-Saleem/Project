const mongoose = require('mongoose')

const details = new mongoose.Schema({

    title: {
        type: String,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
    
      created_at: {
        type: Date,
        default: Date.now,
      },
      updated_at: {
        type: Date,
        default: Date.now,
      },
    
})

module.exports = mongoose.model('banners',details)