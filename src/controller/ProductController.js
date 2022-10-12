const mongoose = require("mongoose");
const { uploadFile } = require("../validators/aws");
const productModel = require("../models/productModel");
const {
  isValid,
  isValidNumber,
  isValidPrice,
} = require("../validators/validation");

const createProduct = async function (req, res) {
  try {
    let data = req.body;

    let {
      title,
      description,
      price,
      isFreeShipping,
      currencyId,
      currencyFormat,
      style,
      availableSizes,
      installments,
    } = data;

    // tilte validation
    if (isValid(title))
      return res.status(400).send({
        status: false,
        message: "Product title is required and should not be an empty string",
      });

    let uniqueTitle = await productModel.findOne({ title: title });
    if (uniqueTitle)
      return res.status(400).send({
        status: false,
        message: `Title ${title}is already registerd`,
      });

    // description validation
    if (isValid(description))
      return res.status(400).send({
        status: false,
        message:
          "Product description is required and should not be an empty string",
      });

    // price validation
    if (isValidNumber(price) || !isValidPrice(price))
      return res.status(400).send({
        status: false,
        message: "Product price is required and it should be a number",
      });

    // isFreeShipping validation
    if (isFreeShipping) {
      if (["true", "false"].includes(isFreeShipping) === false) {
        return res
          .status(400)
          .send({ status: false, message: "isFreeShipping should be boolean" });
      }
    }

    // currencyId validation
    if (isValid(currencyId))
      return res.status(400).send({
        status: false,
        message: "currencyId is required and should not be an empty string",
      });

    if (currencyId != "INR") {
      return res
        .status(400)
        .send({ status: false, Message: "currencyId should be INR" });
    }

    // currencyFormat validation
    if (isValid(currencyFormat))
      return res.status(400).send({
        status: false,
        message: "currencyFormat is required and should not be an empty string",
      });
    if (currencyFormat != "₹")
      return res
        .status(400)
        .send({ status: false, Message: "cureenccy format shouls be ₹ " });

    let arr = availableSizes.split(",");
    // console.log(arr)

    // console.log(typeof availableSizes);
    for (let i = 0; i < Object.keys(arr).length; i++) {
      let size = arr[i];
      console.log(size);
      if (!Object.values(availableSizes).includes(size))
        return res.status(400).send({
          status: false,
          message: `availableSizes are ["S", "XS", "M", "X", "L", "XXL", "XL"] only!`,
        });
    }

    // style validation
    if (style) {
      if (isValid(style))
        return res.status(400).send({
          status: false,
          message: "style should not be an empty string",
        });
    }

    // installments validation
    if (installments) {
      if (isValidNumber(installments) || !isValidPrice(installments))
        return res.status(400).send({
          status: false,
          message: "Installments should be a Number only",
        });
    }

    // console.log(data);

    //aws s3 profileImage upload
    let files = req.files;
    if (!(files && files.length)) {
      return res.status(400).send({
        status: "false",
        message: "Found Error in Uploading files...",
      });
    }
    let fileUploaded = await uploadFile(files[0]);
    data.productImage = fileUploaded;

    let product = await productModel.create(data);
    return res.status(201).send({
      status: true,
      message: "Product Created successfully",
      data: product,
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const getByFilter = async function (req, res) {};

const getById = async function (req, res) {};

const updateProduct = async function (req, res) {};

module.exports = { createProduct, getByFilter, getById, updateProduct };
