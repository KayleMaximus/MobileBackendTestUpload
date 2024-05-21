require('dotenv').config();
const jwt = require('jsonwebtoken');

const generateAuthToken = (user) => {
    const token = jwt.sign(
      {userID: user.userID},
      process.env.SECRET_KEY
    );
    
    return token;
}

module.exports = generateAuthToken;