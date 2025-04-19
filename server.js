let app=require("./app");
let mongoose=require("mongoose");
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
mongoose.connect("mongodb://localhost:27017/loginDetails1")
.then(()=>{
    console.log("database connected successfully");
});

app.listen(3000, (req, res) => {
    console.log("server has successfully sarted");
  });