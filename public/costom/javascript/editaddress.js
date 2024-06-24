function handleSubmit(formInfo, addressid) {
    event.preventDefault();

    const formData = new FormData(formInfo);
    console.log(...formData);
    if (!formData.get("recipient_name")) {
      return showMessage("Recipient Name is required");
    } else if (!formData.get("mobile")) {
      return showMessage("Mobile number is required");
    } else if (!formData.get("postal_code")) {
      return showMessage("Postal code is required");
    } else if (formData.get("postal_code").match) {
      const pinRegex = /^[0-9]{6}$/;
      if (!pinRegex.test(formData.get("postal_code"))) {
        return showMessage("Only 6 numbers required");
      }
    } else if (!formData.get("recipient_name")) {
      return showMessage("Recipient Name is required");
    } else if (!formData.get("street_address_line1")) {
      return showMessage("Street address line1 is required");
    } else if (!formData.get("street_address_line2")) {
      return showMessage("Street address line2 is required");
    } else if (!formData.get("city")) {
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
    let obj = {};
    for (const [name, value] of formData.entries()) {
      obj[name] = value;
    }

    fetch(`/user/profile/manage-address/edit/${addressid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(obj),
    })
      .then((response) => {
        return response.json();
      })
      .then((response) => {
        console.log(response);
        if (response.message) {
          return showMessage(response.error, "error");
        } else {
          return showMessage("Updated successfully", "success")
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

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