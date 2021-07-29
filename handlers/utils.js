const passport=require('passport')
const LocalStrategy = require('passport-local').Strategy;
const validateUser=require('./user').validateUser
function initalizePassport(){
    // implementing strategy
    passport.use(new LocalStrategy(
    function(email, password, done) {
        
        validateUser({email,password}).then((data)=>{
              
             if(data==null)done(null,false,{message:'invalid email id or password '})
             else done(null,data)
        }).catch((err)=>{
             done(err)
        })

    }));
    // providing serialization and deserialization schemes
    // use to encrypt and later  reterive the user information from sesion 
    passport.serializeUser(function(user, done) {
      // console.log("seariliznig ")
      // console.log(user)
      done(null, user.id);
    });
     
    passport.deserializeUser(function(id, done) {
      validateUser({_id:id}).then((data)=>{
        if(data==null) done(null,false,{message:'Session Expired  '})
        else  done(null,data)
      }).catch((err)=>done(err))
    });
    
    return passport

}





module.exports={initalizePassport}