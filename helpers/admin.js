import Admin from "../models/admin.js";
import bcrypt from 'bcryptjs'

export const authenticateAdmin = async(adminInfo) => {
    
    const newAdmin = await Admin.findOne({email: adminInfo.email})
    let data = {message: "" , response: {}}
    if(!newAdmin) {
        data.message = "Admin not found, Invalid credentials"
        return data
    }
    const isPasswordTrue = await bcrypt.compare(adminInfo.password, newAdmin.password)
    if(isPasswordTrue) {
        data.response = {_id: newAdmin._id, email: newAdmin.email}
        return data;
    }else{
        data.message = "Password is incorrect"
        return data;
    }
}   