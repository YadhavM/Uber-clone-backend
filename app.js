const dotenv = require('dotenv')
dotenv.config()
const express  = require('express')
const app = express()
const cors = require('cors')
const connectDB = require('./db/db')
    connectDB()
const cookieParser = require('cookie-parser')
const userRoutes = require('./routes/user.routes')
const captainRoutes = require('./routes/captain.routes')
const mapRoutes   = require('./routes/maps.routes')
const rideRoutes = require('./routes/rides.router')
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())

app.get('/' , (req,res)=>{
})

app.use('/users' , userRoutes)

app.use('/captains' , captainRoutes)

app.use('/maps' , mapRoutes)

app.use('/rides' , rideRoutes)



module.exports = app ; 