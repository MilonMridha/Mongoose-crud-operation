const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const userSchema = require('../schemas/userSchema');
const User = new mongoose.model('User', userSchema);
const createUserSchema = require('../schemas/createUserSchema')
const CreateUser = new mongoose.model('Create', createUserSchema);

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
        const email = req.body.email
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
                    "userData": user,
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
        console.log(err)

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
    }
    catch (err) {
        console.log(err)
        res.status(400).send({ success: false, msg: err.message })
    }
});

//Reset-password----------->
router.get('/reset-password', async (req, res) => {
    try {
        const token = req.query.token;
        const tokenData = await User.findOne({ token: token });
        if (tokenData) {
            const password = req.body.password;
            const hashedPassword = await bcrypt.hash(password, 10);
            const userData = await User.findByIdAndUpdate({ _id: tokenData._id }, { $set: { password: hashedPassword, token: '' } }, { new: true })
            res.status(200).send({ success: true, msg: "User Password has been reset", data: userData })
        }
        else {
            res.status(200).send({ success: true, msg: "This link has been expired" })
        }
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message })
    }
});


// USER MANAGEMENT-------------------->API

// Admin see the list of all users------------>APi
router.get('/getUser', async (req, res) => {
    const users = await User.find().clone()
    res.send(users)
});
//Admin check route--------->
router.get('/admin/:email', async (req, res) => {
    const user = await User.findOne({ email: req.params.email });
    const isAdmin = user.role === 'admin';
    res.send({ admin: isAdmin });
});

// Admin create the user API------------->
router.post('/adminCreateUser', async (req, res) => {
    try {

        const newUser = new CreateUser({
            name: req.body.name,
            email: req.body.email,
            address: req.body.address,
            number: req.body.number,
        });
        await newUser.save();
        res.status(200).json({
            "message": 'User create Successful!',
            data: newUser
        });
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            "message": 'User created Failed!'
        });
    }
});
// Admin update an User role API----------->
router.put('/admin/:id', async (req, res) => {
    await User.updateOne({ _id: req.params.id }, {
        $set: {
            role: "admin"
        }
    }, (err) => {
        if (err) {
            res.status(500).json({
                error: 'There was a server side error'
            });
        } else {
            res.status(200).json({
                message: 'Role was updated successfully'
            });
        }
    }).clone()



});

//Admin search/sort an user------------>
router.get('/search-user', async (req, res) => {
    await User.find({name: {$regex:`^${req.body.search.text.trim()}`}, $options: 'i'}, (err, docs)=>{
        if(err){
            responseObj ={
                "status": "error",
                "msg": "input is missing",
                "body": {}
            }
            res.status(500).send(responseObj);
        }else{
            responseObj ={
                "status": "success",
                "msg": "input is missing",
                "body": docs
            }
            res.status(200).send(responseObj);
        }
    }).clone();
    
});

//Pagination api ----------->
router.get('/pagination', async(req,res)=>{
 try{
  if(!req.body){
    responseObj ={
        "status": "error",
        "msg": "input is missing",
        "body": {}
    }
    res.status(500).send(responseObj);

  } else{

    const currentPage = req.body.currentPage;
    const pageSize = req.body.pageSize;
    const skip = pageSize * (currentPage-1);
    const limit = pageSize

    await User.find({}).skip(skip).limit(limit).exec((err, docs)=>{
        if(err){
            responseObj ={
                "status": "error",
                "msg": "input is missing",
                "body": {}
            }
            res.status(500).send(responseObj);
        }else{
            responseObj ={
                "status": "success",
                "msg": "input is valid",
                "body": docs
            }
            res.status(200).send(responseObj);
        }
    })
 
  }
 } catch (error){
    console.log('Error::', error)
 }
})






module.exports = router;