

function handleSubmit(formElement) {
    event.preventDefault();
    const formData = new FormData(formElement);
    
    const obj = {};
    
    
    if (!formData.get("first_caption").trim()) {
      return showMessage("First Caption is required");
    }
    
    
    if (formData.get("image").name === "" && formData.get("image").size === 0) {
      return showMessage("Image field is required");
    }
    if (croppedBlob) {
      let img = formData.get('image').name.split('.')[0];
        formData.delete( "image")
        console.log(img);
        
        formData.append('image', croppedBlob, `${img}.png`);
    }
    fetch(`${window.location.origin}/admin/banners/add-banner`, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data.error) {
          const successdiv = document.createElement("div");
          successdiv.classList.add("text-green-700");
          successdiv.textContent = "Banner added successfully";
          const form = document.querySelector(".buttondiv");
          form.insertBefore(successdiv, form.firstChild);
          setTimeout(() => {
            window.location.reload();
          }, 2000);
          return
        } else if (data.error) {
          return showMessage(data.error);
        }
      })
      .catch((err) => {
         
        toastr.error("Something went wrong.")
      });
  }

  function showMessage(message) {
    const errorDiv = document.createElement("div");
    errorDiv.classList.add("text-orange-700");

    errorDiv.textContent = message;
    const form = document.querySelector(".buttondiv");
    form.insertBefore(errorDiv, document.getElementById("submitbutton"));
    setTimeout(() => {
      errorDiv.remove();
    }, 4000);
  }