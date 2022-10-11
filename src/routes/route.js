const express = require('express')
const router = express.Router();
const {createUser,loginUser, userDetails} = require("../controller/UserController")
//const{loginUser}=require("../controller/login")

router.post("/register",createUser)
router.post("/login",loginUser)
router.get("/user/:userId/profile",userDetails)



module.exports=router