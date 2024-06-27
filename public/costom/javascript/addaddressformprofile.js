function showMessage(message, status) {
    const errorDiv = document.createElement("div");
    if(status === "error") {
      errorDiv.classList.add("errorDiv");
    }
    if(status === "success") {
      errorDiv.classList.add("successdiv");
    }
    

    errorDiv.textContent = message;
    const form = document.getElementById('edit-address-form')
    form.insertBefore(errorDiv, form.firstChild);
    setTimeout(() => {
      errorDiv.remove();
    }, 4000);
  }    
  
  

    function handleSubmit(formInfo) {
      event.preventDefault();
  
      const formData = new FormData(formInfo);
      
      if (!formData.get("recipient_name").trim()) {
        return showMessage("Recipient Name is required", "error");
      } else if (!formData.get("mobile").trim()) {
        return showMessage("Mobile number is required", "error");
      } else if (!/^\d{10}$/.test(formData.get("mobile"))) {
        return showMessage("Enter valid mobile number", "error");
      } else if (!formData.get("postal_code").trim()) {
        return showMessage("Postal code is required", "error");
      } else if (formData.get("postal_code").match) {
        const pinRegex = /^[0-9]{6}$/;
        if (!pinRegex.test(formData.get("postal_code"))) {
          return showMessage("Only 6 numbers required","error");
        }
      } else if (!formData.get("street_address_line1").trim()) {
        return showMessage("Street address line1 is required","error");
      } else if (!formData.get("street_address_line2").trim()) {
        return showMessage("Street address line2 is required","error");
      } else if (!formData.get("city").trim()) {
        return showMessage("City is required","error");
      }
      const pin_code = formData.get("postal_code");
      fetch(`https://api.postalpincode.in/pincode/${pin_code}`)
        .then((response) => response.json())
        .then((data) => {
          const postOfficedata = data[0];
          if (
            postOfficedata.Status === "Success" &&
            postOfficedata.PostOffice.length > 0
          ) {
            if (postOfficedata.PostOffice[0].State !== "Kerala") {
              return showMessage(
                `Not Deliverable to this ${pin_code} pin code , Only accross Kerala`, "error"
              );
            }
          } else {
            return showMessage("Not a avalid pincode!.", "error");
          }
        })
        .catch((err) => {
          toastr.error("Something went wrong.")
        });
      let obj = {}
  
      for(const [name, value] of formData.entries()) {
          obj[name] = value
       }
  
      fetch(`/user/add-address`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(obj),
      })
      .then(response=> {
          return response.json()
      })
      .then(result=> {
          
          if(result.error) {
              return showMessage(result.error, "error")
          }else{
            showMessage("Address added successfully", "success")
            setTimeout(() => {
                window.location.reload()
            }, 3000);
          }
      })
      .catch(err=> {
          console.log(err)
      })
    }
  
    
  
    document.addEventListener("DOMContentLoaded", function () {
      document.getElementById('backbtn').href = document.referrer 
    })
  