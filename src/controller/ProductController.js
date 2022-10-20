const mongoose = require("mongoose");
const { uploadFile } = require("../validators/aws");
const productModel = require("../models/productModel");
const {
  isValid,
  isValidString,
  isValidWords,
  isValidNumber,
  isValidPrice,
  isValidAvailableSizes,
  isValidId,
  isValidFile
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
    if (!title)
      return res.status(400).send({
        status: false,
        message: "Product title is required",
      });

    if (!isValid(title) || !isValidWords(title))
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
    if (!description)
      return res.status(400).send({
        status: false,
        message: "Product description is required",
      });
    if (!isValid(description))
      return res.status(400).send({
        status: false,
        message:
          "Product description is required and should not be an empty string",
      });

    // price validation
    if (!price)
      return res.status(400).send({
        status: false,
        message: "Product price is required",
      });
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
    if (!currencyId)
      return res.status(400).send({
        status: false,
        message: "currencyId is required",
      });
    if (!isValid(currencyId))
      return res.status(400).send({
        status: false,
        message: "currencyId is required and should not be an empty string",
      });

    if (currencyId != "INR") {
      return res
        .status(400)
        .send({ status: false, message: "currencyId should be INR" });
    }

    // currencyFormat validation
    if (!currencyFormat)
      return res.status(400).send({
        status: false,
        message: "currencyFormat is required",
      });
    if (!isValid(currencyFormat))
      return res.status(400).send({
        status: false,
        message: "currencyFormat is required and should not be an empty string",
      });
    if (currencyFormat != "₹")
      return res
        .status(400)
        .send({ status: false, message: "currency format should be ₹ " });

    // availableSizes validation
    if (availableSizes || availableSizes == "") {
      availableSizes = availableSizes
        .toUpperCase()
        .split(",")
        .map((x) => x.trim());
      data.availableSizes = availableSizes;
      if (!isValidAvailableSizes(availableSizes))
        return res.status(400).send({
          status: false,
          message: `availableSizes should be S, XS, M, X, L, XXL, XL only`,
        });
    }

    // style validation
    if (style) {
      if (!isValid(style) || !isValidWords(style))
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

    //aws s3 profileImage upload
    let files = req.files;
    if (files && files.length > 0) {
      if (!isValidFile(files[0].originalname))
      return res.status(400).send({ status: false, message: `Enter format jpeg/jpg/png only.` })

      let fileUploaded = await uploadFile(files[0]);
    data.productImage = fileUploaded;
    }
    else {
      return res.status(400).send({ message: "No file found" })
    }

    // if (!(files && files.length)) {
    //   return res.status(400).send({
    //     status: false,
    //     message: "Found Error in Uploading files...",
    //   });
    // }
    // let fileUploaded = await uploadFile(files[0]);
    // data.productImage = fileUploaded;

    let product = await productModel.create(data);
    return res.status(201).send({
      status: true,
      message: "Success",
      data: product,
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

//===========get product details by queries==============================//

const getByFilter = async (req, res) => {
  try {
    let data = req.query;
    let conditions = { isDeleted: false };

    //checking for any queries
    if (!isValid(data)) {
      //getting the products
      let getProducts = await productModel.find(conditions).sort({ price: 1 });
      if (getProducts.length == 0)
        return res
          .status(404)
          .send({ status: false, message: "No products found" });

      return res.status(200).send({
        status: true,
        count: getProducts.length,
        message: "Success",
        data: getProducts,
      });
    }

    //validating the filter - SIZE
    if (data.size) {
      data.size = data.size.toUpperCase();
      if (!isValid(data.size))
        return res.status(400).send({
          status: false,
          message: "Enter a valid value for size and remove spaces",
        });

      conditions.availableSizes = {};
      conditions.availableSizes["$in"] = [data.size];
    }

    //validating the filter - NAME
    if (data.name || typeof data.name == "string") {
      if (!isValid(data.name))
        return res.status(400).send({
          status: false,
          message: "Enter a valid value for product name and remove spaces",
        });

      //using $regex to match the names of products & "i" for case insensitive.
      conditions.title = {};
      conditions.title["$regex"] = data.name;
      conditions.title["$options"] = "i";
    }

    //validating the filter - PRICEGREATERTHAN
    if (data.priceGreaterThan) {
      if (!isValidString(data.priceGreaterThan))
        return res.status(400).send({
          status: false,
          message: "Price of product should be in numbers",
        });

      data.priceGreaterThan = JSON.parse(data.priceGreaterThan);
      if (isValidNumber(data.priceGreaterThan))
        return res
          .status(400)
          .send({ status: false, message: "Price of product should be valid" });

      if (!conditions.price) {
        conditions.price = {};
      }
      conditions.price["$gte"] = data.priceGreaterThan;
    }

    //validating the filter - PRICELESSTHAN
    if (data.priceLessThan) {
      if (!isValidString(data.priceLessThan))
        return res.status(400).send({
          status: false,
          message: "Price of product should be in numbers",
        });

      data.priceLessThan = JSON.parse(data.priceLessThan);
      if (isValidNumber(data.priceLessThan))
        return res
          .status(400)
          .send({ status: false, message: "Price of product should be valid" });

      if (!conditions.price) {
        conditions.price = {};
      }
      conditions.price["$lte"] = data.priceLessThan;
    }

    //get the products with the condition provided
    let getFilterData = await productModel.find(conditions).sort({ price: 1 });
    if (getFilterData.length == 0)
      return res
        .status(404)
        .send({ status: false, message: "No products found" });

    res.status(200).send({
      status: true,
      count: getFilterData.length,
      message: "Success",
      data: getFilterData,
    });
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};

/////////---------------------Get By Id----------------//////////

const getById = async function (req, res) {
  let productId = req.params.productId;
  if (!isValidId(productId)) {
    return res
      .status(400)
      .send({ status: false, message: "please enter Valid productId ! " });
  }

  let product = await productModel.findOne({ _id: productId });
  if (!product) {
    return res.status(404).send({
      status: false,
      message: "this product id is not found in product collection ",
    });
  }
  if (product.isDeleted == true) {
    return res
      .status(400)
      .send({ status: false, message: "this product is deleted " });
  }

  return res
    .status(200)
    .send({ status: true, message: "Success", data: product });
};
///////////---------------------Update Product-----------------///////////

const updateProduct = async function (req, res) {
  try {
    let requestData = req.body;
    let productId = req.params.product_id;
    if (Object.keys(req.body).length == 0)
      return res
        .status(400)
        .send({
          status: false,
          message: "Please Enter Product Details For Updating",
        });

    if (!productId) {
      return res
        .status(400)
        .send({ status: false, message: "Productid must be present" });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res
        .status(400)
        .send({ status: false, message: `this  Product Id is not a valid Id` });
    }
    const {
      title,
      description,
      price,
      isFreeShipping,
      style,
      availableSizes,
      installments,
      productImage,
    } = requestData;
    // creating an empty object
    const updates = { $set: {} };

    const ProductInformation = await productModel.findOne({ _id: productId });
    if (!ProductInformation) {
      return res
        .status(404)
        .send({ status: false, msg: "no Product found with this ProductId" });
    }
    ////------------------------------////---------------------------////-----------------------////
    if (title) {
      if (!isValid(title)) {
        return res
          .status(400)
          .send({ status: false, message: "Invalid title" });
      }
      const notUniqueTitle = await productModel.findOne({ title: title });
      if (notUniqueTitle) {
        return res
          .status(400)
          .send({ status: false, message: "Product title already exist" });
      }

      updates["$set"]["title"] = title.trim();
      console.log(updates);
    }

    // if request body has key name "description" then after validating its value, same is added to updates object

    if (description) {
      if (!isValid(description)) {
        return res
          .status(400)
          .send({ status: false, message: "Invalid description" });
      }

      updates["$set"]["description"] = description.trim();
    }

    // const updatedProduct = await productModel.findOneAndUpdate({ _id: productId }, updates, { new: true });

    // return res.status(200).send({ status: true, message: "Product data updated successfully", data: updatedProduct });

    // if request body has key name "price" then after validating its value, same is added to updates object
    if (price) {
      if (!isValidPrice(price)) {
        return res
          .status(400)
          .send({ status: false, message: "Invalid price" });
      }

      updates["$set"]["price"] = price;
    }

    //const updatedProduct = await productModel.findOneAndUpdate({ _id: productId }, updates, { new: true });

    //return res.status(200).send({ status: true, message: "Product data updated successfully", data: updatedProduct });

    // if request body has key name "isFreeShipping" then after validating its value, same is added to updates object

    if (isFreeShipping) {
      if (["true", "false"].includes(isFreeShipping) === false) {
        return res
          .status(400)
          .send({ status: false, message: "isFreeShipping should be boolean" });
      }
      updates["$set"]["isFreeShipping"] = isFreeShipping;
    }

    // const updatedProduct = await productModel.findOneAndUpdate({ _id: productId }, updates, { new: true });

    // return res.status(200).send({ status: true, message: "Product data updated successfully", data: updatedProduct });

    //---- if request body has key name "style" then after validating its value, same is added to updates object
    if (style) {
      if (!isValid(style)) {
        return res
          .status(400)
          .send({ status: false, message: "Invalid style" });
      }
      updates["$set"]["style"] = style;
    }

    //const updatedProduct = await productModel.findOneAndUpdate({ _id: productId }, updates, { new: true });

    //return res.status(200).send({ status: true, message: "Product data updated successfully", data: updatedProduct });

    if (availableSizes) {
      if (typeof (availableSizes == "string")) {
        if (!isValidAvailableSizes(availableSizes)) {
          return res
            .status(400)
            .send({
              status: false,
              message: "Invalid format of availableSizes",
            });
        }
        let availableSize = ["S", "XS", "M", "X", "L", "XXL", "XL"];
        for (let i = 0; i < availableSize.length; i++) {
          if (availableSizes == availableSize[i]) {
            continue;
          }
        }
      } else {
        return res
          .status(400)
          .send({
            status: false,
            message: `avilablesize is ["S", "XS", "M", "X", "L", "XXL", "XL"] select size from avilablesize`,
          });
      }
      // }
      console.log("hi", updates);

      let availableArray = ProductInformation.availableSizes;
      for (let i = 0; i < availableArray.length; i++) {
        if (availableSizes == availableArray[i]) {
          return res
            .status(409)
            .send({
              status: false,
              message: "This Size is allready Available",
            });
        }
      }
      availableArray.push(availableSizes);
      updates["$set"]["availableSizes"] = availableArray;
    }

    if (installments) {
      if (!isValid(installments)) {
        return res
          .status(400)
          .send({ status: false, message: "invalid installments" });
      }
      updates["$set"]["installments"] = Number(installments);
    }

    // if request body has key name "image" then after validating its value, same is added to updates object

    let imageone = req.files;
    if (productImage) {
      if (!(imageone && imageone.length)) {
        return res.status(400).send({
          status: false,
          message: "Found Error in Uploading files...",
        });
      }
      let fileUploaded = await uploadFile(imageone[0]);
      updates.productImage = fileUploaded;
    }

    if (Object.keys(updates["$set"]).length === 0) {
      return res.json("nothing is updated");
    }
    //------------ updating product data of given ID by passing updates object----------//
    const updatedProduct = await productModel.findOneAndUpdate(
      { _id: productId },
      updates,
      { new: true }
    );

    return res
      .status(200)
      .send({
        status: true,
        message: "Product data updated successfully",
        data: updatedProduct,
      });
  } catch (error) {
    return res.status(400).send({ status: false, message: error });
  }
};

//=======================delete product by id=============================//

const deleteProduct = async function (req, res) {
  try {
    let id = req.params.productId;

    if (!isValidId(id)) {
      return res
        .status(400)
        .send({ status: false, message: "productId is Invalid" });
    }

    let product = await productModel.findOne({ _id: id });
    if (!product) {
      return res.status(404).send({
        status: false,
        message: "No Product found with given Product Id",
      });
    }

    if (product.isDeleted === true) {
      return res.status(200).send({
        status: true,
        message: "Product with given Id is Already Deleted",
      });
    }

    let deleteProduct = await productModel.updateOne(
      { _id: id },
      { isDeleted: true, deletedAt: Date.now() }
    );
    res
      .status(201)
      .send({ status: true, message: "Successfully deleted the product" });
  } catch (error) {
    res.status(500).send({ status: false, Error: err.message });
  }
};

module.exports = {
  createProduct,
  getByFilter,
  getById,
  updateProduct,
  deleteProduct,
};
