window.addEventListener("DOMContentLoaded", function () {
  if (walletbalance < totalprice) {
    document.getElementById("f-option5").disabled = true;
  }
});

function radioButtonClick(event) {
  addressId = event.target.value; // Extract address ID from the value attribute
}

function radioPaymentMethodClick(event) {
  payment_method = event.target.value;
}

function showMessage(message, color) {
  const buttondiv = document.getElementById("place-order-div");
  const div = document.createElement("div");
  div.style.color = color;
  div.textContent = message;
  buttondiv.insertBefore(div, document.getElementById("place-order"));
  removeMessage(div);
}
async function placeOrder() {
  event.preventDefault();

  const buttondiv = document.getElementById("place-order-div");

  if (!addressId) {
    return showMessage("Please choose a valid address!", "red");
  }
  if (!payment_method) {
    return showMessage("Please choose a valid payment method", "red");
  }
  showMessage("Please wait. Processing your request", "green");
  try {
    const response = await fetch("/user/place-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addressId, payment_method }),
    });

    const data = await response.json();
    if (response.ok) {
      if (data.message === "redirect") {
        window.location.href = '/'
      }else if(data.message){
        return showMessage(data.message, "red");
      }
      if (data.status === "Pending") {
        await paywithrazorpay(data.order);
      } else if (data.status === "Placed") {
        window.location.href = `/order/confirmation/${data.orderid}`;
      } else if (data.status === "stripe") {
        window.location.href = data.stripeurl;
      }
    } else {
      console.log(order);
    }
  } catch (err) {
    
    showMessage("Something went wrong", "red");
  }
}

async function verifyPayment(info, orderid) {
  try {
    const response = await fetch("/user/payment-verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ response: info, orderid }),
    });
    const result = await response.json();
    return result;
  } catch (err) {
    return err;
  }
}

async function onPaymentFailed(info, orderid) {
  try {
    const response = await fetch("/user/payment-failed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ response: info, orderid }),
    });
    const result = await response.json();

    return result;
  } catch (err) {
    return err;
  }
}
function paywithrazorpay(order) {
  var options = {
    key: "rzp_test_OmbodPGPHNOPhe", // Enter the Key ID generated from the Dashboard
    amount: order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
    currency: "INR",
    name: "Safad",
    description: "Test Transaction",
    image: "https://example.com/your_logo",
    order_id: order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
    handler: function (response) {
      verifyPayment(response, order.receipt).then((response) => {
        if (response.message) {
          toastr.warning(response.message);
        } else {
          window.location.href = `/order/confirmation/${order.receipt}`;
        }
      });
    },
    notes: {
      address: "HELIO the watch store",
    },
    theme: {
      color: "#3399cc",
    },
  };
  const rzp1 = new Razorpay(options);
  rzp1.open();
  rzp1.on("payment.failed", function (response) {
    alert(response.error.description);

    alert(response.error.reason);
    alert(response.error.metadata.order_id);
    alert(response.error.metadata.payment_id);
    try {
      onPaymentFailed(response, order.receipt).then((response) => {
        if (response.message) {
          toastr.warning(response.message);
          showMessage(response.message, "red");
        } else {
        }
      });
    } catch (err) {
      console.log(err);
    }
  });
}

function copyToClipboard(couponCode) {
  // Create a temporary input element to hold the coupon code
  var tempInput = document.createElement("input");
  tempInput.value = couponCode;
  document.body.appendChild(tempInput);

  // Select the text in the input element
  tempInput.select();
  tempInput.setSelectionRange(0, 99999); // For mobile devices

  // Copy the selected text to the clipboard
  document.execCommand("copy");

  // Remove the temporary input element
  document.body.removeChild(tempInput);

  // Optionally, display a message to the user
  toastr.success("Coupon code copied: " + couponCode);
}

async function applyCoupon() {
  event.preventDefault();

  const coupon_code = document.getElementById("search_coupon").value;
  try {
    const response = await fetch("/user/checkout/coupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coupon_code: coupon_code }),
    });
    const result = await response.json();
    const messageDiv = document.createElement("div");
    const totalpricediv = document.getElementById("totalprice");
    const coupon_discountdiv = document.getElementById("coupon_discount");
    const shipping_chargediv = document.getElementById("shipping_charge");
    const cupon_area = document.querySelector(".cupon_area");

    if (response.ok) {
      if (walletbalance < result.totalprice) {
        document.getElementById("f-option5").disabled = true;
      } else {
        document.getElementById("f-option5").disabled = false;
      }
      messageDiv.textContent = "Coupon applied successfully!";
      messageDiv.style.color = "green";
      cupon_area.insertBefore(
        messageDiv,
        document.getElementById("search_coupon")
      );
      removeMessage(messageDiv);
      totalpricediv.textContent = result.totalprice;

      coupon_discountdiv.textContent = "Rs." + result.coupon_discount;
      shipping_chargediv.textContent = "Rs." + result.shipping_charge;
    } else {
      messageDiv.textContent = result.message;
      messageDiv.style.color = "red";
      cupon_area.insertBefore(
        messageDiv,
        document.getElementById("search_coupon")
      );
      removeMessage(messageDiv);
    }

    insertAfter(document.querySelector(".searchcouponformdiv h4"), messageDiv);
  } catch (error) {
    const errorMessageDiv = document.createElement("div");
    errorMessageDiv.textContent = "An error occurred. Please try again.";
    errorMessageDiv.style.color = "red";
    insertAfter(
      document.querySelector(".searchcouponformdiv h4"),
      errorMessageDiv
    );
    removeMessage(errorMessageDiv);
  }
}
function removeMessage(element) {
  setTimeout(() => {
    element.remove();
  }, 4000);
}
function insertAfter(referenceNode, newNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}
