var socket = io('/orderstatus');

window.addEventListener("DOMContentLoaded", function (){
    
    socket.emit("user_connected", userId)
    
    
})

socket.on("order_status", (data)=> {
    console.log(data);
    
    let order_status = document.getElementById(`order_status_${data.orderid}`) 
    order_status.textContent = data.orderStatus;

})