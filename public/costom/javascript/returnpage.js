let product_qty = "";
  let retunreason = "";
  let return_refund_status = "";
  const product_qty_span = document.getElementById("product_qty_span");
  const return_reason_span = document.getElementById("return_reason_span");
  const refundcoption_span = document.getElementById("refundcoption_span");

  function handleRefundOptionChange(event) {
    return_refund_status = event.target.value;
    refundcoption_span.textContent = "";
  }
  function handleQuantityChange(event) {
    product_qty = event.target.value;
    product_qty_span.textContent = "";
  }
  function handleReasonOptionChange(event) {
    retunreason = event.target.value;
    return_reason_span.textContent = "";
  }

  async function handleSubmit(event, orderid, productid, totalquantity) {
    event.preventDefault();

    
    if (totalquantity > 1) {
      if (!product_qty) {
        product_qty_span.textContent =
          "Please select a quantity you want to return.";
      }
    }
    if (!retunreason) {
      return_reason_span.textContent = "Please select a specific return reason";
    }

    if (!return_refund_status) {
      refundcoption_span.textContent = "Please choose a refund option";
    }
    if (!retunreason || !return_refund_status) {
      return;
    }

    try {
      const response = await fetch(
        `/user/profile/return/${orderid}/${productid}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            return_reason: retunreason,
            product_qty,
            refund_option: return_refund_status,
          }),
        }
      );

      const result = await response.json();
      if (response.ok) {
        toastr.success("Return placed successfully")
        
        window.location.href = '/user/profile/orders'
      }else{
        if(result.message) {
          toastr.warning(result.message)
        }
      }
    } catch (err) {
      toastr.error("Something went wrong.");
    }
  }

  function showMessage(elem, message) {
    elem.taxtContent = message;
  }