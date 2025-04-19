let express = require("express");
let app = express();
let fs = require("fs");
let path = require("path");
let morgan = require("morgan");
let movieroutes=require("./Routes/movieroutes");
let authRouter=require("./Routes/authROuter");
let userRouter=require("./Routes/userRoute");
const rateLimit=require("express-rate-limit");
let helmet=require("helmet");
// let pathname=path.join("./data/movies.json")
// console.log(pathname);

// console.log(movies);
let customMiddleware=(req,res,next)=>{
  console.log("middleware is called here");
  next();
}

let limitter=rateLimit({
  max:2,
  windowMs:60*60*1000,
  message:"Too many request from this IP,please try again in an hour"
});
//inorder to attacth req.body to the request object we use "use" method
app.use(express.json());
app.use(customMiddleware);
app.use(morgan("dev"))
app.use((req,res,next)=>{
  req.logTime=new Date().toISOString();
  next();
});

app.use(express.static("./public"));
app.use(helmet());



// //GET -/get/movies
// app.get("/getMovies/v1/movies",getMovies);
// //GET get movies by id
// app.get("/getmovies/v1/movies/:id",getMoviesById);
// //postman://auth/callback?code=3a4c11553324acb58928e6ee44226096ca978b7cc3ec340dfe79c665ddb8af4b
// //PATCH-Patch by id
// app.patch("/patchMovies/v1/movies/:id", updatedMovie);
// //DELETE-delete by id
// app.delete("/deleteMovies/v1/movies/:id",deleteMovie);
// //POST-post/movies
// app.post("/postMovies/v1/movies",postMovies);

// app.route("/getMovies/v1/movies").get(getMovies).post(postMovies);
// app.route("/get/movies/v1/movies/:id").get(getMoviesById).patch(updatedMovie).delete(deleteMovie);

//using express router
app.use("/api",limitter);
app.use("/getMovies/v1/movies",movieroutes);
app.use("/api/v1/auth",authRouter);
app.use("/api/v1/user",userRouter);

module.exports = app;