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
                contentType:show.coverImage.contentType,id:show._id}
    })
    // console.log(showList)
    return showList    
}
async function getShow(id){
    const show= await Show.findOne({_id:id})
    // console.log(show)
    if(show==null)
        return null;
    else  return  {
            title:show.title,
            coverImage:getImg(show.coverImage.data),
            secondImage:getImg(show.secondImage.data),
            main:show.main,
            sub:show.sub,
            likes:show.likes
        }
    
}

async function searchShowByName(title){
   
    const shows= await Show.find({title:title},null,{limit:10})
    // console.log(shows)
    let showList=shows.map((show)=>{
        
        // console.log(show.coverImage.contentType)
        return {title:show.title,
                id:show._id,
                coverImage:getImg(show.coverImage.data),
                contentType:show.coverImage.contentType,id:show._id}
    })
    // console.log(showList)
    return showList    
}


module.exports={addNewShow,getShows,getShow,searchShowByName}