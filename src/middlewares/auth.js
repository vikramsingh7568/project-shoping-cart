const jwt = require("jsonwebtoken");
const { isValidObjectId } = require("mongoose");
const UserModel = require("../models/UserModel");

// authenication
const authenticate = async function (req, res) {
  try {
    let bearerToken = req.headers["authorisation"];

    if (!bearerToken)
      return res
        .status(401)
        .send({ status: false, message: "Token is required" });

    let token = bearerToken.split(" ")[1];

    jwt.verify(token, secretkey, function (error, decodedToken) {
      if (error) {
        let message =
          error.message == "jwt expired"
            ? "token expired , login again!"
            : "Invalid token";
        return res.status(401).send({ status: false, message: message });
      }
      req.decodedToken = decodedToken;
      next();
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

//authorisation
const authorise = async function (req, res) {
  try {
    let userId = req.params.userId;
    let allowedUser = req.decodedToken;

    if (!isValidObjectId(userId))
      return res.status(400).send({ status: false, message: "Invalid UserId" });

    let user = await UserModel.findById(userId);
    if (!user)
      return res
        .status(404)
        .send({ status: false, message: "You are not registered" });

    if (userId != allowedUser)
      return res
        .status(403)
        .send({ status: false, message: "Unauthorised access!" });

    next();
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = { authenticate, authorise };
