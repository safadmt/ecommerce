async function handleReturnStatus(event, returnid) {
    if(!returnid) return
    const value = event.target.value;

    if (!value) return;
  
    fetch(`${window.location.origin}/admin/returns/status/${returnid}`, {
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
      body: JSON.stringify({ return_status: value }),
    })
      .then((response) => response.json())
      .then((result) => {
        const row = event.target.closest("tr");
        if (!result.message) {
         
          const statusTd = row.querySelector("td:nth-child(7)");
          
          const returnStatusSpan = statusTd.querySelector('span');
          returnStatusSpan.textContent = result.data.returnStatus
          return
        } else if (result.message) {
          
          toastr.warning(result.message)
          return
        }
      })
      .catch((err) => {
        toastr.error("Something went wrong.")
      });
  }

  