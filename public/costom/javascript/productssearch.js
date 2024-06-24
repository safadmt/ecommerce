window.addEventListener("DOMContentLoaded", ()=> {
    const previouspageli = document.getElementById('previouspageli')
    if(currentPage === "1") {
      previouspageli.classList.add('disabled')
    }else{
      previouspageli.classList.remove('disabled')
    }
  })
  function gotoNextPage(event) {
    currentPage = event.target.textContent.trim();
    pages();
  }

  function handlePreviouPage() {
    const page = parseInt(currentPage);
    if (page === 1) return;
    currentPage = page - 1;
    pages();
  }

  function handleNextPage() {
    const total_page = parseInt(totalpages);
    if (total_page === currentPage) return;
    currentPage = parseInt(currentPage) + 1;
    pages();
  }

  function pages() {
    const url = new URL(window.location.href);
    const path = url.pathname.replace(previouspage, currentPage)
    console.log(url.origin)
    console.log(path)
    window.location.href = `${url.origin}${path}/${currentPage}`;
  }