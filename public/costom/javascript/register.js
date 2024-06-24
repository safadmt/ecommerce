const username_span = document.getElementById('username_span')
    const email_span = document.getElementById('email_span')
    const mobile_span = document.getElementById('mobile_span')
    const password_span = document.getElementById('password_span')

  function usernameChange(event) {
    const username = event.target.value.trim();
    if(!username) {
        username_span.textContent = "Username is required"
    }else {
        username_span.textContent = ""
    }
  } 

  function passwordChange(event) {
    const password = event.target.value.trim()
    if(!password) {
        password_span.textContent = "Password is required"
    }else if(password.length < 8) {
        password_span.textContent = "Password length must be 8 charactors long"
    }else if(password.length > 20) {
        password_span.textContent = "Password length not exceeds 20 charactors"
    }else {
        password_span.textContent = ""
    }
} 

function mobileNumberChange(event) {
    const mobile = event.target.value.trim();
      if (!mobile) {
        mobile_span.textContent = "Mobile number is required";
      } else if (!/^\d{10}$/.test(mobile)) {
        mobile_span.textContent = "Not a valid mobile number";
      } else {
        mobile_span.textContent = "";
      }
} 

function emailChange(event) {
    const email = event.target.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email) {
        email_span.textContent = "Email is required";
      } else if (!emailRegex.test(email)) {
        email_span.textContent = "Invalid email format";
      } else {
        email_span.textContent = "";
      }
} 
  const errordiv = document.getElementById('errordiv');
  function clear (element) {
      setTimeout(() => {
          errordiv.textContent = ""
      }, 4000);
  }
  function handleSubmit(e) {
      e.preventDefault()

  const username = document.getElementById('username').value
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value
  const mobile = document.getElementById('mobile').value
    console.log("mobileddd",mobile)
      if(!username.trim()) {
          username_span.textContent ="Username is required"
          return
      }else if(!password.trim()) {
          password_span.textContent = "Password is required"
          return
      }else if(!email.trim()) {
          email_span.textContent = "Email is required"
          return
      }else if(!mobile.trim()) {
          mobile_span.textContent = "Mobile number is required"
          return
      }else if(!/^\d{10}$/.test(mobile)){
        mobile_span.textContent = "Not a valid mobile number"
          return
      }else if(password.length < 8){
        password_span.textContent = "Password must be 8 charactors long or greater"
          return
      }else {
          const message = document.getElementById('messagesignup')
          setTimeout(() => {
             message.textContent = ""
          }, 3000);
          const xhttp = new XMLHttpRequest()
          xhttp.onload = function() {
          let response = JSON.parse(xhttp.response)
          if(response.error) {
              errordiv.textContent = response.error
              clearError(errorDiv)
              return
          }
          window.location.href =  "/auth/verify/email"

          
      }
        xhttp.open('POST', `${window.location.origin}/auth/verify-email` ,true)
          xhttp.setRequestHeader('Content-Type','application/json')
          xhttp.send(JSON.stringify({email,username,mobile,password}))
      }

  }
  
  function showMessage(text, color) {
    errordiv.classList.remove()
    er
    
  }