const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const userSchema = require('../schemas/userSchema');
const User = new mongoose.model('User', userSchema);

// Sign Up---------->
router.post('/signup', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
        });
        await newUser.save();
        res.status(200).json({
            "message": 'SignUp was Successful!'
        });
} 
    catch(err) {
        console.log(err)
        res.status(500).json({
            "message": 'SignUp Failed!'
        });
    }
});

//Login--------->

router.post('/login', async (req, res) => {
    try {
        const user = await User.find({email: req.body.email})
        if(user && user.length > 0){
            const isValidPassword = await bcrypt.compare(req.body.password, user[0].password)
            if(isValidPassword){
                const token = jwt.sign({
                    email: user[0].email,
                    userId: user[0]._id
                }, process.env.ACCESS_TOKEN_SECRET, {
                    expiresIn: '1h'
                });
                res.status(200).json({
                    "access_token": token,
                    "message": 'login successful'
                })
            } else{
                res.status(401).json({
                    "error": 'Authentication Failed'
                })
            }
        }
} 
    catch(err) {
        
    }
});


module.exports = router;