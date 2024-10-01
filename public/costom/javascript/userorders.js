var socket = io();

window.addEventListener("DOMContentLoaded", function (){
    console.log("console.log", userId);
    
    socket.emit("user_connected", userId)
    
    
})

socket.on("order_status", (data)=> {
    console.log(data, "hello dat  i am i know"); 
})