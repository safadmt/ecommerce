window.addEventListener("DOMContentLoaded", function () {
    const discount_type = document.getElementById("discount_type").value;
    const discount_value = document.getElementById("discount_value");
    const discount_value_label = document.getElementById(
      "discount_value_label"
    );
    if (discount_type === "free_shipping") {
      discount_value.disabled = true;
      discount_value_label.textContent =
        "Discount value is disabled when you choosen Free shipping";
      discount_value.style.backgroundColor = "#a9a9a9";
      discount_value.style.color = "#888";
      discount_value.style.cursor = not - allowed;
    }
  });
  function handleSubmit(formElement, couponid) {
    event.preventDefault();
    const formData = new FormData(formElement);
    const discount_value = parseInt(formData.get("discount_value"));
    const obj = {};
    for (const [name, value] of formData.entries()) {
      obj[name] = value;
    }
    console.log(obj);
    if (!formData.get("coupon_code").trim()) {
      return showMessage("coupon code is required");
    }

    if (formData.get("discount_type") === "percentage") {
      if (!formData.get("discount_value")) {
        return showMessage("Discount Percentage is required");
      }
      if (discount_value > 70) {
        return showMessage("Discount percentage not greater than 70 %");
      }
    }
    if (formData.get("discount_type") === "fixed_amount") {
      if (!formData.get("discount_value")) {
        return showMessage("Discount Percentage is required");
      }
    }
    if (!formData.get("minimum_purchase_value").trim()) {
      return showMessage("Minimum Purchase Value is required");
    }

    if (!formData.get("description").trim()) {
      return showMessage("Description is required");
    }

    const xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
      const response = JSON.parse(xhttp.response);
      console.log(response);
      if (response) {
        const successdiv = document.createElement("div");
        successdiv.classList.add("text-green-600");

        successdiv.textContent = "Coupon added successfully";
        const form = document.querySelector(".buttondiv");
        form.insertBefore(successdiv, document.getElementById("submitbutton"));
      }
    };
    // console.log(couponid)
    xhttp.open(
      "PUT",
      `${window.location.origin}/admin/coupons/edit/${couponid}`,
      true
    );
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(obj));
  }

  function showMessage(message) {
    const errorDiv = document.createElement("div");
    errorDiv.classList.add("text-red-700");

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
      label.textContent =
        "Discount value is disabled when you choosen Free shipping";
      input.disabled = true;
      input.style.backgroundColor = "#a9a9a9";
      input.style.color = "#888";
      input.style.cursor = not - allowed;
    } else if (event.target.value === "percentage") {
      document.getElementById("discount_value").disabled = false;
      label.textContent = "Discount in Percentage";
      input.style.backgroundColor = "#fff";
      input.style.color = "rgb(82, 77, 77)";
    } else if (event.target.value === "fixed_amount") {
      label.textContent = "Discount Value";
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

