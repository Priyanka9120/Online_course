//===================== Importing Module and Packages =====================//
const userModel = require('../models/userModel')
const jwt = require('jsonwebtoken')
const bcrypt = require("bcrypt")
const { validName, isValid, validEmail, isValidPassword, validPhone, isValidObjectIds } = require("../validation/validation")



//<<<===================== This function is used for Create User =====================>>>//
const createUser = async (req, res) => {

    try {

        let data = req.body

        //===================== Destructuring User Body Data =====================//
        let { fname, lname, email, whatsappNumber, number, password, address, confirmpassword, role } = data

        //---------------------------Body can't be empty-------------------------------------//
        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "data can't be empty" })
        //---------------------------------validation for each key----------------------//
        let newarr = ["fname", "lname", "whatsappNumber", "email", "number", "password", "address", "confirmpassword"]
        
        for (field of newarr) { if (!data[field]) return res.status(400).send({ status: false, msg: `${field} is empty input valid data` }) }
        
        if (!validName(fname)) { return res.status(400).send({ status: false, message: "fname should be in alphabet" }) }
        if (!validName(lname)) { return res.status(400).send({ status: false, message: "lname should be in alphabet" }) }
        if (!validEmail(email)) { return res.status(400).send({ status: false, message: "email is in wrong format" }) }
        if (!isValidPassword(password)) { return res.status(400).send({ status: false, message: "password is in wrong format" }) }
        if (!isValidPassword(confirmpassword)) { return res.status(400).send({ status: false, message: "Confirm password is in wrong format" }) }
        if (role !== 'admin' && role !== 'user') {return res.status(400).send({status:false, message: 'You can define only "admin" or "user" in role.'}) }
        
        if (password !== confirmpassword) return res.status(400).send({ status: false, message: "Password and Confirm Password should be match" })
        //----------------------------------Encrypt the password by bcrypt-------------------------------//
        data.password = await bcrypt.hash(password, 10)

        //---------Fetching data of email from db checking duplicate email or phone is present or not------------//
        const isDuplicateEmail = await userModel.findOne({ $or: [{ email: email }, { number: number }] })
        if (isDuplicateEmail) {
            if (isDuplicateEmail.email == email) { return res.status(400).send({ status: false, message: `this emailId:${email} is already exist` }) }
            if (isDuplicateEmail.number == number) { return res.status(400).send({ status: false, message: `this phone:${number} is already exist` }) }
        }
        if (!validPhone(number)) { return res.status(400).send({ status: false, mesaage: "phone number is in wrong format" }) }
        if (!validPhone(whatsappNumber)) { return res.status(400).send({ status: false, mesaage: "phone number is in wrong format" }) }
        //x===================== Final Creation of User =====================x//
        let userCreated = await userModel.create(data)

        return res.status(201).send({ status: true, message: "User created successfully", data: userCreated })

    } catch (error) {
        console.log(error.message)
        return res.status(500).send({ status: false, error: error.message })
    }
}




//------------------------------------------------------------Login Api-------------------------------------------------------------------------------

const loginUser = async function (req, res) {
    try {
        let { email, password } = req.body;

        if (Object.keys(req.body).length === 0) {
            return res.status(400).send({ status: false, message: "please input user Details" });
        }

        if (!email) {
            return res.status(400).send({ status: false, message: "EmailId is mandatory", });
        }
        if (!validEmail(email)) {
            return res.status(400).send({ status: false, message: "EmailId should be Valid", });
        }
        if (!password) {
            return res.status(400).send({ status: false, message: "Password is mandatory" });
        }
        if (password.length < 8 || password.length > 15) {
            return res.status(400).send({ status: false, message: "the length of password must be min:- 8 or max: 15", });
        }

        let verifyUser = await userModel.findOne({ email: email });
        if (!verifyUser) return res.status(400).send({ status: false, message: "Invalid Login Credential" });

        //-------------------------------------------Decrypt the password and compare the password with user input------------------------------------------//
        let checkPassword = await bcrypt.compare(password, verifyUser.password)
        if (checkPassword) {
            verifyUser == true
        } else {
            return res.status(400).send({ status: false, message: "Password does not match" })
        }

        let payload = { userId: verifyUser["_id"], iat: Date.now(), };


        let token = jwt.sign(payload, "onlineCourse", { expiresIn: "24h" });

        res.setHeader("authorization", token);

        return res.status(200).send({ status: true, message: "User login successfully", data: { userId: verifyUser["_id"], token } });

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message, });
    }
};




module.exports = { createUser, loginUser }