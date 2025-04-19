let express=require("express");
let moviesController=require("../controllers/movieController");
let authController=require("../controllers/authController");

let router=express.Router();
router.route("/")
    .get(authController.protect, moviesController.getMovies)
    .post(moviesController.postMovies);


router.route("/:id")
    .get(moviesController.getMoviesById)
    .patch(moviesController.updatedMovie)
    .delete(authController.protect,authController.restrict("admin"),moviesController.deleteMovie);

module.exports=router;