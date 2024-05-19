require('dotenv').config();
const jwt = require('jsonwebtoken');

class User {
    constructor(userID, username, email, signInMethod, imageURL) {
      this.userID = userID;
      this.username = username;
      this.email = email;
      this.signInMethod = signInMethod;
      this.imageURL = imageURL;
    }

    generateAuthToken() {
      const token = jwt.sign(
        {userID: this.userID,
          username: this.username
        },
        process.env.SECRET_KEY
      );

      return token;
    }
}

module.exports = User;