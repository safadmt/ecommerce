import Admin from "../models/admin.js";
import bcrypt from 'bcryptjs'

// Admin login authentication
export const authenticateAdmin = async(adminInfo) => {
    
    const newAdmin = await Admin.findOne({email: adminInfo.email})
    let data = {message: "" , response: {}}
    //Check admin is in database
    if(!newAdmin) {
        data.message = "Admin not found, Invalid credentials"
        return data
    }
    // Compare admin provided password with database stored passord
    const isPasswordTrue = await bcrypt.compare(adminInfo.password, newAdmin.password)
    if(isPasswordTrue) {
        data.response = {_id: newAdmin._id, email: newAdmin.email,username:newAdmin.username}
        return data;
    }else{
        data.message = "Password is incorrect"
        return data;
    }
}   