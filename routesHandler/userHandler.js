// Dependencies
const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const checkLogin = require('../middlewares/checkLogin')

// app router initialization
const router = express.Router()

// Schema
const userSchema = require('../schemas/userSchema')

// Model
const User = new mongoose.model('User', userSchema)

// instance method from Schema
router.get('/active', async (req, res) => {
    // using async await || better
    // try {
    //     const user = new User()
    //     const data = await user.findActive()
    //     res.status(200).json({
    //         data
    //     })
    // } catch (error) {
    //     res.status(500).json({
    //         error: "Server error"
    //     })
    //     console.log(error)
    // }

    // using callback || also better
    const user = new User()
    const data = user.findActiveCb((err, data) => {
        if(err){
            res.status(500).json({
                error: err
            })
        }else{
            res.status(200).json({
                data
            })
        }
    })
})

// static method
router.get('/static-active', async (req, res) => {
    const data = await User.findByActive()

    res.status(200).json({
        data
    })
})

// Query Helper
router.get('/query-helper/:status', async (req, res) => {
    // viaStatus will be out Query Helper || It can be used as chaining method
    const data = await User.find().viaStatus(req.params.status)

    res.status(200).json({
        data
    })
})

// Get all || Middleware
router.get('/', checkLogin, async (req, res) => {
    // await User.find({
    //     status: 'Inactive'
    // }, (err, data) => {
    //     if(err){
    //         res.status(500).json({
    //             data: "server side error",
    //             error: err
    //         })
    //     }else{
    //         res.status(200).json({
    //             data: data
    //         })
    //     }
    // })
    
    console.log(req.userName) // from middleware
    console.log(req.userId) // from middleware

    await User.find({
        status: 'Inactive'
    }).select({
        _id: 0,
        date: 0
    }).populate('todos').limit(2).exec((err, data) => {
        if(err){
            res.status(500).json({
                data: "server side error",
                error: err
            })
        }else{
            res.status(200).json({
                data: data
            })
        }
    })
})

// Get one
router.get('/:id', async (req, res) => {
    await User.find({
        _id: req.params.id
    }, (err, data) => {
        if(err){
            res.status(500).json({
                data: "server side error",
                error: err
            })
        }else{
            res.status(200).json({
                data: data
            })
        }
    })
})

// Store || Signup
router.post('/', async (req, res) => {
    User.create({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        password: await bcrypt.hash(req.body.password, 10) // 10 is perfect
    }, (err) => {
        if(err){
            res.status(500).json({
                data: "server side error",
                error: err
            })
        }else{
            res.status(200).json({
                data: "User saved succesfully"
            })
        }
    })
})

// Signin
router.post('/login', async (req, res) => {
    try {
        const user = await User.find({
            name: req.body.name
        })
        if(user && user.length > 0){
            const isValidPassword = await bcrypt.compare(req.body.password, user[0].password)

            if(isValidPassword){
                // generate token
                const token = jwt.sign({
                    userName: user[0].name,
                    userId: user[0]._id
                }, process.env.JWT_SECRET, {
                    expiresIn: '2 days',
                })
    
                res.status(200).json({
                    'access_token': token,
                    data: "Logged in successfully"
                })
            }else{
                res.status(401).json({
                    error: "Authentication failed!"
                })
            }
        }else{
            res.status(401).json({
                error: "Authentication failed!"
            })
        }
    } catch (error) {
        res.status(401).json({
            error,
            data: "Server problem!"
        })
    }
})

// Store many
router.post('/many', async (req, res) => {
    await User.insertMany(req.body, (err) => {
        if(err){
            res.status(500).json({
                data: "server side error",
                error: err
            })
        }else{
            res.status(200).json({
                data: "Users saved succesfully"
            })
        }
    })
})

// Update
router.put('/:id', async (req, res) => {
    /*
        updateOne just for update,
        that's why findByIdAndUpdate
    */
    const result = await User.findByIdAndUpdate({
        _id: req.params.id
     },{
         $set: {
             status: 'Active',
             role: 'Admin'
         }
     },{
        useFindAndModify: false,
        new: true
     }, (err) => {
        if(err){
            res.status(500).json({
                data: "server side error",
                error: err
            })
        }else{
            res.status(200).json({
                data: "User updated succesfully"
            })
        }
    })
    console.log(result)
})

// Destroy
router.delete('/:id', async (req, res) => {
    /*
        deleteOne just for update,
        that's why findByIdAndDelete
    */
    await User.deleteOne({
        _id: req.params.id
    }, (err) => {
        if(err){
            res.status(500).json({
                data: "server side error",
                error: err
            })
        }else{
            res.status(200).json({
                data: 'User deleted successfully'
            })
        }
    })
})

module.exports = router