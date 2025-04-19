const User = require("../Models/userModel");
const asyncErrorHandler = require("../Utils/asyncErrorHandler");
const errorHandler = require("../Utils/asyncErrorHandler");
const customError = require("../Utils/customError");
const jwt = require("jsonwebtoken");
const util = require("util");
const sendMail = require("../Utils/email");
const crypto = require("crypto");

const tokenSet = (id) => {
  return jwt.sign({ id }, "1234-63213-4321-76543", {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const createSendResponse = (user, statusCode, res) => {
    const token = tokenSet(user._id);
    const options={
        maxAge:process.env.JWT_COOKIE_EXPIRES_IN,
        httpOnly:true,
        secure:true
    }
    res.cookie("jwt",token,options);
    user.password=undefined;
    res.status(statusCode).json({
        token,
        status: "success",
        data: {
        user,
        },
    });
}
exports.signUp = errorHandler(async (req, res, next) => {
  const newUser = await User.create(req.body);
//   const token = tokenSet(newUser._id);
//   res.status(201).json({
//     token,
//     status: "success",
//     data: {
//       user: newUser,
//     },
//   });
createSendResponse(newUser, 201, res);
});

exports.login = errorHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    const error = new customError("Please provide email and password", 400);
    return next(error);
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(new customError("Invalid email or password", 401));
  }
//   const token = tokenSet(user._id);
//   res.status(200).json({
//     token,
//     status: "success",
//     data: {
//       user,
//     },
//   });
createSendResponse(user, 200, res);
});

exports.protect = errorHandler(async (req, res, next) => {
  //1.read the token and check if it exists
  let testToken = req.headers.authorization;
  let token;
  if (testToken && testToken.startsWith("Bearer")) {
    token = testToken = testToken.split(" ")[1];
  }
  console.log(token);
  if (!token) {
    next(new customError("You are not logged in", 401));
  }

  //2.validate the token
  const decoded = await util.promisify(jwt.verify)(
    token,
    "1234-63213-4321-76543"
  );
  console.log(decoded);
  //3.if user exists
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new customError("User does not exist", 401));
  }
  //4.if user changed password after token was issued
  if (await user.isPasswordChanged(decoded.iat)) {
    return next(new customError("User recently changed password", 401));
  }
  //5.grant access to protected route
  req.user = user;
  next();
});

exports.restrict = (role) => {
  return (req, res, next) => {
    if (req.user.role != role) {
      return next(new customError("You do not have permission to delete", 403));
    }
    next();
  };
};

exports.forgotPassword = asyncErrorHandler(async (req, res, next) => {
  //1.get the user form db
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new customError("User does not exist", 404));
  }
  //2.generate random reset token
  const resetToken = await user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  //3.send back to user email
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `password reset request use below link to reset password link is valid for 10 minutes\n\n ${resetUrl}`;
  try {
    await sendMail({
      email: user.email,
      subject: "Password reset token",
      message: message,
    });
    res.status(200).json({
      status: "success",
      message: "Token sent to email",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new customError("Email could not be sent", 500));
  }
});

exports.resetPassword = asyncErrorHandler(async (req, res, next) => {
  //1.checking user exists with the token and password
  const token = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new customError("Token is invalid or expired", 400));
  }
  //2.change and update the password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.passwordChangedAt = Date.now();
  user.save();

  //3.send token to user
  const jwtToken = tokenSet(user._id);
  res.status(200).json({
    jwtToken,
    status: "success",
    message: "password reset successful",
  });
});
