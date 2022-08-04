const mongoose = require("mongoose");

const createUserSchema = mongoose.Schema({
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
  address: String,
  phone: Number,

  status: {
    type: String,
    enum: ["active", "inactive"]
  },
  
  
});




module.exports = createUserSchema;
