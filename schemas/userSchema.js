const express = require('express');
const mongoose = require('mongoose');
const todoHandler = ('../routeHandler/todoHandler.js');
const userHandler = ('../routeHandler/userHandler.js');

// express middleware------>
const app = express();
require("dotenv").config();
app.use(express.json());

//Database connected with mongoose-------------->