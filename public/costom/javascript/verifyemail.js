const errordiv = document.getElementById('errordiv');
const countdown = document.getElementById('countdown');
const otpInput = document.getElementById('otpvalue')
const successdiv = document.getElementById('successdiv')
let countdownTimer;

document.getElementById('submitbtn').disabled = true

function clear (element) {
    setTimeout(() => {
        element.textContent = ""
    }, 4000);
}
function startCountdown() {
    let seconds = 90;
    countdownTimer = setInterval(() => {
        countdown.textContent = `OTP expires in ${seconds} seconds`;
        seconds--;
        if (seconds < 0) {
            clearInterval(countdownTimer);
            countdown.textContent = "OTP expired!";
            clear(countdown)
            document.getElementById('otp').disabled = true;
            document.getElementById('submitbtn').disabled = true;
        }
    }, 1000);
}


// startCountdown()

function handleVerifyEmail(e) {
    e.preventDefault();
    const otp = otpInput.value
    
    if(!otp) return errordiv.textContent = "Required Field"
    clear(errordiv)
    const xhttp =  new XMLHttpRequest()
    xhttp.onload = function() {
      let response = JSON.parse(xhttp.response)
      if(response.error) {
          errordiv.textContent = response.error
          clearError(errorDiv)
          return
      }else if(response.validation_error) {
        if(validation_error.username) {
            errordiv.textContent = response.validation_error
          clearError(errorDiv)
          return
        }else if(validation_error.mobile) {
            errordiv.textContent = response.validation_error
          clearError(errorDiv)
          return
        }else if(validation_error.email) {
            errordiv.textContent = response.validation_error
          clearError(errorDiv)
          return
        }else if(validation_error.password) {
            errordiv.textContent = response.validation_error
          clearError(errorDiv)
          return
        }
        
      }
      window.location.href =  "/auth/login"

      
  }
  xhttp.open('POST', `${window.location.origin}/auth/signup` ,true)
      xhttp.setRequestHeader('Content-Type','application/json')
      xhttp.send(JSON.stringify({otp:otp}))


}

function handleResendOTP(e) {
    e.preventDefault()
    const xhttp = new XMLHttpRequest()

    xhttp.onload = function () {
        let response = JSON.parse(xhttp.response)
        if(response.error) {
            errordiv.textContent = response.error
            clear(errorDiv)
          return
        }else{
            successdiv.textContent = response.data
            clear(successdiv)
            return
        }

    }

    xhttp.open('GET', `${window.location.origin}/auth/resend-otp` ,true)
    
    xhttp.send()
}