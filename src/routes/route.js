const express = require('express')
const router = express.Router();
const {createUser,loginUser, userDetails , updateUser} = require("../controller/UserController")
const { createProduct, getByFilter,getById,deleteProduct, updateProduct } =  require("../controller/ProductController")
const {createCart ,updateCart,getCartDetails,deleteCart} = require("../controller/cartController")
const {authorise, authenticate}= require("../middlewares/auth")
const  {createOrder,updateOrder} = require('../controller/orderController')


//user creation part
router.post("/register",createUser)
router.post("/login",loginUser)
router.get("/user/:userId/profile",authenticate, userDetails)
router.put("/user/:userId/profile",authenticate, authorise, updateUser )

//product creation part 
router.post("/products",createProduct)
router.get("/productss", getByFilter)
router.get("/products/:productId",getById)
router.put("/products/:product_id",updateProduct)
router.delete("/products/:productId",deleteProduct)

// cart creation part 


router.post( "/users/:userId/cart",authenticate,authorise,createCart)
router.put( "/users/:userId/cart",authenticate,authorise,updateCart)
router.get("/users/:userId/cart",authenticate,authorise,getCartDetails)
router.delete("/users/:userId/cart",authenticate,authorise,deleteCart)


//----------------------------OrderCreate------------------------------//

router.post("/users/:userId/orders",authenticate,authorise,createOrder)
router.put("/users/:userId/orders", authenticate,authorise,updateOrder)





module.exports=router 