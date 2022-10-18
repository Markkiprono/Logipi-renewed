const Product = require("../model/Product");
const asyncWrapper = require("../middleware/async");
const errorHandlerMiddleware = require("../utils/error-handler");
const Features = require("../utils/Features");

const createProduct = asyncWrapper(async (req, res, next) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, product });
});
const getProducts = asyncWrapper(async (req, res, next) => {
  const resultPerPage = 10;
  const features = new Features(Product.find(), req.query)
    .search()
    .filters()
    .pagination(resultPerPage);
  const products = await features.query;
  if (!products) {
    res.send("Error no such files");
  }
  res.status(200).json({ count: products.length, products });
});
const getProduct = asyncWrapper(async (req, res, next) => {
  const { id: productID } = req.params;
  const product = await Product.findOne({ _id: productID });
  if (!product) {
    return next(
      new errorHandlerMiddleware(`No Product with id : ${productID}`, 404)
    );
  }

  res.status(200).json({ success: true, product });
});
const updateProduct = asyncWrapper(async (req, res, next) => {
  const { id: productID } = req.params;

  const product = await Product.findOneAndUpdate({ _id: productID }, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    return next(
      new errorHandlerMiddleware(`No task with id : ${productID}`, 404)
    );
  }

  res.status(200).json({ success: true, product });
});
const deleteProduct = asyncWrapper(async (req, res, next) => {
  const { id: productID } = req.params;
  const product = await Product.findOneAndDelete({ _id: productID });
  if (!product) {
    return next(
      new errorHandlerMiddleware(`No product with id : ${productID}`, 404)
    );
  }
  res.status(200).json({ success: true });
});

// //create new review and update the product rating
const createProductReview = asyncWrapper(async (req, res, next) => {
  const { rating, comment, productId } = req.body;
  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };
  const product = await Product.findById(productId);

  const isReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );
  if (isReviewed) {
    product.reviews.forEach((review) => {
      if (review.user.toString() === req.user._id.toString()) {
        review.comment = comment;
        review.rating = rating;
      }
    }); //if the user has already reviewed the product then we will update the review
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }
  let avg = 0;
  product.reviews.forEach((review) => {
    avg += review.rating;
  });
  product.ratings = avg / product.reviews.length;
  await product.save({ validateBeforeSave: false });
  res.status(200).json({ success: true });
});
//get all reviews of a product

const getSingleProductReviews = asyncWrapper(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  if (!product) {
    return next(
      new errorHandlerMiddleware(`No product with id : ${req.query.id}`, 404)
    );
  }
  res
    .status(200)
    .json({ count: product.reviews.length, reviews: product.reviews });
});

//delete review of a product (admin)
const deleteReview = asyncWrapper(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);
  if (!product) {
    return next(new errorHandlerMiddleware(`No such id`, 404));
  }
  const reviews = product.reviews.filter(
    (review) => review._id.toString() !== req.query.id.toString()
  );
  let avg = 0;
  if (reviews.length === 0) {
    ratings = 0;
  } else {
    ratings = avg / reviews.length;
  }
  const numOfReviews = reviews.length;
  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );
  res.status(200).json({ success: true });
});

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getSingleProductReviews,
  deleteReview,
};
