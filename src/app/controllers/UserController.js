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

    //[GET] /user/create
    create(req, res, next) {
        res.render('user/userCreate');
    }

    //[POST] /user/store
    async store(req, res) {
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
}

module.exports = new UserController;