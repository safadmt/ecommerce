function openModal(modalId) {
    document.getElementById(modalId).classList.remove("hidden");
    document.getElementById("overlay").classList.remove("hidden");
  }

  function closeModal(modalId) {
    document.getElementById(modalId).classList.add("hidden");
    document.getElementById("overlay").classList.add("hidden");
  }
  function showMessage(message,color ) {
    const buttondiv = document.getElementById("edit-password-form");
    const div = document.createElement("div");
    div.style.color = color;
      div.textContent = message;
      buttondiv.insertBefore(div, document.querySelector('add-money'))
      removeMessage(div);
  }
  async function placeOrder() {
    event.preventDefault()
    const cash_wallet = document.getElementById('cash_wallet').value
    if(!cash_wallet) return
    const buttondiv = document.getElementById("edit-password-form");
    showMessage("Please wait. Processing your request", "green")
    try{
const response = await fetch("/user/profile/add-cash-to-wallet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cash_wallet}),
    })
      
    const data = await response.json();
    if(response.ok) {
      if(data.message) {
        return showMessage(data.message, "red")
      }else{
        paywithrazorpay(data.payment, data.username)
      }
      
    }
    }catch(err) {
      console.log(err)
      showMessage("Something went wrong", "red")
    }
    
        
      
  }

  async function verifyPayment (info,orderid) {
    try{
    const response = await fetch('/user/profile/wallet/verify-payment', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({response: info, orderid})
    })
    const result = await response.json()
    return result
    }catch(err) {
      return err
    }
    
  }

  
function paywithrazorpay(payment,username) {
    var options = {
      key: 'rzp_test_OmbodPGPHNOPhe', // Enter the Key ID generated from the Dashboard
      amount: payment.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
      currency: "INR",
      name: username,
      description: "Test Transaction",
      image: "https://example.com/your_logo",
      order_id: payment.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
      handler: function (response) {
        verifyPayment(response, payment.receipt)
        .then(response=> {
          if(response.message) {    
            console.log(response.message)
          }else{
            console.log(response)
            window.location.reload()
          }
        })

      },
      notes: {
        address: "HELIO the watch store",
      },
      theme: {
        color: "#3399cc",
      },
    };
    const rzp1 = new Razorpay(options);
    rzp1.open()
    rzp1.on("payment.failed", function (response) {

     
      alert(response.error.description);
      
      alert(response.error.reason);
      
    });
  }

  
  function removeMessage(element) {
    setTimeout(() => {
      element.remove();
    }, 4000);
  }
  function insertAfter(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  }