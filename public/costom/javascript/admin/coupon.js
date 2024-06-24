function productIsActive (event, couponid) {
    const isActiveButton = event.currentTarget
    let content = isActiveButton.textContent
    console.log(isActiveButton.textContent)
    console.log(content)
    fetch(`/admin/coupons/edit-coupon-active/${couponid}`, 
    {method: 'PATCH',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({content})
  })
    .then(response=> response.json())
    .then(data=> {
      console.log(data)
      if(data.isActive == true) {
        isActiveButton.textContent = "true"
      }else{
        isActiveButton.textContent = "false"
      }
    })
    .catch(err=> {
      console.log(err)
    })
  }

  function handleDelete(event,couponid) {
    event.preventDefault()
    if(window.confirm("Do you want delete this coupon permenantly")) {
      
    const row = event.target.closest('tr')
    
    fetch(`/admin/coupons/delete/${couponid}`, {
      method: 'DELETE',

    })
    .then(response=> response.json())
    .then(data=> {
      if(data === "Ok") {
        row.remove()
      }
    })
    }
    
  }