// Dependencies
const express = require('express')
const mongoose = require('mongoose')
const checkLogin = require('../middlewares/checkLogin')

// app router initialization
const router = express.Router()

// Schema
const userSchema = require('../schemas/userSchema')
const todoSchema = require('../schemas/todoSchema')

// Model
const User = new mongoose.model('User', userSchema)
const Todo = new mongoose.model('Todo', todoSchema)

// Get all || Middleware
router.get('/', checkLogin, async (req, res) => {
    await Todo.find().select({
        _id: 0,
        date: 0
        // - (minus) will remove data from relation
    }).populate("user", "name status -_id").limit(2).exec((err, data) => {
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

// Store || Middleware
router.post('/', checkLogin, (req, res) => {
    Todo.create({
        title: req.body.title,
        user: req.userId
    }, (err, todo) => {
        if(err){
            res.status(500).json({
                data: "server side error",
                error: err
            })
        }else{
            // update user relation with todo
            User.updateOne({
                _id: req.userId
            }, {
                $push: {
                    todos: todo._id
                }
            }, (err) => {
                if(err){
                    res.status(500).json({
                        data: "Failed to update user todos"
                    })
                }else{
                    res.status(200).json({
                        data: "Todo saved succesfully"
                    })
                }
            })
        }
    })
})

// Destroy || Middleware
router.delete('/:id', checkLogin, async (req, res) => {
    /*
        deleteOne just for update,
        that's why findByIdAndDelete
    */
    await Todo.deleteOne({
        _id: req.params.id
    }, (err) => {
        if(err){
            res.status(500).json({
                data: "server side error",
                error: err
            })
        }else{
            res.status(200).json({
                data: 'Todo deleted successfully'
            })
        }
    })
})

module.exports = router