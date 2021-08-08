const express=require('express')
const fs=require('fs')
const router=express.Router()
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })
const {addNewShow,getShows,getShow,searchShowByName,updateShow,getApprovalPendingShows, approveShow, deleteShow,updateShowLikes}=require('../handlers/show')
const path=require('path')
const registerUser=require('../handlers/user').registerUser
const isAdmin=require('../middlewares/admin').isAdmin

const passport =require('../handlers/utils').initalizePassport()
router.use(passport.initialize());
router.use(passport.session());

router.get('/',(req,res,next)=>{
   getShows().then((shows)=>{res.render('home.ejs',{user:req.user,shows
})})
    .catch((err)=>next(err))
})

router.get('/delete',(req,res,next)=>{
    if(req.user.userType=='admin'){
        
    }
    else {
        req.flash('error','please login as admin ')
        res.redirect('/login')
    }
})



router.get('/addOrEdit',(req,res,next)=>{
    
    if(req.user==null){
        req.flash('error','please login to add or update a review')
        res.redirect('/login')
    }
    else{ 
        if(req.query.id!=undefined && req.query.id.length>0)
            {   
                console.log("queryid request "+req.query.id)
                getShow(req.query.id).then((show)=>{
                   
                    if(show==null){
                        req.flash('error','now such show found ')
                        res.render('add.ejs',{user:req.user,error:req.flash().error})
                    }else {
                        console.log("show author "+show.authorId)
                        
                       
                        if(!req.user._id.equals(show.authorId)){
                            req.flash('error',' you cannot edit this show ')
                            res.render('add.ejs',{user:req.user,error:req.flash().error})
                        }
                        else{
                            res.render('edit.ejs',{user:req.user,error:req.flash().error,show})
                        }
                    }
                }).catch(err=>next(err))
            }
        else res.render('add.ejs',{user:req.user,error:req.flash().error})
    }
})
router.get('/login',(req,res)=>{
    if(req.user)
        res.redirect('/');
    else {
        let error=req.flash('error')
        res.render('login.ejs',{error,user:req.user})
    }
})
router.get('/signUp',(req,res)=>{
    if(req.user)res.redirect('/')
    else res.render('signUp.ejs',{error:req.flash('error')})
})
router.get('/show',(req,res,next)=>{
   
   getShow(req.query.id).then((show)=>{
    if(show==null)
     req.flash('error','Show not found ')
    res.render('show.ejs',{user:req.user,error:req.flash('error'),show})
   })
   .catch(err=>next(err))

})
router.get('/search',(req,res)=>{
   
    let msg=req.flash().error
   
    
    res.render('search.ejs',{error:msg,user:req.user})
})
router.get('/searchResults',(req,res)=>{
    console.log(req.query.showName)
    let name =req.query.showName
    if(name.length==0)
       { 
       
         req.flash('error','No show name entered ')
         res.redirect('/search')    
    }else {
        
       
        searchShowByName(name).then((shows)=>{
            if(shows==null || shows.length==0)
              {  throw new Error('no show by this name found ')
            }
            else res.render('searchResults.ejs',{user:req.user,error:{message:req.flash.error},shows:shows})
    
        })
        .catch((err)=>{
            res.render('searchResults.ejs',{user:req.user,error:{message:err},shows:null})
        })

    }
})

router.post('/login',passport.authenticate('local',{successRedirect:'/',failureRedirect:'/login',failureMessage:'Invalid email-id  OR Password ',failureFlash:true}))

router.post('/signUp',(req,res)=>{
  
    registerUser(req.body).then((data)=>{
        if(data) {
            req.flash('error','Sucesfully registered')
            res.redirect('/login')
        }
        else {
            req.flash('error','Email id already registered ')
            res.redirect('/signUp')
        }
    }).catch((err)=>{
        // res.send(err)
        console.log("errorr occured on signup ")
        console.log(err)
        req.flash('error','User Details Invalid ')
        res.redirect('/signUp')
    })
})

