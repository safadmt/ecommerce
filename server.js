import { server } from "./index.js";
import dotenv from 'dotenv';
dotenv.config()

let PORT = process.env.PORT || 4000
server.listen(PORT, err=> err ? console.log("Server not connected") : console.log("Server connected to " + PORT))