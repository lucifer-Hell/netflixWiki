function isAdmin(req,res,next){
   
    if(req.user!=null && req.user.userType=='admin'){
        
        next();
    }
    else {
        req.flash('error',' please login as admin ')
        res.redirect('/login')
    }
}
module.exports={isAdmin}