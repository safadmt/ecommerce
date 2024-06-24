function productIsActive (event, productid) {
    const isActiveButton = event.currentTarget
    let content = isActiveButton.textContent
    
    console.log(content)
    fetch(`/admin/products/edit-product-active/${productid}`, 
    {method: 'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({isActive: content})
  })
    .then(response=> response.json())
    .then(data=> {
      if (data) {
        const row = isActiveButton.closest('tr');
        const activeTd = row.getElementsByTagName('td')[9]; // Index of the 'Active' td
        const activeSpan = activeTd.getElementsByTagName('span')[0];
        if(data.isActive) {
          activeSpan.textContent = 'true' 

        isActiveButton.innerHTML = 'Inactive' 

        }else{
          activeSpan.textContent = 'false' 

        isActiveButton.innerHTML = 'Active' 
        }
        
      }
    })
    .catch(err=> {
      console.log(err)
    })
  }

  function productIsReturnable (event, productid) {
    const isActiveButton = event.currentTarget
    let content = isActiveButton.textContent
    
    console.log(content.trim())
    fetch(`/admin/products/edit-product-returnble/${productid}`, 
    {method: 'PATCH',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({returnable : content.trim()})
  })
    .then(response=> response.json())
    .then(data=> {
      if (!data.message) {
        
        const row = isActiveButton.closest('tr');
        const activeTd = row.getElementsByTagName('td')[7]; // Index of the 'Active' td
        const activeSpan = activeTd.getElementsByTagName('span')[0];
        if(data.returnable) {
          activeSpan.textContent = 'true' 

        }else{
          activeSpan.textContent = 'false' 

        }
        
      }else{
        console.log(err)
      }
    })
    .catch(err=> {
      console.log(err)
    })
  }