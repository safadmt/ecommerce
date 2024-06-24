function handleSendOTP () {
    event.preventDefault()
    console.log("hello again")
    const email = document.getElementById('email').value
    console.log(email)
    if(!email.trim()) {
        return 
    }
    const emailbutton = document.getElementById('emailbutton')
    const emailbtn = document.getElementById('emailbtn')
    showMessage("Please wait", "green",emailbutton, emailbtn )
    fetch(`${window.location.origin}/auth/forgot-password`, {
  method: "POST",
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({email})
})
  .then((response) => response.json())
  .then((data) => {
    if (data.message) {
      alert(data.message);
    } else {
      const otpinput = document.getElementById('otpinput')
        const otp_button = document.getElementById('otp_button')
        const emailbutton = document.getElementById('emailbutton')

      otpinput.classList.remove('hidden')
      otp_button.classList.remove('hidden')
      emailbutton.classList.add('hidden')

    }
  })
  .catch((err) => {
    alert(err);
  });

}

function handleVerifyOTP (event) {
    event.preventDefault()
    
const maindiv = document.getElementById('otp_button')
        const otpbtn = document.getElementById('otpbtn')
    const otp = document.getElementById('otp').value
    if(!otp) return 
    console.log(otp, "value")
    if(otp.length !== 6) {  
        
        return showMessage("OTP length only 6 digit long", "red", maindiv, otpbtn)
    }
    console.log("oTP", otp)
fetch(`${window.location.origin}/auth/forgot-password/verify-otp`, {
  method: "POST",
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({otp: otp})
})
  .then((response) => response.json())
  .then((data) => {
    console.log(data)
    if (data.message) {
      alert(data.message);
      window.location.href = data.url
    } else {
      alert('OTP verified successfully')
      window.location.href = data.data.url

    }
  })
  .catch((err) => {
    console.log(err)
  });
}


function showMessage(message, color, maindiv, insetBeforeelem) {
const div = document.createElement("div");
div.style.color = color;
div.textContent = message;
maindiv.insertBefore(div, insetBeforeelem);
removeMessage(div);
}

function removeMessage(div) {
setTimeout(() => {
    div.remove()
}, 3000);
}