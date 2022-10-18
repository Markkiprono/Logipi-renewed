const express = require("express");
const router = express.Router();
const {
  isAuthenticatedUser,
  authorizeRoles,
} = require("../middleware/isAuthenticated");

const {
  createOrder,
  getOrder,
  getOrders,
  getAllOrders,
  updateOrder,
  deleteOrder,
} = require("../controller/order");

router.route("/order/new").post(isAuthenticatedUser, createOrder);
router.route("/order/:id").get(isAuthenticatedUser, getOrder);
router.route("/orders/me").get(isAuthenticatedUser, getOrders);
router
  .route("/admin/orders")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAllOrders);
router
  .route("/admin/order/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateOrder)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteOrder);
module.exports = router;
