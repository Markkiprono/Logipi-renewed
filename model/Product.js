const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
    unique: true,
    trim: true,
    maxlength: [80, "Name can not be more than 80 characters"],
  },
  description: {
    type: String,
    required: [true, "Please add a description"],
  },
  price: {
    type: Number,
    required: [true, "Please add a price"],
    maxlength: [10, "Name can not be more than 10 characters"],
  },
  stock: {
    type: Number,
    required: [true, "Please add a stock"],
    maxlength: [10, "Name can not be more than 10 characters"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  category: {
    type: String,
    required: [true, "Please add a category"],
  },
  brand: {
    type: String,
    required: [true, "Please add a brand"],
  },
  discount: {
    type: String,
  },
  color: {
    type: String,
  },
  size: {
    type: String,
  },
  ratings: {
    type: Number,
    default: 0,
  },
  numOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
      time: {
        type: Date,
        default: Date.now(),
      },
    },
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
});
module.exports = mongoose.model("Product", ProductSchema);
