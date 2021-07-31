const mongoose= require("mongoose");

const userSchema=new mongoose.Schema({
    firstName:{type:String,required: true},
    lastName:{type:String,required: true},
    email:{type:String,required: true,unique:true},
    profilePhoto:String,
    contactNo:String,
    password:{type:String,required: true},
    userType:{type:String,default:'user'},
    reviewsAdded:[{id:mongoose.Types.ObjectId}],
    extras:{},
})

const User=mongoose.model('user',userSchema)
module.exports={
    User
}