router.post('/add',upload.fields([{name:'coverImage',maxCount:1},{name:'secondImage',maxCount:1}]),(req,res)=>{
   if(!req.user){
       req.flash('error','please login to add a review ')
       res.redirect('/login')
    }

   if(req.files.coverImage.length!=1 || req.files.secondImage.length!=1){
        req.flash('error','please add both images in order to upload ')
        res.redirect('/addOrEdit')
   }
   // resovle the acutal paths and then join them together remover resolving is done form of the server
   let coverImage=path.join(path.resolve('./uploads/'),req.files.coverImage[0].filename)
   let secondImage=path.join(path.resolve('./uploads/'),req.files.secondImage[0].filename)
   let coverImageType=req.files.coverImage[0].mimetype
   let secondImageType=req.files.secondImage[0].mimetype
  
   const show ={
       coverImage:{data:fs.readFileSync(coverImage),contentType:coverImageType},
       secondImage:{data:fs.readFileSync(secondImage),contentType:secondImageType},
       ...req.body,authorId:req.user._id
   }
//    console.log(show)
addNewShow(show).then((data)=>{
       if(data==null){
        req.flash('error','please enter valid details ')
        res.redirect('/addOrEdit')
       }
       else {
        req.flash('error','review added sucessfully! will be displayed in few hours ')
        res.redirect('/addOrEdit')
       }
   }).catch(err=>{
       console.log(err)
       req.flash('error','Oops server side error occured ')
       res.redirect('/addOrEdit')
   })
//    res.redirect('/addOrEdit')
})


router.post('/update',upload.fields([{name:'coverImage',maxCount:1},{name:'secondImage',maxCount:1}]),(req,res)=>{
    if(!req.user){
        req.flash('error','please login to update a review ')
        res.redirect('/login')
     }
 
   
    // update coverimage && second imagae if user reuploaded
    let coverImage=null;
    let secondImage=null;
    let coverImageType=null;
    let secondImageType=null;
    if(req.files.coverImage!=undefined && req.files.coverImage.length>0){
        coverImage=path.join(path.resolve('./uploads/'),req.files.coverImage[0].filename)
        coverImageType=req.files.coverImage[0].mimetype
    }
    if(req.files.secondImage!=undefined && req.files.secondImage.length>0){
        secondImage=path.join(path.resolve('./uploads/'),req.files.secondImage[0].filename)
        secondImageType=req.files.secondImage[0].mimetype
    }
    let show ={};
    if(coverImage!=null){
        show={...show ,coverImage:{data:fs.readFileSync(coverImage),contentType:coverImageType} }
    }
    if (secondImage!=null){
        show={...show , secondImage:{data:fs.readFileSync(secondImage),contentType:secondImageType}}

    }
    show ={...show,...req.body,authorId:req.user._id}
    updateShow(show).then((data)=>{
        if(data==null){
         req.flash('error','please enter valid details ')
         res.redirect('/addOrEdit')
        }
        else {
         req.flash('error','review updated sucessfully! will be displayed in few hours ')
         res.redirect('/addOrEdit')
        }
    }).catch(err=>{
        console.log(err)
        req.flash('error','Oops server side error occured ')
        res.redirect('/addOrEdit')
    })
   

 })

 router.get('/pendingShows',isAdmin,(req,res,next)=>{
      
        getApprovalPendingShows().then((shows)=>{
            if(shows==null || shows.length==0){
                console.log(shows)
                res.render('pendingResults.ejs',{user:req.user,error:"no pending approvals waiting ",shows:null,message:req.flash().message})
            }
            else {
                res.render('pendingResults.ejs',{user:req.user,error:req.flash().error,shows,message:req.flash().message})
            }
        }).catch(err=>next(err))
       
     
 })

 router.post('/approveOrDelete',isAdmin,(req,res,next)=>{
     console.log("Request "+req.body.id)
     getShow(req.body.id).then((show)=>{
         res.render('approveOrDelete.ejs',{user:req.user,show})
     }).catch(err=>next(err))
 })

router.post('/approve',isAdmin,(req,res,next)=>{
    approveShow(req.body.id).then((show)=>{
        req.flash('message','show sucessfully approved ')
        res.redirect('/pendingShows')
    }).catch((err)=>next(err))
})
router.post('/reject',isAdmin,(req,res,next)=>{
    deleteShow(req.body.id).then((show)=>{
        req.flash('error','show rejected ')
        res.redirect('/pendingShows')
    }).catch((err)=>next(err))
})


router.get('/like',(req,res)=>{
    console.log(req.query)
    if(!req.user){
        req.flash('error',' please login to like the show ')
        res.redirect('/login')
    }
    else {
        let userId=req.user._id
        let showId=req.query.id
        console.log("query " +showId)
        updateShowLikes(userId,showId).then((show)=>{
            res.redirect('/show?id='+showId)
        })
    }
})


router.get('/logOut',(req,res)=>{
    if(req.user){
        req.logOut();
        req.flash('error',' succesfuly logged out ')
        res.redirect('/login')
    }
    else {
        req.flash('error',' Session Expired ')
        res.redirect('/login')
    }
})

router.use((err,req,res,next)=>{
    console.log(err)
    res.send(err)
})

module.exports={router}