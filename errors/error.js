const errorHandlerMiddleware = require("../utils/error-handler");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  if (err.name === "CastError") {
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new errorHandlerMiddleware(message, 400);
  }

  //Duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
    err = new errorHandlerMiddleware(message, 400);
  }
  //Wrong JWT error
  if (err.name === "JsonWebTokenError") {
    const message = "URL is invalid. Try Again!!!";
    err = new errorHandlerMiddleware(message, 400);
  }
  //JWT Expired error
  if (err.name === "TokenExpiredError") {
    const message = "URL is expired. Try Again!!!";
    err = new errorHandlerMiddleware(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    error: err.message,
  });
};
