const express = require("express")
const route = require("./src/routes/route.js")
const mongoose = require("mongoose")

require("dotenv").config()
const PORT = process.env.PORT
const DB = process.env.DB
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

mongoose.set('strictQuery', true) //Deprication error resolve
mongoose.connect(DB, { useNewUrlParser: true })
    .then(() => console.log(("MongoDb is connected...")))
    .catch(err => console.log(err.message))

//===================== Global Middleware for All Route =====================//
app.use("/", route)


//===================== PORT =====================//
app.listen(PORT, function () {
    console.log(`Express is running on port: ${PORT}`)
})

