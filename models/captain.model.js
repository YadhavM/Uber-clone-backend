const mongoose = require('mongoose') 
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const captainSchema = new mongoose.Schema({
    fullname: {
        firstname: {
            type: String,
            required: true,
            minlength: [3, 'Firstname should be at least 3 characters long ']
        },
        lastname: {
            type: String,
        }
    },
    email: {
        type: String,
        required: true,
        unique : true  , 
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    password : {
        type : String , 
        required : true , 
        select : false ,  
    },
    socketId : { 
        type : String , 
    },
    status : {
        type : String , 
        enum:['active' , 'inactive'] , 
        default  : 'inactive' , 
    },
    vehicle : {
        color : {
            type : String , 
            required : true , 
            minlength : [3,"Color must be at least 3 charaters long"]
        },
        plate : { 
            type : String, 
            required : true , 
            minlength : [3,"Plate must be at least 3 characters long"]
        },
        capacity : {
            type : Number , 
            required : true , 
            minlength : [1 , "capacity must at least 1"]
        },
        vehicleType : {
            type : String , 
            required  : true , 
            enum : ["Car" , "Bike" , "Rickshaw","Van"],
        }
    },
    location  : {
        lon :{
            type : Number , 
        },
        lat :{
            type : Number , 
        }
    }
})

captainSchema.methods.generateAuthToken = function () { 
const token = jwt.sign({_id : this._id}, process.env.JWT_SECRET , {expiresIn : '24h'})
return token ; 
}

captainSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
}

captainSchema.statics.hashPassword = async function(password) { 
    return await bcrypt.hash(password , 10)
}



const captainModel = mongoose.model('captain' , captainSchema )
module.exports = captainModel 