const url = new URL(window.location.href)

window.addEventListener("DOMContentLoaded", function () {
    url.searchParams.set('page', currentpage)
    window.history.replaceState({},'', url)
})
function productIsActive(event, couponid) {
    const isActiveButton = event.currentTarget;
    let content = isActiveButton.textContent;
    fetch(`/admin/coupons/edit-coupon-active/${couponid}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.isActive == true) {
          isActiveButton.textContent = "true";
        } else {
          isActiveButton.textContent = "false";
        }
      })
      .catch((err) => {
        toastr.error("Something went wrong.")
      });
  }

  const orderstsu = "<%= orderStatus%>".split(',')
  const selectValue = 
  window.addEventListener("DOMContentLoaded", function () {

  })
  async function handleOrderStatus(event, orderid) {
    
    const value = event.target.value;
    if (!value) return;
  
    fetch(`${window.location.origin}/admin/orders/status/${orderid}`, {
      headers: { "Content-Type": "application/json" },
      method: "PUT",
      body: JSON.stringify({ status: value }),
    })
      .then((response) => response.json())
      .then((result) => {
        if (!result.message) {
          const row = event.target.closest("tr");
          const statusTd = row.querySelector("td:nth-child(6)");
          
          updateOrderStatusSpan(result.data.status, statusTd)
          return
        } else if (result.message) {
          toastr.warning(result.message)
          event.target.value = value
          
        }
      })
      .catch((err) => {
        toastr.error("Something went wrong.")
      });
  }
  
  function erroMessage(message,parentdiv, insertBefore) {
      const div = document.createElement('div')
      const span = document.createElement('span')
      div.classList.add("bg-red-100", "mb-4", "border", "border-red-400", "text-red-700", "px-4", "py-3", "rounded", );      
      div.role = "alert"
      span.classList.add("block", "sm:inline")
      span.textContent = message;
      div.appendChild(span)
      parentdiv.insertBefore(div, insertBefore)
      setTimeout(() => {
        div.remove()
      }, 4000);
  }

  function updateOrderStatusSpan(orderStatus, statusTd) {
  const orderStatusSpan = statusTd.querySelector('span');

  // Remove all existing child nodes from the span
  while (orderStatusSpan.firstChild) {
      orderStatusSpan.removeChild(orderStatusSpan.firstChild);
  }

  // Create a new text node with the order status
  const statusText = document.createTextNode(orderStatus);

  // Add classes based on the order status
  if (orderStatus === 'Failed' || orderStatus === 'Pending' || orderStatus === 'Cancelled') {
      orderStatusSpan.classList.add('px-2', 'py-1', 'font-semibold', 'leading-tight', 'text-orange-700', 'bg-orange-100', 'rounded-full', 'dark:text-white', 'dark:bg-orange-600');
  } else if (orderStatus === 'Placed' || orderStatus === 'Shipped' || orderStatus === 'Delivered') {
      orderStatusSpan.classList.add('px-2', 'py-1', 'font-semibold', 'leading-tight', 'text-green-700', 'bg-green-100', 'rounded-full', 'dark:text-white', 'dark:bg-green-600');
  }

  // Append the new text node to the orderStatusSpan
  orderStatusSpan.appendChild(statusText);
}
function clearFilter () {
  window.location.href = '/admin/orders'
}
async function paymentMethodFilter(event) {
  url.searchParams.set('payment_method', event.target.value)
  handleFilter()
}
async function orderStatusFilter (event) {
  url.searchParams.set('orderStatus', event.target.value)
  handleFilter()
}
async function handleDateFilter(event) {
  const date = event.target.value
  if(url.searchParams.get('date') === date) {
    return
  }
  if(date !== 'custom') {
    const params = url.searchParams;
    url.search = ''
    params.set('date', date)
    handleFilter()
  }else{
    const costomdateform = document.getElementById('costomdateform')
    costomdateform.style.display = 'flex'
    setMaxDate()
  }
}
function handleFilter () {
  url.searchParams.set('page', 1)
  window.location.href = `${url.pathname}?${url.searchParams}`
} 


async function handleCustomDateFilter (form) {
  event.preventDefault()
  const formData = new FormData(form)
  const obj = {}
  for(const [key , value] of formData.entries()) {
    obj[key] = value
  }
  if(!formData.get('start_date') || !formData.get('end_date')) {
    return 
  }
  const params = url.searchParams;
  url.search = ""
  
  params.set("date", "custom")
  params.set('start_date', formData.get('start_date'))
  params.set('end_date', formData.get('end_date'))
  handleFilter()
}

function setMaxDate() {
  const today = new Date().toISOString().split('T')[0];
 
  document.getElementById('start_date').setAttribute('max', today);
  document.getElementById('end_date').setAttribute('max', today);
}


