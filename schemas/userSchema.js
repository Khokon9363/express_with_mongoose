const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    role: {
        type: String,
        enum: ['Admin', 'User'],
        default: 'User'
    },
    date: {
        type: Date,
        default: Date.now()
    },
    todos: [
        {
            type: mongoose.Types.ObjectId,
            ref: "Todo"
        }
    ]
})

// instance methods
userSchema.methods = {
    // using async await
    findActive: () => {
        return mongoose.model("User").find({
            status: "Active"
        })
    },
    // using callback
    findActiveCb: (cb) => {
        return mongoose.model("User").find({
            status: "Active"
        }, cb)
    }
}

// static methods
userSchema.statics = {
    findByActive: function () {
        return this.find({
            status: "Active"
        }) // this => mongoose.model("User") & this is not availble into arrow function
    }
}

// Query Helpers
userSchema.query = {
    viaStatus: function (status) {
        return this.find({
            status: status
        }) // this => mongoose.model("User") & this is not availble into arrow function
    }
}

module.exports = userSchema