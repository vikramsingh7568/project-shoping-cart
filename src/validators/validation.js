const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const isValid = (value) => {
  if (typeof value === "undefined" || typeof value === "null") return true;
  if (typeof value === "string" && value.trim().length != 0) return true;
  if (typeof value === "object" && Object.keys(value).length == 0) return true;

  return false;
};

const isValidId = function (id) {
  return mongoose.Types.ObjectId.isValid(id);
};

const isValidName = function (name) {
  if (/^[a-z ,.'-]+$/i.test(name)) return true;
  return false;
};

const isValidString = (String) => {
  return /\d/.test(String)
}
const isValidBody = (reqBody) => {
  return Object.keys(reqBody).length == 0;
};

const isValidPhone = (Mobile) => {
  return /^[6-9]\d{9}$/.test(Mobile);
};

const isValidEmail = (Email) => {
  return /^([A-Za-z0-9._]{3,}@[A-Za-z]{3,}[.]{1}[A-Za-z.]{2,6})+$/.test(Email);
};

const isValidPwd = (Password) => {
  return /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/.test(
    Password
  );
};

const isValidPincode = (num) => {
  return /^[1-9][0-9]{5}$/.test(num);
};

const isValidNumber = function (value) {
  if (typeof value === "undefined" || value === null) return true;
  if (
    typeof value === "string" &&
    value.trim().length > 0 &&
    Number(value) !== NaN &&
    Number(value) >= 0
  )
    return false;
  if (typeof value === "number" && value >= 0) return false;
  return true;
};

const isValidPrice = function(price) {
  let regexForPrice = /^\d+(\.\d{1,2})?$/
  return regexForPrice.test(price)
};

const isValidAvailableSizes = (availablesizes) => {
  for( i=0 ;i<availablesizes.length; i++){
    if(!["S", "XS","M","X", "L","XXL", "XL"].includes(availablesizes[i])) return false
  }
  return true
};        

const isValidWords = function (name) {
  if (/^[a-z0-9 ,.#-]+$/i.test(name)) return true;
  return false;
};

const isValidFile = (img) => {
  const regex = /(\/*\.(?:png|gif|webp|jpeg|jpg))/.test(img)
  return regex
}


module.exports = {
  isValid,
  isValidName,
  isValidBody,
  isValidString,
  isValidPhone,
  isValidEmail,
  isValidPwd,
  isValidPincode,
  isValidId,
  isValidNumber,
  isValidPrice,
  isValidAvailableSizes,
  isValidWords,
  isValidFile
};
