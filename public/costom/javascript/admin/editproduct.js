function handleSubmit(formElement, productId) {
    event.preventDefault();
    const files = document.getElementById("files").files;

    const formData = new FormData(formElement);

    if (!formData.get("product_name").trim()) {
      return showMessage("Name is required");
    }
    if (!formData.get("description").trim()) {
      return showMessage("Description is required");
    }
    if (formData.get("discount_in_percentage")) {
      const discount = parseInt(formData.get("discount_in_percentage"));
      if (discount > 70) {
        return showMessage("Discount percentage not greater than 70%");
      }
    }
    if (!formData.get("brand")) {
      return showMessage("Brand is required");
    }
    if (!formData.get("type")) {
      return showMessage("Watch type is required");
    }
    if (!formData.get("price")) {
      return showMessage("Price is required");
    }
    if (!formData.get("stock_available")) {
      return showMessage("Stock available is required");
    }

    if (!formData.get("gender")) {
      return showMessage("Gender is required");
    }

    const xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
      const response = JSON.parse(xhttp.response);
      if (response === "Ok") {
        const successdiv = document.createElement("div");

        successdiv.classList.add("text-green-600");

        successdiv.textContent = "Product added successfully";
        const form = document.querySelector(".buttondiv");
        form.insertBefore(successdiv, document.getElementById("submitbutton"));
        setTimeout(() => {
          successdiv.remove();
        }, 5000);
      } else if (response.error) {
        return showMessage(response.error);
      }
    };

    xhttp.open(
      "PUT",
      `${window.location.origin}/admin/products/edit/${productId}`,
      true
    );

    xhttp.send(formData);
  }

  function showMessage(message) {
    const errorDiv = document.createElement("div");
    errorDiv.classList.add("errorDiv");

    errorDiv.textContent = message;
    const form = document.querySelector(".buttondiv");
    form.insertBefore(errorDiv, document.getElementById("submitbutton"));
    setTimeout(() => {
      errorDiv.remove();
    }, 4000);
  }
  document
    .getElementById("discount")
    .addEventListener("keydown", function (event) {
      const discountInput = event.target;
      const discount_span = document.getElementById("discount-span");
      if (discountInput.value.length >= 2) {
        discount_span.style.color = "yellow";
        discount_span.style.fontSize = "1.8rem";
        discount_span.textContent = "Only enter less than 70%";
      } else {
        discount_span.textContent = "Only enter less than 70%";
      }
    });
  function viewImage(e) {
    const files = e.target.files;
    const productImagediv = document.getElementById(
      "edit-product-image-container"
    );
    const imageContainer = document.getElementById("image_container");

    productImagediv.innerHTML = "";
    
    if (files.length > 0) {
      Array.from(files).forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function (e) {
          const img = document.createElement("img");
          img.id = "edit-product-image-view";
          img.src = e.target.result;
          img.alt = "product image";
          productImagediv.appendChild(img);
        };
        reader.readAsDataURL(file);
      });
    }
  }