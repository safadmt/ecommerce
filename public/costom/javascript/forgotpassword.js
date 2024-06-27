function handleSendOTP (event) {
    event.preventDefault()
    const email = document.getElementById('email').value
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
      toastr.warning(data.message);
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
    if(otp.length !== 6) {  
        
        return showMessage("OTP length only 6 digit long", "red", maindiv, otpbtn)
    }
fetch(`${window.location.origin}/auth/forgot-password/verify-otp`, {
  method: "POST",
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({otp: otp})
})
  .then((response) => response.json())
  .then((data) => {
    if (data.message) {
      toastr.warning(data.message);
      window.location.href = `${window.location.origin}${data.url}`
    } else {
      toastr.success('OTP verified successfully')

      window.location.href = `${window.location.origin}${data.data.url}`

    }
  })
  .catch((err) => {
    toastr.error("Something went wrong.")  });
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