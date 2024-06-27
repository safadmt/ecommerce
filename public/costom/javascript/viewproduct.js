function handleImage (event, imageurl) {
    const mainimg = document.getElementById('mainimg')
    mainimg.src = `/products/images/${imageurl}`
} 



document.querySelectorAll('input[name="rating"]').forEach(item=> {
    item.addEventListener('change', function (event) {
         
        fetch(`/product/rating/${productid}`, {
            headers: {'Content-Type':'application/json'},
            method: 'POST',
            body: JSON.stringify({rating: this.value})
        })
        .then(response=> response.json())
        .then(result=> {
            const commentform =  document.getElementById('commentform')
                const star_rating =  document.querySelector('.star-rating')
            if(result.message) {
                

                return showMessage(result.message , "red", commentform, star_rating)
            }else if(result.data) {
                showMessage("Saved successfully" , "green", commentform, star_rating)
                setTimeout(() => {
                window.location.reload()
            }, 2000);
            }
        }).catch(err=> {
            toastr.error("Something went wrong.")
        })
    })
})
async function handleReviewandRating () {
    event.preventDefault()
    try{
        const review = document.getElementById('comment').value
        const button = document.getElementById('commentbtn')
        const commentdiv = document.getElementById('commentdiv')
        
        if(!review.trim()) {
            return 
        }
        const response = await fetch(`/product/review/${productid}`, {
            headers: {'Content-Type':'application/json'},
            method: 'POST',
            body: JSON.stringify({comment:review})
        })
        const result = await response.json()
        if(result.message) {
            return showMessage(result.message, "red", commentdiv, button)
        }else if(result.data){
            showMessage("Review saved successfully", "green", commentdiv, button)
            setTimeout(() => {
                window.location.reload()
            }, 2000);
        }
    }catch(err) {
        toastr.error("Something went wrong.")
    }
}
function showMessage(message,color, parentdiv, childdiv ) {

const div = document.createElement("div");
div.style.color = color;
div.style.marginLeft = '1rem'
  div.textContent = message;
  parentdiv.insertBefore(div, childdiv)
  removeMessage(div);
}

function removeMessage(element) {
setTimeout(() => {
  element.remove();
}, 4000);
}