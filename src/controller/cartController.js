const mongoose = require("mongoose")
const cartModel = require("../models/cartModel")
const userModel = require("../models/UserModel");
const productModel = require("../models/productModel");
const {
    isValid,
    isValidString,
    isValidNumber,
    isValidPrice,
    isValidAvailableSizes,
    isValidId,
  } = require("../validators/validation");
const createCart = async function(req,res){
 try {
       let UserId = req.params.userId
       
       if(!isValidId(UserId)){
        return res.status(400).send({status : false , message : "please provide valid user Id"})
       }
        let user = await userModel.findOne({_id : UserId})
           if(!user){
            return res.status(400).send({status : false , message : "this user is not found in user model"})
           }
        
       let data = req.body
       let {productId,cartId,quantity}= data

       if(!isValidId(productId)){
        return res.status(400).send({status : false , message : "please provide valid product Id"})
       }
       
       let product = await productModel.findOne({_id : productId})
       if(!product){
        return res.status(400).send({status : false , message : "this product is not found in product model"})
       }

       if(product.isDeleted == true){
        return res.status(400).send({status : false , message : "this product is Deleted "})
       }
         
            
    
       if(!cartId){
       let checking = await cartModel.findOne({userId :  UserId})
       if(checking){
        return res.status(409).send({status : false , message : "this user already have a cart please give cart id in request body"})
       }
    }

     
if(cartId){

    if(!isValidId(cartId)){
        return res.status(400).send({status : false , message : "please provide valid Cart Id"})
       }

    let cart = await cartModel.findOne({_id : cartId})
    if(!cart){
     return    res.status(400).send({status : true , message : 'This cart id is not available'})
    }
     quantity = Number(quantity)
  let arr = cart.items
   

   let isExist = false
    for(let i = 0 ; i <cart.items.length; i++){
        if(cart.items[i].productId == productId){
            isExist = true
            cart.items[i].quantity += quantity
        }
    } 
    if(!isExist){
     arr.push({productId : productId,quantity : quantity})
      
    }
       
      let price = product.price
       cart.totalPrice += price*quantity 
       cart.totalItems = arr.length
     
    
     let update = await cartModel.findOneAndUpdate({_id : cartId},cart,{new : true})

     
     return res.status(200).send({status : true ,message : "cart created successfully", data : update})
} 
     if(!cartId){
       let obj = {}
       obj.userId = UserId
       obj.items = [{productId : productId,quantity: quantity}]
       obj.totalPrice = product.price
       obj.totalItems = obj.items.length

       let dataStored = await cartModel.create(obj)

       return  res.status(200).send({status : true , data : dataStored})
     }

    }catch(err){
        return res.status(500).send({status : false , message : err.message})
     }
    }

const updateCart = async function(req,res){
    
}

const getCartDetails = async function(req,res)
    {
}

const deleteCart = async function(req,res){
    try {
        //fetch userid fron params
        const userId = req.params.userId
        if (!isValidId(userId)) {
            return res.status(400).send({ status: false, msg: "invalid userId" })
        }

        const checkUser = await userModel.findOne({ _id: userId })
        if (!checkUser) {
            return res.satus(404).send({ status: false, msg: "User doesn't esxist" })

        }
        //fetch cart docment from db by userid
        const checkCart = await cartModel.find({ userId: userId })
        if (!checkCart) {
            return res.status(404).send({ sttaus: false, msg: "cart doesn't exist" })
        }
        const deleteCart = await cartModel.findOneAndUpdate({ userId: userId }, { $set: { items: [], totalPrice: 0, totalItems: 0 } }, { new: true })
        return res.status(204).send({ status: true, message: "cart deleted", data: deleteCart })
    }
    catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, msg: error.message })
    }
}

module.exports = {createCart, updateCart, getCartDetails, deleteCart}