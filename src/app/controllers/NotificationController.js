const { db, storage, messaging } = require("../../config/db/firebase");
const Notification = require("../models/Notification");

class NotificationController {

       //[GET] /notifications
    async index(req, res, next){
        const list = [];
        await db.collection('notification').get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    const notificationData = doc.data();
                    const notification = new Notification(notificationData.title, notificationData.body);
                    list.push(notification);
                });
            })
            .catch(next);
        res.send(list);
    }

        //[POST] /notifications/create
        async create(req, res) {
            try{
                const { title, body } = req.body;
                const newNotification = new Notification(title, body);
                  
                await db.collection('notification').add({
                    title: newNotification.title,
                    body: newNotification.body
                });
                    
                res.status(201).send("Notification created successfully");
            } catch(error){
                res.status(500).send("Internal Server Error"); 
            }
        }
}

module.exports = new NotificationController;