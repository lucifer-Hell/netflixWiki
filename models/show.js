const mongoose = require("mongoose");


const showSchema=new mongoose.Schema({
    title:String,
    coverImage:{data: Buffer, contentType: String},
    secondImage:{data: Buffer, contentType: String},
    main:String,
    sub:String,
    authorId:{type:mongoose.Schema.Types.ObjectId,required:true},
    likes:[{id:mongoose.Schema.Types.ObjectId}],
    extras:{},
    approved:{type:Boolean,default:false}
})

const Show=mongoose.model('show',showSchema);
module.exports={
    Show
}