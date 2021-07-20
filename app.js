// Dependencies
const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const userHandler = require('./routesHandler/userHandler')
const todoHandler = require('./routesHandler/todoHandler')

// app initialization
const app = express()
dotenv.config()
app.use(express.json())

// db connection with mongoose
mongoose.connect('mongodb+srv://amisakib:amisakib@cluster0.p3ijb.mongodb.net/crud', { 
            useNewUrlParser: true, 
            useUnifiedTopology: true 
        })
        .then(() => console.log("Connected with mongoose database"))
        .catch((err) => console.log(err))

// app routes
app.use('/user', userHandler)
app.use('/todo', todoHandler)

// default error handler
const errHandler = (err, req, res, next) => {
    if(res.headersSent){
        return next(err)
    }
    res.status(500).json({ error: err })
}

app.use(errHandler)

// app port listening
app.listen(3000, () => {
    console.log("App listening on port 3000")
})