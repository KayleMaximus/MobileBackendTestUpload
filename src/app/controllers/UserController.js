const { db, storage } = require("../../config/db/firebase");
const User = require("../models/User");
const sendNotification = require('../models/Marketing');

class UserController {

    //[GET] /user
    async index(req, res, next){
        const list = [];
        await db.collection('people').get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    const userData = doc.data();
                    const user = new User(userData.name, userData.status);
                    list.push(user);
                });
            })
            .catch(next);
        res.send(list);
    }

    //[POST] /user/create
    async create(req, res) {
        try{
            const { userID, username, password, email, signInMethod, imageUrl } = req.body;
            const newUser = new User(userID, username, password, email, signInMethod, imageUrl);
              
              await db.collection('users').add({
                    userID: newUser.userID,
                    username: newUser.username,
                    password: newUser.password,
                    email: newUser.email,
                    signInMethod: newUser.signInMethod,
                    imageUrl: newUser.imageUrl,
                });

                //sendNotification(newUser);
                
            res.status(201).send("User created successfully");
        } catch(error){
            res.status(500).send("Internal Server Error"); 
        }
    }

    async update(req, res) {
        try {
            const userId = req.body.id;
            const { name, status } = req.body;
      
            // Tạo một object JSON chứa các trường cần cập nhật
            const updatedData = {};
            if (name) updatedData.name = name;
            if (status) updatedData.status = status;

            // Cập nhật chỉ các trường đã được cung cấp trong updatedData
            await db.collection('people').doc(userId).update(updatedData);
    
            console.log("Caiconcak");
    
            res.status(200).send("User updated successfully");
        } catch(error){
            console.error('Error updating user: ', error);
            res.status(500).send("Internal Server Error"); 
        }
    }

    async delete(req, res) {
        try {
            const userId = req.body.id;

            await db.collection('people').doc(userId).delete();
    
            res.status(200).send("User deleted successfully");
        } catch(error){
            console.error('Error updating user: ', error);
            res.status(500).send("Internal Server Error"); 
        }
    }

    async getByID(req, res) {
        const id = req.params.id;
        console.log(id);
        try {
            // Truy vấn dữ liệu người dùng từ Firestore hoặc Realtime Database
            const userDoc  = await db.collection('people').doc(id).get();
            // const userData = await admin.database().ref('users/' + docId).once('value');
        
            if (!userDoc.exists) {
              res.status(404).json({ error: 'User not found' });
              return;
            }
        
            const userData = userDoc.data(); // Lấy dữ liệu người dùng từ Firestore
        
            console.log(userData);

            res.status(200).json(userData);
        }catch (error) {
            console.error('Error fetching user:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

}

module.exports = new UserController;