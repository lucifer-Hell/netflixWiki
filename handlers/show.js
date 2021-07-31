const Show=require('../models/show').Show

async function addNewShow(show){
    const title=show.title
    const coverImage={data:show.coverImage.data,contentType:show.coverImage.contentType}
    const secondImage={data:show.secondImage.data,contentType:show.secondImage.contentType}
    const main=show.main
    const sub=show.sub
    const authorId=show.authorId
    const review={
        title,coverImage,secondImage,main,sub,authorId
    }
    const doc= new Show(review);
    doc.save();
    return doc;
}

async function updateShow(show){
    const doc=await Show.updateOne({_id:show.showId},{...show,approved:false});
    return doc;
}

function getImg(data){

    return (data)? Buffer.from(data,'binary').toString('base64'):null
}


async function getShows(){
    const shows= await Show.find({},null,{limit:10})
    // console.log(shows)
    let showList=shows.map((show)=>{
        
        // console.log(show.coverImage.contentType)
        return {title:show.title,
                id:show._id,
              coverImage:getImg(show.coverImage.data),
                contentType:show.coverImage.contentType,id:show._id,approved:show.approved}
    })
    showList=showList.filter((show)=>{
        if(show.approved)return show
    })
    // console.log(showList)
    return showList    
}

async function getApprovalPendingShows(){
    const shows= await Show.find({},null,{limit:10})
    // console.log(shows)
    let showList=shows.map((show)=>{
        
        // console.log(show.coverImage.contentType)
        return {title:show.title,
                id:show._id,
              coverImage:getImg(show.coverImage.data),
                contentType:show.coverImage.contentType,id:show._id,approved:show.approved}
    })
    // console.log(showList)
    showList=showList.filter((show)=>{
        console.log(show.approved)
        if(show.approved==false)return show
    })
    return showList    
}


async function getShow(id){
    const show= await Show.findOne({_id:id})
   
    if(show==null)
        return null;
    else  return  {
            id:show._id,
            title:show.title,
            coverImage:getImg(show.coverImage.data),
            secondImage:getImg(show.secondImage.data),
            main:show.main,
            sub:show.sub,
            likes:show.likes,
            authorId:show.authorId
        }
}

async function searchShowByName(title){
   
    const shows= await Show.find({title:{ $regex: new RegExp("^" + title.toLowerCase(), "i") } },null,{limit:10})
    // console.log(shows)
    let showList=shows.map((show)=>{
        
        // console.log(show.coverImage.contentType)
        return {title:show.title,
                id:show._id,
                coverImage:getImg(show.coverImage.data),
                contentType:show.coverImage.contentType,id:show._id,approved:show.approved}
    })
    showList=showList.filter((show)=>{
        if(show.approved==true)return show
    })
    // console.log(showList)
    return showList    
}


async function approveShow(id){
    const result=await Show.updateOne({_id:id},{approved:true})
    return result
}

async function deleteShow(id){
    const result= await Show.deleteOne({_id:id})
    return result
}

async function updateShowLikes(userId,showId){
    let show =await Show.findOne({_id:showId})
    let isUserAlreadyLiked=false;
    show.likes.forEach((user)=>{
        console.log(user)
        if(userId.equals(user._id))
            isUserAlreadyLiked=true;
    })
    if(!isUserAlreadyLiked)
        show.likes.push(userId)
    show.save();

}

module.exports={addNewShow,getShows,getShow,searchShowByName,updateShow,deleteShow,getApprovalPendingShows,approveShow,updateShowLikes}