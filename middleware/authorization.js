export const userAuth = (req,res,next)=> {
    console.log("format",req.xhr)
    
    if(req.session.user) {
        next()
    }else{
        if(req.xhr) {
            return res.status(401).json({message: "login"})
        }
        req.flash('error', 'Please login')
        res.redirect('/auth/login')
    }
}

export const adminAuth = (req,res,next)=> {
    if(req.session.admin) {
        next()
    }else{
        req.flash('error', 'Session timeout . Please login')
        res.redirect('/auth/admin/login')
    }
}