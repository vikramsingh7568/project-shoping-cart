const mongoose = require("mongoose");
const cartModel = require("../models/cartModel");
const userModel = require("../models/UserModel");
const productModel = require("../models/productModel");
const {
  isValid,
  isValidId,
  isValidBody,
} = require("../validators/validation");
const createCart = async function (req, res) {
  try {
    let UserId = req.params.userId;

    if (!isValidId(UserId)) {
      return res
        .status(400)
        .send({ status: false, message: "please provide valid user Id" });
    }
    let user = await userModel.findOne({ _id: UserId });
    if (!user) {
      return res.status(400).send({
        status: false,
        message: "this user is not found in user model",
      });
    }

    let data = req.body;

    if (isValidBody(data)) {
      return res
        .status(400)
        .send({ status: false, message: "please provide request body" });
    }

    let { productId, cartId } = data;

    if (!isValidId(productId)) {
      return res
        .status(400)
        .send({ status: false, message: "please provide valid product Id" });
    }

    if (!isValid(cartId) || cartId == "") {
      return res
        .status(400)
        .send({ status: false, message: "cart id cannot be empty" });
    }

    let product = await productModel.findOne({ _id: productId });
    if (!product) {
      return res.status(400).send({
        status: false,
        message: "this product is not found in product model",
      });
    }

    if (product.isDeleted == true) {
      return res
        .status(400)
        .send({ status: false, message: "this product is Deleted " });
    }

    if (!cartId) {
      let checking = await cartModel.findOne({ userId: UserId });
      if (checking) {
        return res.status(409).send({
          status: false,
          message:
            "this user already have a cart please give cart id in request body",
        });
      }
    }

    if (cartId) {
      if (!isValidId(cartId)) {
        return res
          .status(400)
          .send({ status: false, message: "please provide valid Cart Id" });
      }

      let cart = await cartModel.findOne({ _id: cartId });
      if (!cart) {
        return res
          .status(400)
          .send({ status: true, message: "This cart id is not available" });
      }
      let quantity = 1;
      let arr = cart.items;

      let isExist = false;
      for (let i = 0; i < cart.items.length; i++) {
        if (cart.items[i].productId == productId) {
          isExist = true;
          cart.items[i].quantity += quantity;
        }
      }
      if (!isExist) {
        arr.push({ productId: productId, quantity: quantity });
      }

      let price = product.price;
      cart.totalPrice += price * quantity;
      cart.totalItems = arr.length;

      let update = await cartModel.findOneAndUpdate({ _id: cartId }, cart, {
        new: true,
      });

      return res.status(201).send({
        status: true,
        message: "cart created successfully",
        data: update,
      });
    }
    if (!cartId) {
      let obj = {};
      obj.userId = UserId;
      obj.items = [{ productId: productId, quantity: 1 }];
      obj.totalPrice = product.price;
      obj.totalItems = obj.items.length;

      let dataStored = await cartModel.create(obj);

      return res.status(201).send({
        status: true,
        message: "cart created successfully",
        data: dataStored,
      });
    }
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

// update cart api -------------------------------------------------------------------

const updateCart = async function (req, res) {
  try {
    let data = req.body;
    let userId = req.params.userId;

    // check for userId and user
    if (!isValid(userId) || !isValidId(userId))
      return res.status(400).send({ status: false, message: "Invalid userId" });

    let user = await cartModel.findOne({ userId: userId });
    if (!user)
      return res
        .status(400)
        .send({ status: false, message: "User doesn't exist!" });

    let { cartId, productId, removeProduct } = data;

    // check for productId and product validation
    if (!isValid(productId) || !isValidId(productId))
      return res
        .status(400)
        .send({ status: false, message: "Invalid productId" });

    let product = await productModel.findOne({ _id: productId });
    if (!product)
      return res
        .status(400)
        .send({ status: false, message: "Product doesn't exist!" });

    // check for cartId and cart exist
    if (!isValid(cartId) || !isValidId(cartId))
      return res.status(400).send({ status: false, message: "Invalid cartId" });

    let cart = await cartModel.findOne({ _id: cartId });
    if (!cart)
      return res
        .status(400)
        .send({ status: false, message: "Cart doesn't exist!" });

    if (removeProduct) {
      if (![1, 0].includes(removeProduct))
        return res.status(400).send({
          status: false,
          message: "Invalid value for removeProduct, it can be only 0 or 1!",
        });
    }

    let items = cart.items.filter(
      (product) => product["productId"].toString() === productId
    );

    if (items.length == 0)
      return res.status(400).send({
        status: false,
        message: `No product with ${productId} exists in cart`,
      });


    for (let i = 0; i < items.length; i++) {
      if (items[i].productId == productId) {
        let totalProductprice = items[i].quantity * product.price;
        if (removeProduct === 0) {
          const updateProductItem = await cartModel.findOneAndUpdate(
            { _id: cartId },
            {
              $pull: { items: { productId: productId } },
              totalPrice: cart.totalPrice - totalProductprice,
              totalItems: cart.totalItems - 1,
            },
            { new: true }
          );
          return res
            .status(200)
            .send({
              status: true,
              msg: "sucessfully removed product",
              data: updateProductItem,
            });
        }
        if (removeProduct === 1) {
          if (items[i].quantity === 1 && removeProduct === 1) {
            const removeCart = await cartModel.findOneAndUpdate(
              { _id: cartId },
              {
                $pull: { items: { productId: productId } },
                totalPrice: cart.totalPrice - totalProductprice,
                totalItems: cart.totalItems - 1,
              },
              { new: true }
            );
            return res
              .status(200)
              .send({
                status: true,
                msg: "sucessfully removed product or cart is empty",
                data: removeCart,
              });
          }
          items[i].quantity = items[i].quantity - 1;
          const updateCart = await cartModel.findByIdAndUpdate(
            { _id: cartId },
            { items: items, totalPrice: cart.totalPrice - product.price },
            { new: true }
          );
          return res
            .status(200)
            .send({
              status: true,
              msg: "sucessfully decress product",
              data: updateCart,
            });
        }
      }
    }
   
  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};

const getCartDetails = async function (req, res) {
  try {
    let userId = req.params.userId;

    //checking if the cart exist with this userId or not
    let findCart = await cartModel
      .findOne({ userId: userId })
      .populate("items.productId");
    if (!findCart)
      return res
        .status(404)
        .send({ status: false, message: `No cart found with given userId` });

    res.status(200).send({ status: true, message: "Success", data: findCart });
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};

const deleteCart = async function (req, res) {
  try {
    //fetch userid fron params
    const userId = req.params.userId;
    if (!isValidId(userId)) {
      return res.status(400).send({ status: false, msg: "invalid userId" });
    }

    const checkUser = await userModel.findOne({ _id: userId });
    if (!checkUser) {
      return res.satus(404).send({ status: false, msg: "User doesn't esxist" });
    }
    //fetch cart docment from db by userid
    const checkCart = await cartModel.find({ userId: userId });
    if (!checkCart) {
      return res.status(404).send({ sttaus: false, msg: "cart doesn't exist" });
    }
    const deleteCart = await cartModel.findOneAndUpdate(
      { userId: userId },
      { $set: { items: [], totalPrice: 0, totalItems: 0 } },
      { new: true }
    );
    return res
      .status(204)
      .send({ status: true, message: "cart deleted", data: deleteCart });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, msg: error.message });
  }
};

module.exports = { createCart, updateCart, getCartDetails, deleteCart };
