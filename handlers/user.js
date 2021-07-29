const User=require('../models/user').User
async function registerUser(user){
    // if user is valid register him or her
    // console.log(user.firstName)
    const docExist=await User.find(user)
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