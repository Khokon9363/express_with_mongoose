const mongoose = require('mongoose')

const todoSchema = mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    }
})

module.exports = todoSchema