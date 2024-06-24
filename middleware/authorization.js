// Middleware to check if a user is authenticated
export const userAuth = (req,res,next)=> {

    if(req.session.user?.username) {
        // If the user is authenticated, proceed to the next middleware or route handler
        next()
    }else{
        // If the request is an AJAX request, respond with a 401 status code and a JSON message
        if(req.xhr) {
            return res.status(401).json({message: "login"})
        }
        // For non-AJAX requests, set a flash message and redirect to the login page
        req.flash('error', 'Please login')
        res.redirect('/auth/login')
    }
}
// Middleware to check if an admin is authenticated
export const adminAuth = (req,res,next)=> {
    if(req.session.admin) {
        // If the admin is authenticated, proceed to the next middleware or route handler
        next()
    }else{
        // Set a flash message and redirect to the admin login page
        req.flash('error', 'Session timeout . Please login')
        res.redirect('/auth/admin/login')
    }
}

// Middleware to ensure an admin is not authenticated
// If authenticated, redirect to the home page, else go to admin loginpage
export const ensureAdminauthenticated = (req,res,next) => {
    if(req.session.admin){
        res.redirect('/')
    }else {
        next()
    }

}
// Middleware to ensure a user is not authenticated
// If authenticated, redirect to the home page , else go to user login page
export const ensureUserauthenticated = (req,res,next) => {
    if(req.session.user?.username){
        res.redirect('/')
    }else {
        next()
    } 
}



