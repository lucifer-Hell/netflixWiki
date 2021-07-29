let menuIcon=document.getElementById("menuIcon")
let mobileMenu=document.getElementById("mobileMenu")
menuIcon.addEventListener('click',()=>{
    // console.log(mobileMenu.classList)
    if(mobileMenu.classList.contains('hidden'))
        {
            mobileMenu.classList.remove('hidden')
            mobileMenu.classList.add('flex')
        }
    else {
        
            mobileMenu.classList.add('hidden')
            mobileMenu.classList.remove('flex')
    }
})


function clickedMe(e){
    console.log(e)
}
