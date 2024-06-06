require('dotenv').config();
const jwt = require('jsonwebtoken');

function auth(req, res, next){

    const token = req.header('Authorization') && req.header('Authorization').split(' ')[1];

    if(!token) return res.status(401).send("Access denined. No Token provided.");

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        if(decoded.userID == 'THK88') {
            next();
        }
    }catch (ex) {
        res.status(400).send('Invalid Token.');
    }
}

module.exports = auth;