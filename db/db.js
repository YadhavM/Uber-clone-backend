const mongoose = require('mongoose');
require('dotenv').config();
function connectDB() {
    mongoose.connect(process.env.DB_CONNECT , {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
    .then(()=> console.log('Connected to DB')).catch(err => console.log(err))
}

module.exports = connectDB ; 