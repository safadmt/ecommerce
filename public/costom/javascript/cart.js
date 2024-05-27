function addToCart(event, productid) {
    console.log(productid)
    fetch(`http://localhost:5000/user/add-to-cart/${productid}`, {
          method: 'get',
      }).then(response=> response.json())
      .then(data=> {
        console.log(data)
        if(data.error) {

        }else if(data.response) {
          document.getElementById('cart-count').innerHTML = data.response.count
        } 
  })
  }


  async function addToWishlist (event,productid) {
      if(!productid) return console.log("productid not found")
     
      try{
          const response = await fetch(`/user/wishlist/add/${productid}`,{
              headers: {
              'X-Requested-With': 'XMLHttpRequest' // Set the X-Requested-With header
              }
          })
          const result = await response.json()
          console.log(result)
          if(response.ok) {
              
                  document.getElementById('wishlist-count').innerHTML = result.wishlistcount
              
              
          }else{
              if(result.message === 'login') {
                  window.location.href = '/auth/login'
              }else{
                  console.log(result)
              }
          }
      }catch(err) {
          console.log(err)
      }
  }