const discount_span = document.getElementById('discount_type_warning')
const valid_till_warning = document.getElementById('valid_till_warning')
const coupon_code_warning = document.getElementById('couponcodeinput_warning')
const discount_value_warning = document.getElementById('discount_value_warning')
const minimum_purchase_value_warning = document.getElementById('minimum_purchase_value_warning')
const description_span_warning = document.getElementById('description_warning')


function generateCoupon () {
    event.preventDefault()
    fetch(`${window.location.origin}/admin/generate-coupon-code`)
        .then((response) => response.json())
        .then((data) => {
          if (!data.error) {
            document.getElementById('couponcodeinput').value = data.coupon_code
          }
        })
        .catch((err) => {
          document.getElementById('coupon_code_span').textContent = err
        });
}


function validateInput(input) {
  if(input.id === "valid_till") {
    return
  }
  const warningSpan = document.getElementById(input.id + '_warning');
  if (input.value.trim() === '') {
    document.getElementById('submitbutton').disabled = true;
    warningSpan.textContent = 'This field is required.';
  } else {
    document.getElementById('submitbutton').disabled = false;
    warningSpan.textContent = '';
  }
}

function handleSubmit(formElement) {
    let valid = true;
    event.preventDefault();
    const formData = new FormData(formElement);
    const discount_value = parseInt(formData.get("discount_value"));
    const obj = {};
    for (const [name, value] of formData.entries()) {
      obj[name] = value;
    }
    console.log(obj);
    if (!formData.get("coupon_code").trim()) {
      valid = false;
      coupon_code_warning.textContent = "coupon code is required";
    }
    if (!formData.get("description").trim()) {
      valid = false;
      description_span_warning.textContent = "Description is required";
    }
    if(!formData.get("discount_type").trim()) {
      valid = false;
      discount_span.textContent = "Discount type is required"
    }
    if (formData.get("discount_type") === "percentage") {
      if (!formData.get("discount_value").trim()) {
        valid = false;
         discount_value_warning.textContent = "Discount value is required";
      }
      if (discount_value > 70) {
        valid = false;
         discount_value_warning.textContent = "Discount percentage not greater than 70 %";
      }
    }
    
    if (!formData.get("minimum_purchase_value").trim()) {
      valid = false;
       minimum_purchase_value_warning.textContent = "Minimum Purchase Value is required";
    }
    if(!valid) {
      return
    }
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
      const response = JSON.parse(xhttp.response);
      console.log(response);
      if (response) {
        const successdiv = document.createElement("div");
        successdiv.classList.add("text-green-500");

        successdiv.textContent = "Coupon added successfully";
        const form = document.querySelector(".buttondiv");
        form.insertBefore(successdiv, document.getElementById("submitbutton"));
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    }
    xhttp.open("POST", `${window.location.origin}/admin/coupons/add-coupon`, true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(obj));
  }

  function showMessage(message) {
    const errorDiv = document.createElement("div");
    errorDiv.classList.add("text-orange-700");

    errorDiv.textContent = message;
    const form = document.querySelector(".buttondiv");
    form.insertBefore(errorDiv, document.getElementById("submitbutton"));
    setTimeout(() => {
      errorDiv.remove();
    }, 4000);
  }

  function handleDiscountTypeChange(event) {
    const input = document.getElementById("discount_value");
    const label = document.getElementById("discount_value_label");
    if (event.target.value === "free_shipping") {
      discount_value_warning.textContent =
        "Discount value is disabled when you choosen Free shipping";
      input.disabled = true;
      input.style.backgroundColor = "#a9a9a9";
      input.style.color = "#888";
      input.style.cursor = not - allowed;
    } else if (event.target.value === "percentage") {
      document.getElementById("discount_value").disabled = false;
      discount_value_warning.textContent = "Discount in Percentage";
      input.style.backgroundColor = "#fff";
      input.style.color = "rgb(82, 77, 77)";
    } else if (event.target.value === "fixed_amount") {
      discount_value_warning.textContent = "Discount Value";
      input.disabled = false;
      input.style.backgroundColor = "#fff";
      input.style.color = "rgb(82, 77, 77)";
    }
  }

  function discountValueChange(event) {
    const type = document.getElementById("discount_type").value;
    console.log(type);
    const discount_value = document.getElementById("discount_value");
    if (type === "percentage") {
      const value = event.target.value;
      const val = parseInt(value);
      if (val > 70) {
        return showMessage("Discount percentage not greater than 70 %");
      }
    }
  }