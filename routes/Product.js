const express = require("express");
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getSingleProductReviews,
  deleteReview,
} = require("../controller/Product");
const {
  isAuthenticatedUser,
  authorizeRoles,
} = require("../middleware/isAuthenticated");

router
  .route("/items")
  .post(isAuthenticatedUser, authorizeRoles("admin"), createProduct)
  .get(getProducts);
router
  .route("/items/:id")
  .get(getProduct)
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateProduct)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteProduct);
router.route("/items/review").post(isAuthenticatedUser, createProductReview);
router
  .route("/reviews")
  .get(getSingleProductReviews)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteReview);
module.exports = router;
