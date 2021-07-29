const express=require('express')
const app=express();
const router=require('./routes/user').router

app.use(require('connect-flash')())
require('dotenv').config()

/* ----------------------------------------------------------*/
/* basic configuration */ 

// connect to db
const db=require('./handlers/db').connectToDb(process.env.DB_URL)

// setting default rendering module 
app.set('view engine', 'ejs');
app.use(express.static('views'))
 
// every time user requests comes app.use gets trigger
// enabling json handler and url parser 
app.use(express.json())
app.use(express.urlencoded({extended:true}))

/* ----------------------------------------------------------*/

/* Intial Passport Configuration */ 

// Intializing express session  
app.use(require('express-session')({ secret: 'secretsOfNetflix', resave: false, saveUninitialized: false }));
// passport configuration 


/* ----------------------------------------------------------*/


// Routes configuration 


app.use('/',router)
// if none of the url matches just 
// 404 url not found


// Listing port 
app.listen(3000,()=>{
    console.log("app is listening ")
})