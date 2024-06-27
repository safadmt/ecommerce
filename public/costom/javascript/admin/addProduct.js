function handleSubmit(formElement,event) {
    event.preventDefault();
    const files = document.getElementById("files").files;
    const obj = {};
    let valid = true;
    const formData = new FormData(formElement);
    for (const [name, value] of formData.entries()) {
      obj[name] = value;
    }
    
  
    if (!formData.get("product_name").trim()) {
      valid = false
      showMessage("product_name","Name is required");
    }
    if (!formData.get("description").trim()) {
      valid = false
      showMessage("description", "Description is required");
    }
    if (!formData.get("brand")) {
      valid = false
      showMessage("brand","Brand is required");
    }
    if (!formData.get("type")) {
      valid = false
      showMessage("type","Watch Type is required");
    }
    if (!formData.get("price")) {
      valid = false
      showMessage("price","Price is required");
    }
    if (!formData.get("isBlocked")) {
      valid = false
      showMessage("isBlocked","Select true or false");
    }
    if (formData.get("discount_in_percentage")) {
      const discount = parseInt(formData.get("discount_in_percentage"));
      if (discount > 70) {
        valid = false
        showMessage("discount_in_percentage","Discount percentage not greater than 70%");
      }
    }
    if (!formData.get("stock_available")) {
      valid = false
      showMessage("stock_available","Stock available is required");
    }
    if (!formData.get("gender")) {
      valid = false
      showMessage("gender","Gender is required");
    }
    
    if (files.length === 0) {
      valid = false
      showMessage("files","Image is required");
    }
    if(!valid) {
      return
    }
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
      const response = JSON.parse(xhttp.response);
      if (response.error) {
        return toastr.error(response.error);
      }else if (response.validation_error) {
        if (validation_error.product_name) {
          toastr.warning(response.validation_error.product_name);
          return;
        } else if (validation_error.brand) {
          toastr.warning(response.validation_error.brand);
          return;
        } else if (validation_error.description) {
          toastr.warning(response.validation_error.description);
          return;
        } else if (validation_error.type) {
          toastr.warning(response.validation_error.type);
          return;
        }
        else if (validation_error.gender) {
          toastr.warning(response.validation_error.gender);
          return;
        }else if (validation_error.price) {
          toastr.warning(response.validation_error.price);
          return;
        }else if (validation_error.isActive) {
          toastr.warning(response.validation_error.isActive);
          return;
        }else if (validation_error.stock_available) {
          toastr.warning(response.validation_error.stock_available);
          return;
        }
      }else if (response === "Ok") {
        toastr.success("Product added successfully")
        setTimeout(() => {
          window.location.reload()
        }, 2000);
      } 
    };
    xhttp.open(
      "POST",
      `${window.location.origin}/admin/products/add-product`,
      true
    );
    xhttp.send(formData);
  }


  
  function showMessage(inputname, message) {
    document.getElementById(inputname + "_warning").textContent = message
  }

function selectOptionChange (e) {
  const message_span = document.getElementById(e.id + '_warning')
  switch (e.name) {
    case 'brand':
      showWarning(e,message_span,  "Select a valid Brand")
      break;
    case 'type':
     showWarning(e,message_span, "Select a valid Type")
      break;
    case 'isBlocked':
        showWarning(e, message_span, "Select true or false") 
      break;
    case 'gender':
        showWarning(e,message_span,"Select Gender")
        break;
    default:
      console.log("something else")
      break;
  }

}

function showWarning (e, message_span,message) {
  const submitbutton = document.getElementById('submitbutton')
  console.log("hello",e.value)
  if(e.value.trim() === "") {
    message_span.textContent = message
    submitbutton.disabled = true;
  }else {
    message_span.textContent = ""
    submitbutton.disabled = false;
  }
}
function validateInput (e) {
  const submitbutton = document.getElementById('submitbutton')
  const warning_span = document.getElementById(e.id + '_warning')
  
  switch (e.name) {
    case 'product_name':
      
        showWarning(e,warning_span, "Product name is required")
      
      break;
    case 'price':
      showWarning(e,warning_span, "Price is required")
      break;
    case 'discount_in_percentage':
      if(e.value) {
      const discount = e.value
      if (discount > 70) {
        warning_span.textContent = "Discount percentage not greater than 70%";
        submitbutton.disabled = true
      }else{
        warning_span.textContent = ""
        submitbutton.disabled = false
      }
      }else{
        warning_span.textContent = ""
        submitbutton.disabled = false
      }
      break;
    case 'stock_available':
      showWarning(e,warning_span, "Stock available is required")
      break;
    case 'description':
      showWarning(e,warning_span, "Description is required")
      break;
    case 'files':
      showWarning(e,warning_span, "Image is required")
      break;
    default:
      break;
  }
}