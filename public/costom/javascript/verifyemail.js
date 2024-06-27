const countdown = document.getElementById("countdown");
const otpInput = document.getElementById("otpvalue");
const successdiv = document.getElementById("successdiv");
let countdownTimer;

function clear(element) {
  setTimeout(() => {
    element.textContent = "";
  }, 3000);
}

function handleVerifyEmail(e) {
  e.preventDefault();
  const errordiv = document.getElementById("errordiv");
  const otp = otpInput.value;

  if (!otp) return (errordiv.textContent = "Required Field");
  const verifyotpspan = document.getElementById("verifyotpspan");
  verifyotpspan.classList.add("txt-sm", "text-success");
  verifyotpspan.textContent = "Please wait. Processing";
  clear(verifyotpspan);
  clear(errordiv);
  const xhttp = new XMLHttpRequest();
  xhttp.onload = function () {
    let response = JSON.parse(xhttp.response);
    if (response?.data && response.data == "Ok") {
      window.location.href = `${window.location.origin}${response.url}`;
    }
    if (response.error === "redirect") {
      window.location.href = `${window.location.origin}/${response.url}`;
    } else if (response.error !== "redirect") {
      errordiv.textContent = response.error;
      clear(errordiv);
      return;
    } else if (response.validation_error) {
      if (validation_error.username) {
        errordiv.textContent = response.validation_error;
        clear(errordiv);
        return;
      } else if (validation_error.mobile) {
        errordiv.textContent = response.validation_error;
        clear(errordiv);
        return;
      } else if (validation_error.email) {
        errordiv.textContent = response.validation_error;
        clear(errordiv);
        return;
      } else if (validation_error.password) {
        errordiv.textContent = response.validation_error;
        clear(errordiv);
        return;
      }
    }
    
  };
  console.log(otp);
  xhttp.open("POST", `${window.location.origin}/auth/signup`, true);
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.send(JSON.stringify({ otp: otp }));
}

function handleResendOTP(e) {
  e.preventDefault();
  const xhttp = new XMLHttpRequest();

  xhttp.onload = function () {
    let response = JSON.parse(xhttp.response);
    if (response.error) {
      errordiv.textContent = response.error;
      clear(errordiv);
      return;
    } else {
      successdiv.textContent = response.data;
      clear(successdiv);
      return;
    }
  };

  xhttp.open("GET", `${window.location.origin}/auth/resend-otp`, true);

  xhttp.send();
}
