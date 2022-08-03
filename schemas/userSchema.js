const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
},
  username: {
    type: String,
    
  },
  password: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
  },
  token:{
    type: String,
    default: ''
  }
});




module.exports = userSchema;
