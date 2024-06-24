function userIsBlocked(event, userid) {
    const isActiveButton = event.currentTarget;
    let content = isActiveButton.textContent;
    console.log(isActiveButton);
    console.log(content);
    fetch(`/admin/users/block-or-unblock/${userid}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    })
      .then((response) => response.json())
      .then((data) => {
        if(!data.message) {
          const row = event.target.closest("tr");
          const statusTd = row.querySelector("td:nth-child(5)");
          
              if(data.data.isBlocked == true) {
                event.target.innerHTML = "Unblock"
              
              }else{
                event.target.innerHTML = "Block"
                
              }

              updateUserBlocked(data.data.isBlocked, statusTd)
        }

        
      })
      .catch((err) => {
        console.log(err);
      });
  }
  

  function updateUserBlocked(isUserBlocked, statusTd) {
  const userBlockedSpan = statusTd.querySelector('span');

  // Remove all existing child nodes from the span
  while (userBlockedSpan.firstChild) {
    userBlockedSpan.removeChild(userBlockedSpan.firstChild);
  }

  // Remove all existing classes from the span
  userBlockedSpan.classList.remove(...userBlockedSpan.classList);

  // Create a new text node with the user status
  const statusText = document.createTextNode(isUserBlocked ? 'Blocked' : 'Unblocked');

  // Add classes based on the user status
  if (isUserBlocked) {
    userBlockedSpan.classList.add('px-2', 'py-1', 'font-semibold', 'leading-tight', 'text-orange-700', 'bg-orange-100', 'rounded-full', 'dark:text-white', 'dark:bg-orange-600');
  } else {
    userBlockedSpan.classList.add('px-2', 'py-1', 'font-semibold', 'leading-tight', 'text-green-700', 'bg-green-100', 'rounded-full', 'dark:text-white', 'dark:bg-green-600');
  }

  // Append the new text node to the userBlockedSpan
  userBlockedSpan.appendChild(statusText);
}



  function handleDelete(event, userid) {
    event.preventDefault();
    if (window.confirm("Do you want delete this coupon permenantly")) {
      const row = event.target.closest("tr");

      fetch(`/admin/users/delete/${userid}`, {
        method: "DELETE",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            console.log(data.error)
            
          }else{
            document.getElementById('totalusers').textContent = data.totalusers;
            document.getElementById('newusers').textContent = data.newusers
            row.remove();
          }
        });
    }
  }