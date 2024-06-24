function handleSubmit(formElement, bannerid) {
    event.preventDefault();

    const formData = new FormData(formElement);
    const obj = {};
    for (const [name, value] of formData.entries()) {
      obj[name] = value;
    }
    console.log(obj);
    console.log(bannerid);
    if (!formData.get("first_caption").trim()) {
      return showMessage("First Caption is required");
    }
    
    console.log(obj);

    fetch(`${window.location.origin}/admin/banners/edit/${bannerid}`, {
      method: "PUT",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if (data === "Ok") {
          const successdiv = document.createElement("div");
          successdiv.classList.add("text-orange-800");

          successdiv.textContent = "Banner updated successfully";
          const form = document.querySelector(".buttondiv");
          form.insertBefore(
            successdiv,
            document.getElementById("submitbutton")
          );
        } else if (data.error) {
          return showMessage(data.error);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function showMessage(message) {
    const errorDiv = document.createElement("div");
    errorDiv.classList.add("text-green-700");

    errorDiv.textContent = message;
    const form = document.querySelector(".buttondiv");
    form.insertBefore(errorDiv, document.getElementById("submitbutton"));
    setTimeout(() => {
      errorDiv.remove();
    }, 4000);
  }

  function viewImage(event) {
    document.getElementById("imgView").src = URL.createObjectURL(
      event.target.files[0]
    );
  }

