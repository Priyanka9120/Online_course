//===================== Importing Module and Packages =====================//
const userModel = require('../models/userModel.js')
const cartModel = require('../models/cartModel.js')
const courseModel = require('../models/courseModel')
const { isValidObjectIds,isValid} = require("../validation/validation")


//<<<===================== This function is used for Create Cart Data =====================>>>//
const createCart = async (req, res) => {
    try {

        let userId = req.params.userId
        let data = req.body

        //===================== Destructuring Cart Body Data =====================//
        let { cartId, courseId} = data

        //===================== Checking Field =====================//
        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "Data is required inside request body" })
             //===================== Validation of courseId =====================//
         if (!isValid(courseId)) return res.status(400).send({ status: false, message: "Enter courseId." })
         if (! isValidObjectIds(courseId)) return res.status(400).send({ status: false, message: `This course is not available` })

        //===================== Fetching Course Data is Present or Not =====================//
        let checkCourse = await courseModel.findOne({ _id: courseId, isDeleted: false })
        if (!checkCourse) { return res.status(404).send({ status: false, message: `This course is not exist!` }) }


        //===================== Assign Value =====================//
        let Price = checkCourse.price


        if (cartId) {

            //===================== Checking the CartId is Valid or Not by Mongoose =====================//
             if (!isValid(cartId)) return res.status(400).send({ status: false, message: "Enter a valid cartId" });
             if (!isValidObjectIds(cartId)) return res.status(400).send({ status: false, message: `This cartId: ${cartId} is not valid!.` })

            //===================== Fetch the Cart Data from DB =====================//
            let checkCart = await cartModel.findOne({ _id: cartId, userId: userId })

            //===================== This condition will run when Card Data is present =====================//
            if (checkCart) {

                let items = checkCart.items
                let object = {}

                //===================== Run Loop in items Array =====================//
                for (let i = 0; i < items.length; i++) {

                    //===================== Checking both courseId are match or not =====================//
                    if (items[i].courseId.toString() == courseId) {

                        return res.status(200).send({ status: true, message: "Already added this course in your cart" })

                    }
                }

                //===================== Pushing the Object into items Array =====================//
                items.push({ courseId: courseId })
                let tPrice = checkCart.totalPrice + Price

                //===================== Push the Key and Value into Object =====================//
                object.items = items
                object.totalPrice = tPrice
                object.totalCourse = items.length

                //===================== Update Cart document =====================//
                let update1Cart = await cartModel.findOneAndUpdate({ _id: cartId }, { $set: object }, { new: true }).populate('items.courseId')

                return res.status(201).send({ status: true, message: "Success", data: update1Cart })

            } else {

                return res.status(404).send({ status: false, message: 'Cart is not exist with this userId!' })
            }

        } else {

            //===================== Fetch the Cart Data from DB =====================//
            let cart = await cartModel.findOne({ userId: userId })

            //===================== This condition will run when Card Data is not present =====================//
            if (!cart) {

                //===================== Make a empty Array =====================//
                let arr = []
                let totalPrice = Price

                //===================== Pushing the Object into items Arr =====================//
                arr.push({ courseId: courseId })

                //===================== Create a object for Create Cart =====================//
                let obj = {
                    userId: userId,
                    items: arr,
                    totalCourse: arr.length,
                    totalPrice: totalPrice
                }

                //===================== Final Cart Creation =====================//
                await cartModel.create(obj)

                let resData = await cartModel.findOne({ userId }).populate('items.courseId')

                return res.status(201).send({ status: true, message: "Success", data: resData })

            } else {

                return res.status(400).send({ status: false, message: "You have already CardId which is exist in your account." })
            }
        }

    } catch (error) {
        console.log(error.message)
        return res.status(500).send({ status: false, message: "error.message" })
    }
}



