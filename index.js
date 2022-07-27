const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const todoHandler = require('./routeHandler/todoHandler');
const userHandler = require('./routeHandler/userHandler');

// express middleware------>
const app = express();
require("dotenv").config();


const corsConfig = {
  origin: true,
  Credentials: true,
}
app.use(cors(corsConfig))
app.options('*', cors(corsConfig));
app.use(express.json());

//Database connected with mongoose-------------->

mongoose
.connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.t7ino.mongodb.net/${process.env.DB_Name}?retryWrites=true&w=majority`
).then(() => console.log("Connected Successfully"))
.catch((err) => console.log(err));



app.get('/', (req, res) => {
  res.status(200).send('Dein Hausman Server is Running');
})

// application routes-------->
app.use('/todo', todoHandler);
app.use('/user', userHandler);







// database connection with mongoose-------->
function errorHandler(err, req, res, next){
    if (res.headerSent) {
      return next(err);
    }
    res.status(500).json({ error: err });
  }
  app.use(errorHandler);
  app.listen(5000, () => {
    console.log("Mongoose App listening on port 5000");
  });
