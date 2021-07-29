// return new instance of db
const db=require('mongoose')

function connectToDb(url){
 db.connect(url,{useNewUrlParser:true,useUnifiedTopology: true,useCreateIndex:true }).then(()=>console.log("db connected !"))
 .catch((err)=>console.log(err))
}

module.exports={
    connectToDb
}