//<<<===================== This function is used for Create Cart Data =====================>>>//
const updateCart = async (req, res) => {
    try {

        let data = req.body;
        let userId = req.params.userId

        //===================== Checking for a valid user input =====================//
        let findCart = await cartModel.findOne({ userId: userId });
        if (!findCart) return res.status(404).send({ status: false, message: `No cart found !` });

        //===================== Checking is cart is empty or not =====================//
        if (findCart.items.length == 0) return res.status(400).send({ status: false, message: "Cart is already empty" });

        //===================== Destructuring Cart Body Data =====================//
        let { cartId, courseId } = data;


        //===================== Checking Field =====================//
        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "Data is required inside request body" })
       
        //===================== Validation for CartID =====================//
        if (cartId || typeof cartId == 'string') {
            if (!isValid(cartId)) return res.status(400).send({ status: false, message: "Enter a valid cartId" });
            if (!isValidObjectIds(cartId)) return res.status(400).send({ status: false, message: "Please Enter Valid CartId" })
            if (findCart._id.toString() !== cartId) return res.status(400).send({ status: false, message: "This is not your CartId, Please enter correct CartId." })
        }

        //===================== Validation for courseId =====================//
        if (!isValid(courseId)) return res.status(400).send({ status: false, message: "Please Enter courseId" })
         if (!isValidObjectIds(courseId)) return res.status(400).send({ status: false, message: "Please Enter Valid courseId" })

        //===================== Fetch the Product Data From DB =====================//
        let getProduct = await courseModel.findOne({ _id: courseId, isDeleted: false })
        if (!getProduct) return res.status(404).send({ status: false, message: `No product found with this courseId: '${courseId}'.` })

        //===================== Fetch the Cart Data From DB =====================//
        let getCart = await cartModel.findOne({ _id: findCart._id, 'items.courseId': { $in: [courseId] } })
        if (!getCart) return res.status(404).send({ status: false, message: `No product found in the cart with this courseId: '${courseId}'.` })


        //===================== Set the Total Amount =====================//
        let totalAmount = getCart.totalPrice - getProduct.price

        //===================== Store the Item Array inside arr variable =====================//
        let arr = getCart.items
        let totalCourse = getCart.totalCourse



        //===================== loop for arr =====================//
        for (let i = 0; i < arr.length; i++) {

            //===================== Condition for checking those two Product is matched or not =====================//
            if (arr[i].courseId.toString() == courseId) {

                totalCourse--

                //===================== Pull that Product from that cart and Update values =====================//
                let update1 = await cartModel.findOneAndUpdate({ _id: findCart._id }, { $pull: { items: { courseId: courseId } }, totalCourse: totalCourse }, { new: true }).populate('items.courseId')

                //===================== Fetch item and total item and set in Variable =====================//
                arr = update1.items
                totalCourse = update1.totalCourse

            }

        }

        //===================== Update that cart =====================//
        let updatePrice = await cartModel.findOneAndUpdate({ _id: findCart._id }, { $set: { totalPrice: totalAmount, items: arr, totalCourse: totalCourse } }, { new: true }).populate('items.courseId')

        return res.status(200).send({ status: true, message: "Success", data: updatePrice })


    } catch (error) {
        console.log(error.message)
        return res.status(500).send({ status: false, message: "error.message" })
    }
}



//<<<===================== This function is used for Fetch the Cart Data From DB =====================>>>//
const getCart = async (req, res) => {

    try {

        let userId = req.params.userId;

        //===================== Fetch Cart Data from DB =====================//
        let carts = await cartModel.findOne({ userId: userId }).populate('items.courseId')
        if (!carts) return res.status(404).send({ status: false, message: "cart does not exist!" })

        //===================== Return Responce =====================//
        return res.status(200).send({ status: true, message: 'Success', data: carts })

    } catch (error) {

        return res.status(500).send({ status: false, error: error.message })
    }
}



//<<<===================== This function is used for Delete the Cart Data =====================>>>//
const deleteCart = async (req, res) => {

    try {

        let userId = req.params.userId;

        //===================== Fetch Cart Data from DB and Delete Cart =====================//
        let cartDelete = await cartModel.findOneAndUpdate({ userId: userId }, { $set: { items: [], totalPrice: 0, totalCourse: 0 } }, { new: true })
        if (!cartDelete) return res.status(404).send({ status: false, message: "cart does not exist!" })

        //===================== Return Responce =====================//
        return res.status(204).send()

    } catch (error) {

        return res.status(500).send({ status: false, error: error.message })
    }
}





module.exports = { createCart, updateCart, getCart, deleteCart }