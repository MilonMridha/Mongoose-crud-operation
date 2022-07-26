const jwt = require("jsonwebtoken");
const checkLogin = (req, res, next) =>{
    const {authorization} = req.headers;
    try{
        const token = authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const {email, userId} = decoded;
        req.email = email;
        req.userId = userId;
        next();
    } catch{
        next("Authentication Failed")
    }
}

module.exports = checkLogin;