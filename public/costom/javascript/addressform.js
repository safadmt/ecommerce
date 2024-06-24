function handleSubmit(formInfo) {
    event.preventDefault();

    const formData = new FormData(formInfo);
    console.log(...formData);
    if (!formData.get("recipient_name").trim()) {
      return showMessage("Recipient Name is required");
    } else if (!formData.get("mobile").trim()) {
      return showMessage("Mobile number is required");
    } else if (!formData.get("postal_code").trim()) {
      return showMessage("Postal code is required");
    } else if (formData.get("postal_code").match) {
      const pinRegex = /^[0-9]{6}$/;
      if (!pinRegex.test(formData.get("postal_code"))) {
        return showMessage("Only 6 numbers required");
      }
    } else if (!formData.get("street_address_line1").trim()) {
      return showMessage("Street address line1 is required");
    } else if (!formData.get("street_address_line2").trim()) {
      return showMessage("Street address line2 is required");
    } else if (!formData.get("city").trim()) {
      return showMessage("City is required");
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
              `Not Deliverable to this ${pin_code} pin code , Only accross Kerala`
            );
          }
        } else {
          return showMessage("Not a avalid pincode!.");
        }
      })
      .catch((err) => {
        console.log(err);
      });
    let obj = {}
    console.log("obj", obj)
    for (const [name, value] of formData.entries()) {
      obj[name] = value
    }

    fetch(`/user/add-address`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(obj),
    })
      .then(response => {
        return response.json()
      })
      .then(result => {
        console.log(result.error)
        if (result.error) {
          return showMessage(result.error)
        } else {
          window.location.href = '/user/checkout'
        }
      })
      .catch(err => {
        console.log(err)
      })
  }

  function showMessage(message) {
    
    const errorDiv = document.createElement("div");
    errorDiv.classList.add("text-danger");

    errorDiv.textContent = message;
    const form = document.getElementById("edit-address-form");
    document.querySelector('.buttondiv').insertBefore(errorDiv, document.getElementById('buttonsubmit'))
    // form.insertBefore(errorDiv, document.querySelector('.buttondiv'));
    setTimeout(() => {
      errorDiv.remove();
    }, 4000);
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('backbtn').href = document.referrer
  })
