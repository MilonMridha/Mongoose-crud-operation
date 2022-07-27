const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
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
  }
});




module.exports = userSchema;
