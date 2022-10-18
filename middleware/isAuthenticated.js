const errorHandlerMiddleware = require("../utils/error-handler");
const asyncWrapper = require("./async");
const jwt = require("jsonwebtoken");
const User = require("../model/user");

//Check if user is authenticated or not
const isAuthenticatedUser = asyncWrapper(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(
      new errorHandlerMiddleware("Login first to access this resource", 401)
    );
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.id);
  next();
});
//Handling Admin roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new errorHandlerMiddleware(
          `Role (${req.user.role}) is not allowed to access this resource`,
          403
        )
      );
    }
    next();
  };
};
module.exports = { isAuthenticatedUser, authorizeRoles };
