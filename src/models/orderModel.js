 const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId



 const orderSchema = new mongoose.Schema(
    {
       userId: {
           require:true,
           type:ObjectId,
           ref:'userModel'},//userId, refs to User Model
       items: [{
       productId: {
           require:true,
           type:ObjectId,
           ref:'productModel'},//ObjectId, refs to Product model
       quantity: {type:Number, require:true, default:1}
             }],
       totalPrice: {type:Number, require:[true,"Holds total price of all the items in the cart"]},
       totalItems: {type:Number, require:[true,"Holds total number of items in the cart"]},
       totalQuantity: {type:Number, require:["Holds total number of quantity in the cart"]},
       cancellable: {boolean, default: true},
       status: {type:String, default: 'pending', enum:['pending', 'completed', 'cancled']},
       deletedAt: {type:Date}, 
       isDeleted: {boolean, default: false},
      },{timestamps:true})

      module.exports = mongoose.Model('order',orderSchema);