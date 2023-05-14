const jwt = require('jsonwebtoken');
const { isValidObjectIds } = require("../validation/validation");
const userModel = require("../models/userModel.js")




const authenticate = async (req, res, next) => {
  try {
    let token = req.headers["x-api-key"];
    if (!token) return res.status(400).send({ status: false, msg: "token must be present" });
    jwt.verify(token, "onlineCourse", function (err, decode) {
      if (err) { return res.status(401).send({ status: false, message: "Authentication failed" }) }
      req.decode = decode;
      next();
    })
  }
  catch (error) {
    return res.status(500).send({ staus: false, msg: error.message });
  }
}



const checkAdmin = async (req, res, next) => {
  try {

    let userLoggedIn = req.decode;

    console.log(userLoggedIn)

    let userAccessing = await userModel.findById(userLoggedIn.userId);
    if (!userAccessing) { return res.status(404).send({ status: false, message: "Error! Please check userid and try again!" }); }


    if (userAccessing.role !== 'admin') {     //string representation of object
      return res.status(403).send({ status: false, msg: "Unauthorize access. You are not Admin" });
    }

    next();

  }
  catch (error) {
    return res.status(500).send({ staus: false, msg: error.message });
  }
}




const authorize = async (req, res, next) => {
  try {
    let userLoggedIn = req.decode; //Accessing userId from token attribute
    let userId = req.params.userId; // pass user id in path params

    //check if user id is valid or not
    if (!isValidObjectIds(userId)) {
      return res.status(400).send({ status: false, message: "userId is invalid" });
    }
    let userAccessing = await userModel.findById(userId);
    if (!userAccessing) { return res.status(404).send({ status: false, message: "Error! Please check userid and try again" }); }

    req.data = userAccessing

    if (userAccessing["_id"].toString() !== userLoggedIn.userId) {     //string representation of object
      return res.status(403).send({ status: false, msg: "Error, authorization failed" });
    }

    next();

  } catch (err) {
    return res.status(500).send({ status: false, error: err.message });
  }
};




module.exports = { checkAdmin, authenticate, authorize }