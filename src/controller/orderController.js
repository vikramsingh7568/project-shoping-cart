const mongoose = require('mongoose');
const cartModel = require('../models/cartModel');
const orderModel = require('../models/orderModel');
//const ordreModel = require("../models/orderModel")
const {
    isValid,
    isValidString,
    isValidNumber,
    isValidPrice,
    isValidAvailableSizes,
    isValidId,
  } = require("../validators/validation");
  

  const createOrder = async (req, res) => {
    try {
      let data = req.body;
      let UserId = req.params.userId 
     // console.log(data.cartId,UserId)

      if(!data.cartId){
        return res.status(400).send({staus:false,message:"Please Provide CardId"})
      }
      if(!UserId){
        return res.send(400).send({staus:false,message:"Please Provide UserId"})
      }
      if(!isValidId(data.cartId)){
        return res.status(400).send({status:false,message:"CardID is not valid"})

      }if(!isValidId(UserId)){
        return res.status(400).send({status:false,message:"userID is not valid"})
      }
     let cardDetail = await cartModel.findOne({_id:data.cartId})
    //return res.status(201).send({status:true,data:cardDetail})
     if(!cardDetail){
        return res.status(404).send({status:false,message:"Card does not exist"})
     }
     if(cardDetail.userId !=UserId){
        return res.status(400).send({status:false,message:"user not found"})
     }
    let obj={};
    obj.userId= UserId;
    obj.items = cardDetail.items;

    obj.totalPrice=cardDetail.totalPrice;
    obj.totalItems = cardDetail.totalItems;

    let totalQuantity = 0;
   for(let product of cardDetail.items){
    totalQuantity += product.quantity
   }

    obj.totalQuantity = totalQuantity

let crearedata = await orderModel.create(obj);
return res.status(201).send({status:false,data:crearedata})



    return res.status(201).send({status:true,data:cardDetail})

    } catch (err) {
      res.status(500).send({ status: false, error: err.message });
    }
  };
  


module.exports = {createOrder};