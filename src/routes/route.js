const express = require('express')
const router = express.Router();
const {createUser,loginUser} = require("../controller/UserController")
//const{loginUser}=require("../controller/login")

router.post("/register",createUser)
router.post("/login",loginUser)



module.exports=router