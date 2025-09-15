const http = require('http')
const app = require('./app')
const port = process.env.PORT || 3000 ; 
const {initialiseSocket} = require('./socket')


const server = http.createServer(app)

initialiseSocket(server)

server.listen(port , ()=>{
    console.log(`Server is running on port ${port}`)
})