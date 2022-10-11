const express = require('express')
const router = express.Router();
const {createUser,loginUser, userDetails} = require("../controller/UserController")
const {authorise, authenticate}= require("../middlewares/auth")
//const{loginUser}=require("../controller/login")

router.post("/register",createUser)
router.post("/login",loginUser)
router.get("/user/:userId/profile",authenticate, userDetails)



module.exports=router