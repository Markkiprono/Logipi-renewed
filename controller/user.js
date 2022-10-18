const User = require("../model/user");
const asyncWrapper = require("../middleware/async");
const errorHandlerMiddleware = require("../utils/error-handler");
const jwt = require("jsonwebtoken");
const sendToken = require("../utils/jwtToken");
const sendMail = require("../utils/sendMail");
const crypto = require("crypto");
//Register a new user

const registerUser = asyncWrapper(async (req, res, next) => {
  const { name, email, password } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: "avatars/1",
      url: "https://res.cloudinary.com/dxqjyqz8p/image/upload/v1620000000/avatars/1.jpg",
    },
  });
  sendToken(user, 200, res);
});

//Login user
const loginUser = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new errorHandlerMiddleware("All Fields must be filled", 400));
  }
  const user = await User.findOne({ email });
  if (!user) {
    return next(new errorHandlerMiddleware("Invalid email", 401));
  }
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new errorHandlerMiddleware("Invalid email or password", 401));
  }
  sendToken(user, 200, res);
});

//Logout user
const logoutUser = asyncWrapper(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "Logged out",
  });
});
const forgotPassword = asyncWrapper(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new errorHandlerMiddleware("User not found with this email", 404)
    );
  }
  const resetToken = user.getResetToken();
  await user.save({
    validateBeforeSave: false,
  });
  const resetPasswordURL = `${req.protocol}://${req.get(
    "host"
  )}/password/reset/${resetToken}`;

  const message = `your password reset token is :- \n\n ${resetPasswordURL}`;

  try {
    await sendMail({
      email: user.email,
      subject: "Logipi password Recovery",
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} succesfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordTime = undefined;

    await user.save({
      validateBeforeSave: false,
    });
    return next(new errorHandlerMiddleware(error.message));
  }
});

//reset Password
const resetPassword = asyncWrapper(async (req, res, next) => {
  //create Token hash
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordTime: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new errorHandlerMiddleware(
        "Password reset token is invalid or has been expired",
        400
      )
    );
  }
  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new errorHandlerMiddleware(
        "Password does not match. Please Try again",
        400
      )
    );
  }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordTime = undefined;

  await user.save();
  sendToken(user, 200, res);
});

//Get currently logged in user details
const getUserProfile = asyncWrapper(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    user,
  });
});

//update User Password
const updatePassword = asyncWrapper(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new errorHandlerMiddleware("Old password is incorrect", 400));
  }
  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(
      new errorHandlerMiddleware(
        "Password does not match. Please Try again",
        400
      )
    );
  }
  user.password = req.body.newPassword;
  await user.save();

  sendToken(user, 200, res);
});
const updateProfile = asyncWrapper(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };
  //we add cloudinary letter then we are giving a condition that if the user has uploaded a new image then we will update the image avatar

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
  });
});
//get all users (admin)
const allUsers = asyncWrapper(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    success: true,
    count: users.length,
    users,
  });
});

//get user details (admin)
const getUserDetails = asyncWrapper(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new errorHandlerMiddleware("User not found", 404));
  }
  res.status(200).json({
    success: true,

    user,
  });
});

// delete user (admin)
const deleteUser = asyncWrapper(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new errorHandlerMiddleware("User not found", 404));
  }
  await user.remove();
  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updatePassword,
  updateProfile,
  allUsers,
  getUserDetails,
  deleteUser,
};
