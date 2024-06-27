const loginbtn = document.getElementById('loginbtn')
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  function inputEmailChange(event) {
    const email = event.target.value.trim();
    const emailError = document.getElementById("email_span");
    
    if (!email) {
      loginbtn.classList.add('disabled')
      emailError.textContent = "Email is required.";
    } else if (!emailRegex.test(email)) {
        loginbtn.classList.add('disabled')
      emailError.textContent = "Invalid email format.";
    } else {
        loginbtn.classList.remove('disabled')
      emailError.textContent = "";
    }
  }

  function inputPasswordChange(event) {
    const password_span = document.getElementById("password_span");
    if (!event.target.value.trim()) {
        loginbtn.classList.add('disabled')
      password_span.textContent = "Password is required.";
    } else if (event.target.value.length < 8) {
        loginbtn.classList.add('disabled')
      password_span.textContent = "Password length must be 8 charactors long";
    } else if (event.target.value.length > 20) {
        loginbtn.classList.add('disabled')
      password_span.textContent = "Password length not exceed 20 charactors";
    } else {
        loginbtn.classList.remove('disabled')
      password_span.textContent = "";
    }
  }

  async function handleLogin (event) {
        event.preventDefault()
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const email_span = document.getElementById('email_span');
        const password_span = document.getElementById('password_span');
        if(!email.trim()) {
            email_span.textContent = "Email is required";
        }
        if(email && !emailRegex.test(email)) {
            email_span.textContent = "Invalid email";
        }

        if(!password) {
            password_span.textContent = "Password required"
        }
        if(password?.length < 8) {
            password_span.textContent = "Password length must be 8 charactors long";
        }
        if(password?.length > 20) {
            password_span.textContent = "Password length not exceed 20 charactors";
        }
        if(password?.length < 8 || password?.length > 20 || !email || !emailRegex.test(email)) {
            return
        }
    try{
    const response = await fetch('/auth/admin/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email, password})
    })
    const result = await response.json()
    if(!response.ok) {
        email_span.textContent = result.message;
        password_span.textContent = result.message;
    }else{
        window.location.href = result.url
    }
    }catch(err) {

      toastr.error(err)
    }
}