const asyncErrorHandler = require("../Utils/asyncErrorHandler");
const User=require("../Models/userModel");

exports.getAllUsers=asyncErrorHandler(async (req,res,next)=>{
   const users= await User.find();
    res.status(200).json({
         status:"success",
         data:{
              users
         }
    });
})

const filteredReqObj=(obj,...allowedFields)=>{
    const newObj={};
    Object.keys(obj).forEach(el=>{
        if(allowedFields.includes(el)) newObj[el]=obj[el];
    });
    return newObj;
}


exports.updatePassword=asyncErrorHandler(async (req,res,next)=>{
    //1.get current user data
    const user=await User.findById(req.user.id).select("+password");
    if(!user){
        return next(new customError("User does not exist",404));
    }
    //2.check if the password is correct
    if(!await user.comparePassword(req.body.currentPassword,user.password)){
        return next(new customError("Password is incorrect",401));
    }
     //3.update the password
    user.password=req.body.newPassword;
    user.confirmPassword=req.body.confirmPassword;
    // user.passwordChangedAt=Date.now();
    
    try {
        await user.save(); // Save the updated user document
    } catch (err) {
        console.error("Error saving user:", err);
        return next(new customError("Failed to update password", 500));
    }  

    //4.send token to user and login
    const token=signToken(user._id);
    res.status(200).json({
        token,
        status:"success",
        message:"password updated successfully"
    })
});

exports.updateMe=asyncErrorHandler(async (req,res,next)=>{
    const filteredObj=filteredReqObj(req.body,"email","name");
    const updateUser=await User.findByIdAndUpdate(req.user.id,filteredObj,{
        new:true,
        runValidators:true
    });
    res.status(200).json({
        status:"success",
        message:"User updated successfully"
    });
});

exports.deleteMe=asyncErrorHandler(async (req,res,next)=>{
    await User.findByIdAndUpdate(req.user.id,{active:false});
    res.status(204).json({
        status:"success",
        message:"User deleted successfully"
    });
});