const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const userSchema = require('../schemas/userSchema');
const User = new mongoose.model('User', userSchema);

const nodemailer = require("nodemailer");
const randomstring = require("randomstring");


const sendResetPasswordMail = async (name, email, token) => {

    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.NODE_MAIL_USER,
                pass: process.env.NODE_MAIL_PASS
            }
        });
        const mailOptions = {
            from: process.env.NODE_MAIL_USER,
            to: email,
            subject: 'For reset password',
            html: '<p> Hi ' + name + ', Please copy the link and <a href="http://localhost:5000/user/reset-password?token=' + token + '">reset password</a>'
        }
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            }
            else {
                console.log("Mail has been sent:-", info.response)
            }
        })
    } catch (err) {
        res.status(400).send({ success: false, msg: err.message })
    }
}

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
    catch (err) {
        console.log(err)
        res.status(500).json({
            "message": 'SignUp Failed!'
        });
    }
});

//Login--------->

router.post('/login', async (req, res) => {
    try {
        const user = await User.find({ email: req.body.email })
        if (user && user.length > 0) {
            const isValidPassword = await bcrypt.compare(req.body.password, user[0].password)
            if (isValidPassword) {
                const token = jwt.sign({
                    email: user[0].email,
                    userId: user[0]._id
                }, process.env.ACCESS_TOKEN_SECRET, {
                    expiresIn: '1h'
                });
                res.status(200).json({
                    "accessToken": token,
                    "message": 'login successful'
                })
            } else {
                res.status(401).json({
                    "error": 'Authentication Failed'
                })
            }
        }
    }
    catch (err) {

    }
});

// Forget-password api--------->
router.post('/forget-password', async (req, res) => {
    try {
        const email = req.body.email
        const userData = await User.findOne({ email: email });
        
        if (userData) {
            const randomString = randomstring.generate();
            const data = await User.updateOne({ email: email }, { $set: { token: randomString } })
            sendResetPasswordMail(userData.name, userData.email, randomString)
            res.status(200).send({ success: true, msg: "Please check your mail & reset your password." })
        } else {
            res.status(200).send({ success: true, msg: "This email does not exist" })
        }



    } catch (err) {
        console.log(err)
        res.status(400).send({ success: false, msg: err.message })
    }
});

//Reset-password----------->
router.get('/reset-password', async (req, res) => {
    try {
        const token = req.query.token;
        const tokenData =await User.findOne({ token:token });
        if(tokenData){
            const password = req.body.password;
            const hashedPassword = await bcrypt.hash(password, 10);
            const userData = await User.findByIdAndUpdate({_id: tokenData._id}, {$set: {password: hashedPassword,token:''}},{new:true})
            res.status(200).send({ success: true, msg: "User Password has been reset", data: userData })
        }
        else{
            res.status(200).send({ success: true, msg: "This link has been expired" })
        }
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message })
    }
})



module.exports = router;