function addToCart(event, productid) {
  
  fetch(`${window.location.origin}/user/add-to-cart/${productid}`, {
    method: "get",
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data.error) {
      } else if (data.response) {
        toastr.success("Item added to cart");
        document.getElementById("cart-count").innerHTML = data.response.count;
      }
    });
}

async function addToWishlist(event, productid) {
  if (!productid) return console.log("productid not found");

  try {
    const response = await fetch(`${window.location.origin}/user/wishlist/add/${productid}`, {
      headers: {
        "X-Requested-With": "XMLHttpRequest", // Set the X-Requested-With header
      },
    });
    const result = await response.json();
    if (response.ok) {
      toastr.success("Added to wishlist");
      document.getElementById("wishlist-count").innerHTML =
        result.wishlistcount;
    } else {
      if (result.message === "login") {
        window.location.href = `${window.location.origin}/auth/login`;
      } else if(result.message !== "login"){
        toastr.warning(result.message)
        
      }
    }
  } catch (err) {
    toastr.error("Something went wrong");
  }
}

function removeDiv(div) {
  setTimeout(() => {
    div.remove();
  }, 3000);
}

function isAllAvailable() {
  const productisAvailable = "<%= isAllAvailable %>";
  if (productisAvailable) {
    toastr.warning(
      "The quantity you ordered exceeds the available stock. Please adjust your order accordingly."
    );
  }
}

function incProduct(event, productid) {
  console.log(productid);
  fetch(`${window.location.origin}/user/add-to-cart/${productid}`, {
    method: "get",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        const cart_inner = document.querySelector(".cart_inner");
        const div = document.createElement("div");
        div.textContent = data.error;
        div.classList.add("messagediv");
        cart_inner.insertBefore(
          div,
          document.querySelector(".table-responsive")
        );

        setTimeout(() => {
          div.remove();
        }, 5000);
        return;
      } else if (data.response) {
        console.log(data.response.count);
        document.getElementById("cart-count").innerHTML = data.response.count;
        const quantityinput = document.getElementById(productid);
        const totalprice = document.getElementById("totalprice");
        const totaldiscount = document.getElementById("totaldiscount");
        const actualprice = document.getElementById("actualprice");
        quantityinput.value = parseInt(quantityinput.value) + 1;
        quantityinputChange();
        totalprice.textContent = data.response.totalprice;
        actualprice.textContent = data.response.actualprice;
        totaldiscount.textContent = data.response.totaldiscount;
      }
    });
}

function decProduct(event, productid) {
  console.log(productid);
  fetch(`${window.location.origin}/user/decrement-cart-product/${productid}`, {
    method: "get",
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data.message) {
      } else if (data.response) {
        document.getElementById("cart-count").innerHTML = data.count;
        const quantityinput = document.getElementById(productid);
        const totalprice = document.getElementById("totalprice");
        const totaldiscount = document.getElementById("totaldiscount");
        const actualprice = document.getElementById("actualprice");
        quantityinput.value = parseInt(quantityinput.value) - 1;
        totalprice.textContent = data.totalprice;

        actualprice.textContent = data.actualprice;
        quantityinputChange();
        totaldiscount.textContent = data.totaldiscount;
      }
    });
}

function removeProduct(event, productid) {
  fetch(`${window.location.origin}/user/remove-cart-product/${productid}`, {
    method: "get",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message) {
      } else if (data.response) {
        document.getElementById("cart-count").innerHTML = data.count;
        if (data.count === 0) {
          window.location.reload();
          return;
        }

        const row = event.target.closest("tr");
        row.remove();
        const totalprice = document.getElementById("totalprice");
        const totaldiscount = document.getElementById("totaldiscount");
        const actualprice = document.getElementById("actualprice");
        totalprice.textContent = data.totalprice;

        actualprice.textContent = data.actualprice;
        totaldiscount.textContent = data.totaldiscount;
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

function quantityinputChange() {
  const quantityinput = document.querySelectorAll(".quantity-input");
  quantityinput.forEach((input) => {
    const button = input.parentElement.querySelector(".btn-decrement");
    console.log("hello");

    if (input.value == "1") {
      button.disabled = true;
    } else {
      button.disabled = false;
    }
  });
}

document.addEventListener("DOMContentLoaded", quantityinputChange());
