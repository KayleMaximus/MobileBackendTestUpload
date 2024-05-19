const { db, auth } = require("../../config/db/firebase");

class LoginController {
    async login(req, res) {
        const { username, password } = req.body;

        console.log(username, password);

        try {
            // Lấy thông tin người dùng từ Firestore hoặc Realtime Database
            const userRef = db.collection('users').where('username', '==', username);
            const getUser = await userRef.get();

            let userData = null;
            getUser.forEach(doc => {
                userData = doc.data();
            }); // Lấy dữ liệu người dùng từ Firestore

            if (userData.password === password && userData.isAdmin === true) {
              const token = await auth.createCustomToken(username);
              return res.status(200).send({ token });
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
