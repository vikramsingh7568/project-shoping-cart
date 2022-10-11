const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const {
  isValid,
  isValidPhone,
  isValidEmail,
  isValidPwd,
  isValidPincode,
} = require("../validators/validation");
const { uploadFile } = require("../validators/aws");

const createUser = async (req, res) => {
  try {
    let data = req.body;
    let address = JSON.parse(req.body.address);
    let { fname, lname, email, phone, password } = data;
    data.address = address;

    if (isValid(fname))
      return res.status(400).send({
        status: false,
        message: "First name is required and should not be an empty string",
      });

    if (isValid(lname))
      return res.status(400).send({
        status: false,
        message: "Last name is required and should not be an empty string",
      });

    if (!email)
      return res
        .status(400)
        .send({ status: false, message: "User email-id is required" });

    if (!phone)
      return res
        .status(400)
        .send({ status: false, message: "User phone number is required" });

    if (!password)
      return res
        .status(400)
        .send({ status: false, message: "Password is required" });

    if (!address)
      return res
        .status(400)
        .send({ status: false, message: "Address is required" });

    if (!address.shipping)
      return res
        .status(400)
        .send({ status: false, message: "shipping is required" });

    if (!address.shipping.street)
      return res
        .status(400)
        .send({ status: false, message: "shipping street is required" });

    if (!address.shipping.city)
      return res
        .status(400)
        .send({ status: false, message: "shipping city is required" });

    if (!address.shipping.pincode)
      return res
        .status(400)
        .send({ status: false, message: "shipping pincode is required" });

    if (!address.billing)
      return res
        .status(400)
        .send({ status: false, message: "billing is required" });

    if (!address.billing.street)
      return res
        .status(400)
        .send({ status: false, message: "billing street is required" });

    if (!address.billing.city)
      return res
        .status(400)
        .send({ status: false, message: "billing is city required" });

    if (!address.billing.pincode)
      return res
        .status(400)
        .send({ status: false, message: "billing pincode is required" });

    if (isValid(address))
      return res.status(400).send({
        status: false,
        message:
          "Address should be in object and must contain shipping and billing addresses",
      });

    if (isValid(address.shipping))
      return res.status(400).send({
        status: false,
        message:
          "Shipping address should be in object and must contain street, city and pincode",
      });

    if (isValid(address.shipping.street))
      return res.status(400).send({
        status: false,
        message:
          "Street is required of shipping address and should not be empty string",
      });

    if (isValid(address.shipping.city))
      return res.status(400).send({
        status: false,
        message:
          "City is required of shipping address and should not be empty string",
      });

    if (!isValidPincode(address.shipping.pincode))
      return res
        .status(400)
        .send({ status: false, message: "Enter a valid pincode" });

    if (isValid(address.billing))
      return res.status(400).send({
        status: false,
        message:
          "Billing address should be in object and must contain street, city and pincode",
      });

    if (isValid(address.billing.street))
      return res.status(400).send({
        status: false,
        message:
          "Street is required of billing address and should not be empty string",
      });

    if (isValid(address.billing.city))
      return res.status(400).send({
        status: false,
        message:
          "City is required of billing address and should not be empty string",
      });

    if (!isValidPincode(address.billing.pincode))
      return res
        .status(400)
        .send({ status: false, message: "Enter a valid pincode" });

    if (!isValidEmail(email))
      return res
        .status(400)
        .send({ status: false, message: "Enter a valid email-id" });

    if (!isValidPhone(phone))
      return res
        .status(400)
        .send({ status: false, message: "Enter a valid phone number" });

    if (!isValidPwd(password))
      return res.status(400).send({
        status: false,
        message:
          "Password should be 8-15 characters long and must contain one of 0-9,A-Z,a-z and special characters",
      });

    let checkEmail = await userModel.findOne({ email: email });
    if (checkEmail)
      return res
        .status(409)
        .send({ status: false, message: "Email already exist" });

    let checkPhone = await userModel.findOne({ phone: phone });
    if (checkPhone)
      return res
        .status(409)
        .send({ status: false, message: "Phone number already exist" });

    //aws s3 profileImage upload
    let files = req.files;
    if (!(files && files.length)) {
      return res
        .status(400)
        .send({ status: "false", msg: "Found Error in Uploading files..." });
    }
    let fileUploaded = await uploadFile(files[0]);

    data.profileImage = fileUploaded;

    //bcrypt password
    data.password = await bcrypt.hash(password, 10);

    let responseData = await userModel.create(data);

    res.status(201).send({
      status: true,
      message: "User created successfully",
      data: responseData,
    });
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};

//---------------------LOGIN-USER-FUNCTION------------------------------//

const loginUser = async function (req, res) {
  try {
    const data = req.body;
    const email = data.email;

    let password = data.password;
    if (Object.keys(data).length == 0) {
      return res
        .status(400)
        .send({ status: false, msg: "Please Enter email and Password" });
    }
    if (!email) {
      return res.status(400).send({ status: false, msg: "Please Enter email" });
    }
    if(!isValidEmail(email)){
        return res.status(400).send({status:false,message:"Email is Invalid"})
    }
    email.toLowerCase();
    if (!password) {
      return res
        .status(400)
        .send({ status: false, msg: "Please Enter password" });
    }
    const user = await userModel.findOne({ email: email });

    if (!user) {
      return res.status(401).send({ status: false, msg: "Invalid User" });
    }
    const tempPassword = user.password;
    const match = await bcrypt.compare(password, tempPassword);

    if (match) {
      let token = await jwt.sign(
        { id: user._id.toString() },
        "FunctionUp-Group-55-aorijhg@#",
        { expiresIn: "2hr" }
      );
      res.header({ "authorisation": token });
      return res
        .status(200)
        .send({
          status: true,
          msg: "User LoggedIn Succesfully",
          data: { userId: user._id, token: token },
        });
    }
    if (!match) {
      return res
        .status(400)
        .send({ status: false, message: "Password Incorrect" });
    }
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
  }
};

module.exports = { createUser, loginUser };
