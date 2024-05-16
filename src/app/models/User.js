class User {
    constructor(userID,username, password, email, signInMethod, imageUrl) {
      this.userID = userID;
      this.username = username;
      this.password = password;
      this.email = email;
      this.signInMethod = signInMethod;
      this.imageUrl = imageUrl;
    }
}

module.exports = User;