class User {
    constructor(userID, username, email, role, expiredDatePremium, signInMethod, imageURL) {
      this.userID = userID;
      this.username = username;
      this.email = email;
      this.role = role;
      this.expiredDatePremium = expiredDatePremium;
      this.signInMethod = signInMethod;
      this.imageURL = imageURL;
    }

}

module.exports = User;