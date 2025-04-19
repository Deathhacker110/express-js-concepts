const mongoose=require("mongoose");
const validator=require("validator");
let bcrypt=require("bcryptjs");
let crypto=require("crypto");
const userSchema=mongoose.Schema({
    name:{
        type:String,
        required:[true,"enter name please"]
    },
    email:{
        type:String,
        required:[true,"enter email please"],
        unique:true,
        lowercase:true,
        validate:[validator.isEmail,"enter valid email"]
    },
    password:{
        type:String,
        required:[true,"enter password please"],
        minlength:8,
        select:false
    },
    confirmPassword:{
        type:String,
        required:[true,"enter confirm password"],
        validate:{
            //only works for save and create method
            validator:function(val){
                return val === this.password;
            },
            message:"passwords are not same"
        }
    },
    active:{
        type:Boolean,
        select:false,
        default:true
    },
    role:{
        type:String,
        enum:["user","admin"],
        default:"user"
    },
    passwordChangedAt:Date,
    passwordResetToken:String,
    passwordResetExpires:Date,

});

userSchema.pre("/^find/",function(next){
    this.find({active:{$ne:false}});
    next();
})

userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next();
    this.password=await bcrypt.hash(this.password,12);
    this.confirmPassword=undefined;
    next();
});

userSchema.pre("save", function (next) {
    if (!this.isModified("password") || this.isNew) return next();
    this.passwordChangedAt = Date.now() - 1000; // Subtract 1 second to account for token issuance delay
    next();
});
userSchema.methods.comparePassword = async function(pswd, pswdDB) {
    return await bcrypt.compare(pswd, pswdDB);
};

userSchema.methods.isPasswordChanged = async function(jwtTime) {
    if(this.passwordChangedAt){
        const passwordChangedAt=parseInt(this.passwordChangedAt.getTime()/1000,10);
        console.log(passwordChangedAt,jwtTime);
        return jwtTime<passwordChangedAt;
    }
    return false;
};

userSchema.methods.createPasswordResetToken = async function() {
    const token=crypto.randomBytes(32).toString("hex");
    this.passwordResetToken=crypto.createHash("sha256").update(token).digest("hex");
    this.passwordResetExpires=Date.now()+10*60*1000;

    console.log(token,this.passwordResetToken);
    return token;
}

const user =mongoose.model("User1",userSchema);
module.exports=user;