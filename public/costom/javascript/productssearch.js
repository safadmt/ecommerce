window.addEventListener("DOMContentLoaded", ()=> {
  const nextpagebtn =  document.getElementById('nextpagebutton')
    const previouspageli = document.getElementById('previouspageli')
    if(currentPage === "1") {
      previouspageli.classList.add('disabled')
    }else{
      previouspageli.classList.remove('disabled')
    }
    if(currentPage === totalpages){
      nextpagebtn.disabled = true
    }
  })
  function gotoNextPage(event) {
    
    if(currentPage == event.target.textContent.trim()) {
      return
    }
    currentPage = event.target.textContent.trim();
    console.log(currentPage);
    
    pages();
  }

  function handlePreviouPage() {
    const page = parseInt(currentPage);
    if (page === 1) return;
    currentPage = page - 1;
    pages();
  }

  function handleNextPage() {
    
    if (totalpages == currentPage) return;
    currentPage = parseInt(currentPage) + 1;
    pages();
  }

    function pages() {
      console.log(currentPage);
      console.log(previouspage);
      
      const url = new URL(window.location.href);
      let path = url.pathname.split('/')
      if(path[path.length - 1] === previouspage) {
        path[path.length - 1] = currentPage
      }else{
        path.push(currentPage)
      }
      const newpath = path.join('/')
      
      window.location.href = `${url.origin}${newpath}`;
    }