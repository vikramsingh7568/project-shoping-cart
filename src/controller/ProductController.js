const mongoose = require("mongoose")


const createProduct = async function (req,res){

}

const getByFilter = async function (req,res){
    
}

const getById = async function (req,res){
    let productId = req.params.productId
    if(isValidId(productId)){
       return  res.status(400).send({status : false , message : "please enter Valid productId ! "})
    }
       
     let product = await productModel.findOne({_id : productId , isDeleted : false})
     if(!product){
       return  res.status(400).send({status : false , message : "this product is deleted "})
     }

      return res.status(200).send({status : true , data : product})

}

const updateProduct = async function (req,res){
    
}

module.exports = {createProduct, getByFilter, getById, updateProduct}