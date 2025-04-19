const express=require("express");
const authController=require("../controllers/authController");

const router=express.Router();

router.route("/signUp").post(authController.signUp);
router.route("/login").post(authController.login);
router.route("/forgotPassword").post(authController.forgotPassword);
router.route("/resetPassword/:token").patch(authController.resetPassword);
module.exports=router;