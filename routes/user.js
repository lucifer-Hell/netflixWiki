const express=require('express')
const fs=require('fs')
const router=express.Router()
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })
const {addNewShow,getShows,getShow,searchShowByName}=require('../handlers/show')
const path=require('path')
const registerUser=require('../handlers/user').registerUser
const passport =require('../handlers/utils').initalizePassport()
router.use(passport.initialize());
router.use(passport.session());

router.get('/',(req,res,next)=>{
   getShows().then((shows)=>{res.render('home.ejs',{user:req.user,shows
})})
    .catch((err)=>next(err))
})
router.get('/addOrEdit',(req,res)=>{
    if(req.user==null){
        req.flash('error','please login to add a review')
        res.redirect('/login')
    }
    else res.render('addOrEdit.ejs',{user:req.user,error:req.flash().error})
})
router.get('/login',(req,res)=>{
    let error=req.flash('error')
    res.render('login.ejs',{error})
})
router.get('/signUp',(req,res)=>{
    if(req.user)res.redirect('/')
    else res.render('signUp.ejs',{error:req.flash('error')})
})
router.get('/show',(req,res,next)=>{
   
   getShow(req.query.id).then((show)=>{
    if(show==null)
     req.flash('error','Show not found ')
    if(req.user.userType=='admin')
        res.render('approveOrDelete.ejs',{user:req.user,error:req.flash('error'),show})
    else res.render('show.ejs',{user:req.user,error:req.flash('error'),show})
   })
   .catch(err=>next(err))

})
router.get('/search',(req,res)=>{
   
    let msg=req.flash().error
   
    
    res.render('search.ejs',{error:msg})
})
router.get('/searchResults',(req,res)=>{
    console.log(req.query.showName)
    let name =req.query.showName
    if(name.length==0)
       { 
       
         req.flash('error','No show name entered ')
         res.redirect('/search')    
    }else {
        
        let results=null;
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
    // console.log("opening")
    registerUser(req.body).then((data)=>{
        if(data) res.redirect('/login')
        else {
            req.flash('message','Email id already registered ')
            res.redirect('/signUp')
        }
    }).catch((err)=>{
        // res.send(err)
        console.log("errorr occured on signup ")
        console.log(err)
        req.flash('message','User Details Invalid ')
        res.redirect('/signUp')
    })
})

router.post('/addOrEdit',upload.fields([{name:'coverImage',maxCount:1},{name:'secondImage',maxCount:1}]),(req,res)=>{
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
router.use((err,req,res,next)=>{
    console.log(err)
    res.send(err)
})

module.exports={router}