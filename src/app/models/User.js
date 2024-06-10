class User {
    constructor(userID, username, email, role, expriredDatePrimeum, signInMethod, imageURL) {
      this.userID = userID;
      this.username = username;
      this.email = email;
      this.role = role;
      this.expriredDatePrimeum = expriredDatePrimeum;
      this.signInMethod = signInMethod;
      this.imageURL = imageURL;
    }

}

module.exports = User;