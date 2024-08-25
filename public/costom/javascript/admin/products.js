const url = new URL(window.location.href)

window.addEventListener("DOMContentLoaded", function () {
  url.searchParams.set('page', currentpage)
  window.history.replaceState({},'', url)
})

function productIsActive (event, productid) {
    const isActiveButton = event.currentTarget
    let content = isActiveButton.textContent
    
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
      toastr.error("Something went wrong.")
    })
  }

  function handlePriceFilter(event) {
    url.searchParams.set('price', event.target.value)
    handleFilter()
  }
  function handleProductIsActiveFilter(event) {
    url.searchParams.set('isActive', event.target.value)
    handleFilter()
  } 
  function handleStockAvailableFilter(event) {
    url.searchParams.set('stock_available', event.target.value)
    handleFilter()
  }
  function handleFilter () {
    url.searchParams.set('page', 1)
    window.location.href = `${url.pathname}?${url.searchParams}`
  }

  function clearFilter () {
    window.location.href = '/admin/products'
  }
  function productIsReturnable (event, productid) {
    const isActiveButton = event.currentTarget
    let content = isActiveButton.textContent
    
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
        
      }
    })
    .catch(err=> {
      toastr.error("Something went wrong.")
    })
  }