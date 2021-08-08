const User=require('../models/user').User
async function registerUser(user){
    // if user is valid register him or her
    
    const docExist=await User.findOne({email:user.email})
    
    if(docExist)return null;
    const doc=new User({...user})
    
    await doc.save();
    return doc
}
async function validateUser(user){
    const doc =await User.findOne({...user})
    return doc
}


module.exports={registerUser,validateUser}