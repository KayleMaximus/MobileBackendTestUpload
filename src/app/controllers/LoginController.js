const { db, auth } = require("../../config/db/firebase");
const User = require("../models/User");
const generateAuthToken = require('../utils/auth')


class LoginController {

    async loginAdmin(req, res) {
        const { username, password } = req.body;

        console.log(username, password);

        try {
            // Lấy thông tin người dùng từ Firestore hoặc Realtime Database
            const userRef = db.collection('users').where('username', '==', username);
            const getUser = await userRef.get();

            let userData = null;
            console.log(typeof(userData));
            getUser.forEach(doc => {
                userData = doc.data();
            }); // Lấy dữ liệu người dùng từ Firestore

            if (userData.password === password && userData.isAdmin === true) {
              console.log(userData);
              const token = await generateAuthToken(userData);
              console.log(token);
              res.send(token);
              return token;
            } else {
              return res.status(400).send('Invalid password');
            }
          } catch (error) {
            console.error('Error logging in:', error);
            return res.status(500).send('Internal server error');
        }
    }
}

module.exports = new LoginController;
