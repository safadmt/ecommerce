import express from 'express'
import cookieParser from 'cookie-parser'
import expressSession from 'express-session'
import expressEjsLayouts from 'express-ejs-layouts'
import {fileURLToPath} from 'url'
import path ,{ dirname } from 'path'
import connectDB from './config/connection.js'
import flash from 'connect-flash'




const app = express();

import userRouter from './routes/users.js'
import authRouter from './routes/auth.js'
import homeRouter from './routes/home.js'
import adminRouter from './routes/admin.js'



const currentFilePath = fileURLToPath(import.meta.url)
console.log(currentFilePath)
const __dirname = dirname(currentFilePath)

app.use(expressEjsLayouts)
app.set('layout', './layout/layout.ejs')
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')



app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(expressSession({secret: process.env.SESSION_SECRET,
resave: false,
saveUninitialized: false,
cookie:{maxAge: 1000*60*60}
}))


app.use(flash())

app.use((req,res,next)=> {
    res.locals.warning_msg = req.flash("warning_msg")
    res.locals.error_msg = req.flash('error')
    next()
})


connectDB()
app.use('/', homeRouter)
app.use('/user', userRouter)
app.use('/auth', authRouter)
app.use('/admin', adminRouter)



let PORT = process.env.PORT || 4000
app.listen(PORT, err=> err ? console.error(err) : console.log("Server connected to " + PORT))