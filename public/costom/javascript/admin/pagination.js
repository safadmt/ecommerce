function handlePreviouPage (page) {
    url.searchParams.set('page', parseInt(currentpage) - 1)
    Filter()
    
}

function gotoSpecifiedPage (page) {

url.searchParams.set('page', page.trim())
    Filter()
}

function handleNextPage () {
    url.searchParams.set('page', parseInt(currentpage) + 1)
    Filter()
}

function Filter () {
    window.location.href = `${url.pathname}?${url.searchParams}`

}