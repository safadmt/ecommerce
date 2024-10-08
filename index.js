import express from 'express'
import { createServer } from 'http'
import cookieParser from 'cookie-parser'
import expressSession from 'express-session'
import connectMongoDBSession  from 'connect-mongodb-session'
import expressEjsLayouts from 'express-ejs-layouts'
import {fileURLToPath} from 'url'
import path ,{ dirname } from 'path'
import connectDB from './config/connection.js'
import flash from 'connect-flash'
import logger from './utils/logger.js'
import userRouter from './routes/users.js'
import authRouter from './routes/auth.js'
import homeRouter from './routes/home.js'
import adminRouter from './routes/admin.js'
import { handleError } from './middleware/errorHandler.js'
import InitializeSocket from './utils/socket.js'
import chatBotSocket from './utils/chatSocket.js'
import { orderStatusSocket } from './utils/orderStatusSocket.js'
const currentFilePath = fileURLToPath(import.meta.url)
const __dirname = dirname(currentFilePath)
// Initialize MongoDBStore with express-session
const MongoDBStore = connectMongoDBSession(expressSession);
const store = new MongoDBStore({uri : process.env.MONGO_URL, collection: "session"})

store.on('error', function (err) {
  logger.info(err.stack)
})
const session = expressSession({secret: process.env.SESSION_SECRET,
  cookie:{maxAge: 14 * 24 * 60 * 60 * 1000},
  store: store,
  resave: false,
  saveUninitialized: false,
  
  })
const app = express();
const server = createServer(app)
const {io} = InitializeSocket(server,session)
chatBotSocket(io,session)
const {getConnectedUsers, orderstatus} = orderStatusSocket(io)
app.use(expressEjsLayouts)
app.set('layout', './layout/layout.ejs')
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs') 
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(session)
app.use(flash())
// Middleware to make flash messages available in views
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.warning_msg = req.flash('warning_msg');
    next();
  });
// Error handling
app.use(handleError)
// Connecting to database
connectDB()
.then(response=> {
  console.log(response)
}).catch(err=> {
  logger.info(err.stack)
})
app.use('/', homeRouter)
app.use('/user', userRouter)
app.use('/auth', authRouter)
app.use('/admin', adminRouter)


export {io, server, orderstatus}