function gotoNextPage(event) {
    currentPage = event.target.textContent.trim();

    handleFilter();
  }

  function handlePreviouPage() {
    currentPage = parseInt(currentPage) - 1;
    handleFilter();
  }

  function handleNextPage() {
    currentPage = parseInt(currentPage) + 1;
    handleFilter();
  }

  document.addEventListener("DOMContentLoaded", () => {
    const previouspage = document.getElementById("previouspage");
    const nextpagebutton = document.getElementById("nextpagebutton");
    const params = new URLSearchParams(window.location.search);

    const brands = params.getAll("brand");
    brands.forEach((brand) => {
      const checkbox = document.querySelector(
        `input[name="brand"][value="${brand}"]`
      );
      if (checkbox) {
        checkbox.checked = true;
      }
    });

    const types = params.getAll("type");
    types.forEach((type) => {
      const checkbox = document.querySelector(
        `input[name="type"][value="${type}"]`
      );
      if (checkbox) {
        checkbox.checked = true;
      }
    });

    const gender = params.get("gender");

    if (gender) {
      document.querySelector(`select[name="gender"]`).value = gender;

      const optionElement = selectElement.querySelector(
        `option[value="${gender}"]`
      );
      if (optionElement) {
        optionElement.selected = true;
      }
    }

    if (currentPage == totalpages) {
      const li = nextpagebutton.closest("li");
      li.classList.add("disabled");
      nextpagebutton.disabled = true;
    } else {
      const li = nextpagebutton.closest("li");
      li.classList.remove("disabled");
      nextpagebutton.disabled = false;
    }

    if (currentPage == 1) {
      const li = previouspage.closest("li");
      li.classList.add("disabled");
      previouspage.disabled = true;
    } else {
      const li = previouspage.closest("li");
      li.classList.remove("disabled");
      previouspage.disabled = false;
    }
  });

  function handleFilter(info) {
    event.preventDefault(); // Prevent the default form submission
    // Get the current URL
    const currentUrl = new URL(window.location.href);
    if (info && info === "filter") {
      currentPage = 1;
    }
    // Get the existing query parameters
    const params = currentUrl.searchParams;
    const gender = document.querySelector("select").value;
    params.delete("brand");
    Array.from(
      document.querySelectorAll('input[name="brand"]:checked')
    ).forEach((brand) => params.append("brand", brand.value));
    params.delete("type");
    const typeCheckboxes = Array.from(
      document.querySelectorAll('input[name="type"]:checked')
    ).forEach((type) => params.append("type", type.value));

    if (gender) {
      params.set("gender", gender);
    } else {
      params.delete("gender");
    }

    // Construct the new URL with updated query parameters
    const path = currentUrl.pathname.split("/")[1];
    const newUrl = `${
      currentUrl.origin
    }/${path}/${currentPage}/?${params.toString()}`;

    //   // Navigate to the new URL
    window.location.href = newUrl;
  }

  function clearFilter() {
    window.location.href = "/shop";
  }