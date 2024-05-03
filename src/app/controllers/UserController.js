const { db, storage } = require("../../config/db/firebase");
const User = require("../models/User");

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
            const { name, status } = req.body;
            const newUser = new User(name, status);
            console.log(newUser);
            await db.collection('people').add({
                name: newUser.name,
                status: newUser.status
            });
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

}

module.exports = new UserController;