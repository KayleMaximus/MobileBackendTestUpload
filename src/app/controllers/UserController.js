const { db, storage } = require("../../config/db/firebase");
const User = require("../models/User");
const { v4: uuidv4 } = require('uuid');

class UserController {

    //[GET] /user
    async index(req, res, next){
        const list = [];
        await db.collection('users').get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    const userData = doc.data();
                    const user = new User(userData.userID, userData.username, 
                         userData.email, userData.signInMethod, userData.imageURL);
                    list.push(user);
                });
            })
            .catch(next);
        res.send(list);
    }

    //[POST] /users
    async create(req, res) {
        try{
            const { userID, username, email, signInMethod } = req.body;
            const file = req.file;
            
            const fileName = uuidv4(); // Generate a unique filename using UUID
            const destinationFileName = "images/" + fileName; // Use the generated filename
            
            await storage.bucket().file(destinationFileName).save(file.buffer, {
                contentType: file.mimetype,
              });

            const fileURL = await storage.bucket().file(destinationFileName).getSignedUrl({
                action:"read",
                expires: "01-01-3000"
            })
            
            const newUser = new User(userID, username, email, signInMethod, fileURL);
            await db.collection('users').add({
                userID: newUser.userID,
                username: newUser.username,
                email: newUser.email,
                signInMethod: newUser.signInMethod,
                imageURL: newUser.imageURL,
            });
            res.status(201).send("User created successfully");
            
                //sendNotification(newUser);  
        } catch(error){
            res.status(500).send("Internal Server Error"); 
        }
    }

    async update(req, res) {
        const userID = req.params.userID;
        const { username, email, signInMethod, imageURL } = req.body;
      
        // Tạo một object JSON chứa các trường cần cập nhật
        const updatedData = {};

        if (username) updatedData.username = username;
        if (email) updatedData.email = email;
        if (signInMethod) updatedData.signInMethod = signInMethod;
        if (imageURL) updatedData.imageURL = imageURL;

        try {
            // Tìm tài liệu có trường id phù hợp
            const userRef = db.collection('users').where('userID', '==', userID);
            const myUser = await userRef.get();
            
            if (myUser.empty) {
                res.status(404).send('User not found');
                return;
        }

            // Cập nhật chỉ các trường đã được cung cấp trong updatedData
            const doc = myUser.docs[0];
            await doc.ref.update(updatedData);
    
            res.status(200).send("User updated successfully");
        } catch(error){
            console.error('Error updating user: ', error);
            res.status(500).send("Internal Server Error"); 
        }
    }

    async delete(req, res) {
        try {
            const userID = req.params.userID;

            const userRef = db.collection('users').where('userID', '==', userID);
            const myUser = await userRef.get();
            
            if (myUser.empty) {
                res.status(404).send('User not found');
                return;
            }

            const doc = myUser.docs[0];
            await doc.ref.delete();
    
            res.status(200).send("User deleted successfully");
        } catch(error){
            console.error('Error updating user: ', error);
            res.status(500).send("Internal Server Error"); 
        }
    }

    async getUserByID(req, res) {
        const userID = req.params.userID;
        console.log(userID)
        try {
            // Truy vấn dữ liệu người dùng từ Firestore hoặc Realtime Database
            const userRef = db.collection('users').where('userID', '==', userID);
            const myUser = await userRef.get();
            
            console.log(myUser)
            
            let userData = null;
            myUser.forEach(doc => {
                userData = doc.data();
            }); // Lấy dữ liệu người dùng từ Firestore

            res.status(200).json(userData);
        }catch (error) {
            console.error('Error fetching user:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

}

module.exports = new UserController;