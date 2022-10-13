const express = require('express')
const router = express.Router();
const {createUser,loginUser, userDetails , updateUser} = require("../controller/UserController")
const { createProduct, getByFilter,getById } =  require("../controller/ProductController")

const {authorise, authenticate}= require("../middlewares/auth")

router.post("/register",createUser)
router.post("/login",loginUser)
router.get("/user/:userId/profile",authenticate, userDetails)
router.put("/user/:userId/profile",updateUser )

router.post("/products",createProduct)
router.get("/products", getByFilter)
router.get("/products/:productId",getById)





module.exports=router 