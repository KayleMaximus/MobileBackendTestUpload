class User {
    constructor(userID,username, email, signInMethod, imageURL) {
      this.userID = userID;
      this.username = username;
      this.email = email;
      this.signInMethod = signInMethod;
      this.imageURL = imageURL;
    }
}

module.exports = User;