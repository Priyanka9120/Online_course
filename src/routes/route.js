//=================================================================Importing Modules & Packages================================================================>
const express = require("express")
const router = express.Router();

const { createUser, loginUser } = require("../controllers/userController")
const { createCourse, updateCourse, getCourse, deleteCourse } = require("../controllers/courseController")
const { createCart, updateCart, getCart, deleteCart } = require('../controllers/cartController.js')
const { paynow, callback } = require('../controllers/payment.js')
const { checkAdmin, authenticate, authorize } = require('../Middleware/auth.js')



//=============================User Feature===========================================//
router.post("/register", createUser)
router.post("/login", loginUser)


//=========================course Feature===============================================//
router.post("/create_course", authenticate, checkAdmin, createCourse)
router.put("/update_course/:courseId", authenticate, checkAdmin, updateCourse)
router.get("/get_course", authenticate, getCourse)
router.delete("/delete_course/:courseId", authenticate, checkAdmin, deleteCourse)


//=========================course Feature===============================================//
router.post("/create_cart/:userId", authenticate, authorize, createCart)
router.put("/update_cart/:userId", authenticate, authorize, updateCart)
router.get("/get_cart/:userId", authenticate, authorize, getCart)
router.delete("/delete_cart/:userId", authenticate, authorize, deleteCart)


//=========================Payment Gateway Feature===============================================//
router.post("/paynow/:userId", authenticate, authorize, paynow)
router.post("/callback/:userId", authenticate, authorize, callback)



//=================================================================Export Routes================================================================>
module.exports = router