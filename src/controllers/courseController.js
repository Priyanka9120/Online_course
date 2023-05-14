const courseModel = require('../models/courseModel')



const createCourse = async function (req, res) {
    try {
        let data = req.body
        if (Object.keys(data) == 0) { return res.status(400).send({ status: false, message: "No input provided" }) }
        const { title, description, price } = req.body
        if (!title) { return res.status(400).send({ status: false, message: "Please provide title" }) }
        const isUnique = await courseModel.findOne({ title: title })
        if (isUnique) { return res.status(400).send({ status: false, message: "Title is already exist" }) }
        if (!description) { return res.staus(400).send({ status: false, message: "please provide description" }) }
        if (!price) { return res.status(400).send({ status: false, message: "please provide price" }) }

        const course = await courseModel.create(data)

        return res.status(201).send({ status: true, message: "successfull", data: course })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}



const updateCourse = async function (req, res) {
    try {

        let data = req.body
        let courseId = req.params.courseId
        const { title, description, price } = req.body

        if (Object.keys(data) == 0) { return res.status(400).send({ status: false, message: "No input provided" }) }
        if (!title) { return res.status(400).send({ status: false, message: "Please provide title or description or price" }) }

        const isUnique = await courseModel.findOne({ title: title })
        if (isUnique) { return res.status(400).send({ status: false, message: "Title is already exist" }) }

        const course = await courseModel.findByIdAndUpdate({ _id: courseId }, { title, description, price }, { new: true })
        if (!course) return res.status(404).send({ status: false, message: "This Course is unavailable OR already deleted" })

        return res.status(201).send({ status: true, message: "successfull", data: course })

    }
    catch (error) {
        return res.status(500).send({ status: false, message: "error.message" })
    }
}



const getCourse = async function (req, res) {
    try {
        const courseData = await courseModel.find({ isDeleted: false })
        if (courseData.length == 0) return res.status(400).send({ status: false, message: "Any course is not available now" })

        return res.status(200).send({ status: true, message: "successfull", data: courseData })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: "error.message" })
    }
}



const deleteCourse = async function (req, res) {
    try {
        let courseId = req.params.courseId

        if (!courseId) return res.status(400).send({ status: false, message: "courseId is required." })
        let course = await courseModel.findOneAndUpdate({ _id: courseId, isDeleted: false }, { isDeleted: true, deletedAt: Date.now() }, { new: true })
        if (!course) return res.status(404).send({ status: false, message: "Course you are trying to access is unavailable OR already deleted" })

        return res.status(200).send({ status: true, message: "Course is deleted" })
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}





module.exports = { createCourse, updateCourse, getCourse, deleteCourse }
