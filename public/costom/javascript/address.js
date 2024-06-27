function removeAddress(addressid) {
    event.preventDefault();
    fetch(`${window.location.origin}/user/manage-address/remove/${addressid}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          toastr.warning(data.message);
        } else if (data.data === "Ok") {
          alert("Removed successfully");
          window.location.reload();
        }
      })
      .catch((err) => {
        toastr.error(err)
      });
  }