async function handleSubmit(formElement, bannerid) {
    event.preventDefault();
    console.log("hellowoard");
    
    const formData = new FormData(formElement);
    console.log(croppedBlob);
    let image = await getFileFromImgSrc()
    console.log(image);
    
    // Add cropped image to FormData if it exists
    if (image) {
      let img = formData.get('image').name.split('.')[0];
        formData.delete( "image")
        console.log(img);
        
        formData.append('image', image, `${img}.png`);
    }
    
    fetch(`${window.location.origin}/admin/banners/edit/${bannerid}`, {
        method: "PUT",
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        if (data === "Ok") {
            showMessage("Banner updated successfully");
        } else if (data.error) {
            showMessage(data.error);
        }
    })
    .catch(err => {
        toastr.error("Something went wrong.");
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

