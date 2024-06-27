const otpGroup = document.getElementById("otp-group");
  const otpbtn = document.getElementById("otpbtn");
  const emailbtn = document.getElementById("emailbtn");
  const editemailform = document.getElementById("edit-email-form");
  function openModal(modalId) {
    document.getElementById(modalId).classList.remove("hidden");
    document.getElementById("overlay").classList.remove("hidden");
  }

  function closeModal(modalId) {
    document.getElementById(modalId).classList.add("hidden");
    document.getElementById("overlay").classList.add("hidden");
  }

  async function handleSubmitCredentils(form) {
    event.preventDefault();
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });
    const regex = /^\d{10}$/;
    if (!data.username?.trim() || !mobile) {
      return toastr.warning("Username or mobile field is required");
    } else if (!regex.test(data.mobile)) {
      return toastr.warning("Not a valid mobile number");
    }
    const response = await fetch("/user/profile/edit-credential", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (response.ok) {
      toastr.success("Changes saved successfully!");
      closeModal(form.closest(".model-div").id);
      document.getElementById("username").textContent = data.username;
      document.getElementById("profilename").textContent = data.username;

    } else {
      toastr.warning(`Error: ${result.message}`);
    }
  }

  async function changePassword(form) {
    event.preventDefault();
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });
    const regex = /^[\S]{8,25}$/;
    const { current_password, new_password, confirm_new_password } = data;
    if (
      !current_password.trim() ||
      !new_password.trim() ||
      !confirm_new_password.trim()
    ) {
      return toastr.warning("Required all * indiacted field");
    } else if (new_password !== confirm_new_password) {
      return toastr.warning("Passwords do not match");
    } else if (!validatePassword(current_password)) {
      return toastr.warning(
        "Current Password is invalid. It must be between 8 and 25 characters long."
      );
    } else if (!validatePassword(new_password)) {
      return toastr.warning(
        "New Password is invalid. It must be between 8 and 25 characters long."
      );
    } else if (!validatePassword(confirm_new_password)) {
      return toastr.warning(
        "Confirm New Password is invalid. It must be between 8 and 25 characters long."
      );
    }
    const response = await fetch("/user/profile/edit-password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (response.ok) {
      toastr.success("Changes saved successfully!");
      closeModal(form.closest(".model-div").id);
    } else {
      toastr.warning(`Error: ${result.message}`);
    }
  }
  function validatePassword(password) {
    // Regex pattern to check password length between 8 and 25 characters
    const pattern = /^[\S]{8,25}$/;

    return pattern.test(password);
  }

  async function handleChangeEmail() {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = pattern.test(email);

    if (!email.trim()) {
      return toastr.warning("Email is required");
    } else if (!pattern.test(email)) {
      return toastr.warning("Not a valid Email");
    }
    showMessage("Please wait", "green", editemailform, otpGroup);

    try {
      const response = await fetch("/user/profile/edit-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      if (response.ok) {
        toastr.success(result.data);
        otpGroup.classList.remove("hidden");
        otpbtn.classList.remove("hidden");
        emailbtn.classList.add("hidden");
      } else {
        return toastr.warning(`Error: ${result.message}`);
      }
    } catch (err) {
      toastr.error("Something went wrong.")    }
  }

  async function handleSubmitOTP() {
    event.preventDefault();

    const otp = document.getElementById("otp").value;
    if (!otp.trim()) {
      return toastr.warning("OTP field required");
    } else if (otp.length !== 6) {
      return "OTP only 6 charactors.";
    }
    showMessage("Please wait", "green", editemailform, otpGroup);

    try {
      const response = await fetch("/user/profile/change-email-verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
      });

      const result = await response.json();
      if (response.ok) {
        if (result.data) {
          toastr.success("Email has been changed successfully");
          window.location.reload();
        }
      } else {
        if (result.message !== "OTP is required") {
          document.getElementById("otp-group").classList.add("hidden");
          document.getElementById("otpbtn").classList.add("hidden");
          document.getElementById("emailbtn").classList.remove("hidden");
          return toastr.warning(result.message);
        } else {
          return toastr.warning(result.message);
        }
      }
    } catch (err) {
      toastr.error("Something went wrong.")
    }
  }

  function removeMessage(element) {
    setTimeout(() => {
      element.remove();
    }, 4000);
  }

  function showMessage(message, color, maindiv, insetBeforeelem) {
    const div = document.createElement("div");
    div.style.color = color;
    div.textContent = message;
    maindiv.insertBefore(div, insetBeforeelem);
    removeMessage(div);
  }