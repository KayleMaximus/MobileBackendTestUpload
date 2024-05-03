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
                    console.log(user); // Or do whatever you need with the course object
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
            const userId = req.params.id;
            const { name, status } = req.body;
    
            console.log(userId);
            console.log(name);
            console.log(status);
    
            // Tạo một object JSON chứa các trường cần cập nhật
            const updatedData = {};
            if (name) updatedData.name = name;
            if (status) updatedData.status = status;
    
            console.log(updatedData);
    
            // Cập nhật chỉ các trường đã được cung cấp trong updatedData
            await db.collection('people').doc(userId).update(updatedData);
    
            console.log("Caiconcak");
    
            res.status(200).send("User updated successfully");
        } catch(error){
            console.error('Error updating user: ', error);
            res.status(500).send("Internal Server Error"); 
        }
    }



}

module.exports = new UserController;