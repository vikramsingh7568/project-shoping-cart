const userModel = require("../models/UserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const {
  isValid,
  isValidName,
  isValidPhone,
  isValidEmail,
  isValidPwd,
  isValidPincode,
  isValidId,
  isValidBody
} = require("../validators/validation");

const { uploadFile } = require("../validators/aws");

const createUser = async (req, res) => {
  try {
    let data = req.body;
    let { fname, lname, email, phone, password, address } = data;
   
    if (!isValid(fname) || !isValidName(fname))
      return res.status(400).send({
        status: false,
        message: "First name is required and should not be an empty string",
      });

    if (!isValid(lname) || !isValidName(lname))
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

    if (!isValid(address.shipping.street))
      return res.status(400).send({
        status: false,
        message:
          "Street is required of shipping address and should not be empty string",
      });

    if (!isValid(address.shipping.city))
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

    if (!isValid(address.billing.street))
      return res.status(400).send({
        status: false,
        message:
          "Street is required of billing address and should not be empty string",
      });

    if (!isValid(address.billing.city))
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
        .send({ status: "false", message: "Found Error in Uploading files..." });
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
        .send({ status: false, message: "Please Enter email and Password" });
    }
    if (!email) {
      return res.status(400).send({ status: false, message: "Please Enter email" });
    }
    if(!isValidEmail(email)){
        return res.status(400).send({status:false,message:"Email is Invalid"})
    }
    email.toLowerCase();
    if (!password) {
      return res
        .status(400)
        .send({ status: false, message: "Please Enter password" });
    }
    const user = await userModel.findOne({ email: email });

    if (!user) {
      return res.status(401).send({ status: false, message: "Invalid User" });
    }
    const tempPassword = user.password;
    const match = await bcrypt.compare(password, tempPassword);

    if (match) {
      let token = await jwt.sign(
        { id: user._id.toString() },
        "FunctionUp-Group-55-aorijhg@#",
        { expiresIn: "2hr" }
      );
      res.header({ BearerToken: token });
      return res.status(200).send({
        status: true,
        message: "User LoggedIn Succesfully",
        data: { userId: user._id, token: token },
      });
    }
    if (!match) {
      return res
        .status(400)
        .send({ status: false, message: "Password Incorrect" });
    }
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

// --------------------------------- userDetails --------------------------------------------------------------
const userDetails = async function (req, res) {
  try {
    let userId = req.params.userId;
   
    if (!isValidId(userId))
      return res.status(400).send({ status: false, message: "Invalid userId" });

    // authorisation
    if (userId != req.decodedToken.id)
      return res
        .status(403)
        .send({ status: false, message: "Unauthorised access" });

    let userdetails = await userModel.findById({ _id: userId });

    if (!userdetails)
      return res
        .status(400)
        .send({ status: false, message: "No user found with this userId" });

    return res
      .status(200)
      .send({
        status: true,
        message: "User profile details",
        data: userdetails,
      });
  } catch (error) {
    res.status(500).send({ status: false, error: error.message });
  }
};




// -- ------------------------------------Update user details ------------------------------------------


const updateUser =  async function(req,res){
    try {
      const data = req.body;
      const userId = req.params.userId;
      const files = req.files;
      const update = {};
  
      const { fname, lname, email, phone, password, address } = data;
  
      if (!isValidBody(data) && !files) {
        return res.status(400).send({
          status: false,
          message: "Please provide data in the request body!",
        });
      }
  
      const keys = [
        "fname",
        "lname",
        "email",
        "phone",
        "password",
        "address",
        "profileImage",
      ];
  
      if (!Object.keys(req.body).every((elem) => keys.includes(elem))) {
        return res
          .status(400)
          .send({ status: false, message: "wrong Parameters" });
      }
  
      if (fname) {
        if (!isValid(fname) || !isValidName(fname)) {
          return res
            .status(400)
            .send({ status: false, message: "fname is invalid" });
        }
  
        update["fname"] = fname;
      }
  
      if (lname) {
        if (!isValid(lname) || !isValidName(lname)) {
          return res
            .status(400)
            .send({ status: false, message: "lname is invalid" });
        }
        update["lname"] = lname;
      }
  
      if (email) {
        if (!isValidEmail(email)) {
          return res
            .status(400)
            .send({ status: false, message: "Email is invalid!" });
        }
  
        let userEmail = await userModel.findOne({ email: email });
        if (userEmail) {
          return res.status(409).send({
            status: false,
            message:
              "This email address already exists, please enter a unique email address!",
          });
        }
        update["email"] = email;
      }
  
      if (phone) {
        if (!isValidNumber(phone)) {
          return res
            .status(400)
            .send({ status: false, message: "Phone is invalid" });
        }
  
        let userNumber = await userModel.findOne({ phone: phone });
        if (userNumber)
          return res.status(409).send({
            status: false,
            message:
              "This phone number already exists, please enter a unique phone number!",
          });
        update["phone"] = phone;
      }
  
      if (password) {
        if (isValidPwd(password)) {
          return res.status(400).send({
            status: false,
            message:
              "Password should be strong, please use one number, one upper case, one lower case and one special character and characters should be between 8 to 15 only!",
          });
        }
 
       update.password = await bcrypt.hash(password, 10);

      }
  
      if (address) {
        const { shipping, billing } = address;
  
        if (shipping) {
          const { street, city, pincode } = shipping;
  
          if (street) {
            if (isValid(address.shipping.street)) {
              return res
                .status(400)
                .send({ status: false, message: "Invalid shipping street!" });
            }
            update["address.shipping.street"] = street;
          }
  
          if (city) {
            if (isValid(address.shipping.city)) {
              return res
                .status(400)
                .send({ status: false, message: "Invalid shipping city!" });
            }
            update["address.shipping.city"] = city;
          }
  
          if (pincode) {
            if (!isValidPincode(address.shipping.pincode)) {
              return res
                .status(400)
                .send({ status: false, message: "Invalid shipping pincode!" });
            }
            update["address.shipping.pincode"] = pincode;
          }
        }
  
        if (billing) {
          const { street, city, pincode } = billing;
  
          if (street) {
            if (isValid(address.billing.street)) {
              return res
                .status(400)
                .send({ status: false, message: "Invalid billing street!" });
            }
            update["address.billing.street"] = street;
          }
  
  
          if (city) {
            if (
              isValid(address.billing.city)) {
              return res
                .status(400)
                .send({ status: false, message: "Invalid billing city!" });
            }
            update["address.billing.city"] = city;
          }
  
          if (pincode) {
            if (!isValidPincode(address.billing.pincode)) {
              return res
                .status(400)
                .send({ status: false, message: "Invalid billing pincode!" });
            }
            update["address.billing.pincode"] = pincode;
          }
        }
      }
  
      if (files && files.length > 0) {
        let uploadedFileURL = await uploadFile(files[0]);  
        update["profileImage"] = uploadedFileURL;
      }else if( Object.keys(data).includes("profileImage")) {
        return res.status(400).send({status: false,message: "please put the profileimage"});
      }

  
      const updateUser = await userModel.findOneAndUpdate(
        { _id: userId },
        update,
        { new: true }
      );
      return res.status(200).send({
        status: true,
        message: "user profile successfully updated",
        data: updateUser,
      });
    } catch (error) {
      res.status(500).send({status: false, message: error.message });
    }
  };
  
  
module.exports = { createUser, loginUser, userDetails, updateUser };
