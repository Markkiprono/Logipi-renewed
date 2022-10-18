const Order = require("../model/order");
const asyncWrapper = require("../middleware/async");
const errorHandlerMiddleware = require("../utils/error-handler");
const Product = require("../model/Product");

//create new order
const createOrder = asyncWrapper(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    shippingPrice,
    totalPrice,
  } = req.body;
  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    shippingPrice,
    totalPrice,
    paidAt: Date.now(),
    user: req.user._id,
  });
  res.status(201).json({ success: true, order });
});

//get single order
const getOrder = asyncWrapper(async (req, res, next) => {
  const { id: orderID } = req.params;
  const order = await Order.findById(orderID).populate("user", "name email");
  if (!order) {
    return next(new errorHandlerMiddleware(`No such order `, 404));
  }
  res.status(200).json({ success: true, order });
});

//get all orders
const getOrders = asyncWrapper(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });
  res.status(200).json({ success: true, count: orders.length, orders });
});

//get all orders (admin)

const getAllOrders = asyncWrapper(async (req, res, next) => {
  const orders = await Order.find();
  let totalAmount = 0;
  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });
  res
    .status(200)
    .json({ success: true, totalAmount, count: orders.length, orders });
});

//update order status (admin)
const updateOrder = asyncWrapper(async (req, res, next) => {
  const { id: orderID } = req.params;
  const order = await Order.findById(orderID);
  if (!order) {
    return next(new errorHandlerMiddleware(`No such order `, 404));
  }
  if (order.orderStatus === "Delivered") {
    return next(
      new errorHandlerMiddleware(`You have already delivered this order`, 400)
    );
  }
  order.orderItems.forEach(async (item) => {
    await updateStock(item.product, item.quantity);
  });
  order.orderStatus = req.body.status;
  if (req.body.status === "Delivered") {
    order.deliveredAt = Date.now();
  }
  await order.save();
  res.status(200).json({ success: true });
});
async function updateStock(id, quantity) {
  const product = await Product.findById(id);
  product.stock = product.stock - quantity;
  await product.save({ validateBeforeSave: false });
}

//delete order (admin)
const deleteOrder = asyncWrapper(async (req, res, next) => {
  const { id: orderID } = req.params;
  const order = await Order.findById(orderID);
  if (!order) {
    return next(new errorHandlerMiddleware(`No such order `, 404));
  }
  await order.remove();
  res.status(200).json({ success: true });
});

module.exports = {
  createOrder,
  getOrder,
  getOrders,
  getAllOrders,
  updateOrder,
  deleteOrder,
};
