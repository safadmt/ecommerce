function bannerIsActive(event, bannerid) {
    const isActiveButton = event.currentTarget;
    let content = isActiveButton.textContent.trim();
    
    fetch(`/admin/banners/edit-banner-active/${bannerid}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    })
      .then((response) => response.json())
      .then((data) => {
        const row = isActiveButton.closest('tr');
        const activeTd = row.getElementsByTagName('td')[4]; // Index of the 'Active' td
        const activeSpan = activeTd.getElementsByTagName('span')[0];
        if (data?.isActive) {
          isActiveButton.textContent = "true";
          activeSpan.textContent =  data.isActive
        } else {
          isActiveButton.textContent = "false";
          activeSpan.textContent =  data.isActive

        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function handleDelete(event, bannerid) {
    event.preventDefault();
    if(window.confirm("Do you want to delete this banner")) {
    const row = event.target.closest("tr");

    fetch(`/admin/banners/delete/${bannerid}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data === "Ok") {
          row.remove();
        }
      });
    }
  }