let express=require("express");
let fs = require("fs");
let movies = JSON.parse(fs.readFileSync("./data/movies.json"));

exports.getMovies= (req, res) => {
    res.status(200).json({
      status: "success",
      loggedTime:req.logTime,
      data: {
        count: movies.length,
        moviesData: movies,
      },
    });
  }
  
  exports.getMoviesById =  (req, res) => {
    console.log(req.params.id);
    // res.send("get movies by id");
    //never give the url as /get/movies/v1/movies/:2
    //give ur like this /get/movies/v1/movies/2
    let id = req.params.id;
    // console.log(id);
    let moviewithId = movies.find((mv) => mv.id === id);
    // console.log(moviewithId);
    if (!moviewithId) {
      return res.status(404).json({
        status: "failed",
        message: "movie with this " + id + " is not found",
      });
    }
    res.status(200).json({
      status: "success",
      data: {
        movie: moviewithId,
      },
    });
  };
  exports.updatedMovie=(req, res) => {
    let id=req.params.id;
    let movieData=movies.find(mv=>mv.id===id);
    if(!movieData){
      return res.status(404).json({
        status:"failed",
        message:"movie with this "+id+" is not found"
      })
    }
    let index=movies.indexOf(movieData);
    Object.assign(movieData,req.body);
    movies[index]=movieData;
    fs.writeFile("../data/movies.json",JSON.stringify(movies),(err)=>{
        res.status(200).json({
          status:"success",
          updatedMovie:movieData
        })
    })
  };
  
  exports.postMovies= (req, res) => {
    // console.log(req.body);
    let newId = String(movies.length + 1);
    let newObj = Object.assign({ id: newId }, req.body);
    movies.push(newObj);
    fs.writeFile("../data/movies.json", JSON.stringify(movies), (err) => {
      // console.log(err);
      res.status(201).json({
        status: "success",
        data: {
          movie: newObj,
        },
      });
    });
    // res.send("created");
  };
  
  exports.deleteMovie=(req,res)=>{
    let id=req.params.id;
    let movieData=movies.find(mv=>mv.id===id);
    if(!movieData){
      return res.status(404).json({
        status:"failed",
        message:"movie with this "+id+" is not found"
      })
    }
    let index=movies.indexOf(movieData);
    movies.splice(index,1);
    fs.writeFile("./data/movies.json", JSON.stringify(movies), (err) => {
      if (err) {
          console.error("Error writing to file:", err);
          return res.status(500).json({
              status: "error",
              message: "Failed to delete the movie"
          });
      }

      // Send the response after successful file write
      res.status(200).json({
          status: "success",
          message: "movie with this " + id + " is deleted"
      });
  });
}