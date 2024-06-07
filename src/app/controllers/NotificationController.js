const { db, storage, messaging } = require("../../config/db/firebase");
const Notification = require("../models/Notification");
const { v4: uuidv4 } = require("uuid");
const sendNotification = require('../models/Marketing');


class NotificationController {
  //[GET] /notifications
  async index(req, res, next) {
    const list = [];
    await db
      .collection("notifications")
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          const notificationData = doc.data();
          const notification = new Notification(
            notificationData.title,
            notificationData.body,
            notificationData.imageURL
          );
          list.push(notification);
        });
      })
      .catch(next);
    res.send(list);
  }

  //[POST] /notifications
  async create(req, res) {
    try {
      const { title, body } = req.body;

      console.log(title, body);

      const file = req.file;

      console.log(file);


      const fileName = uuidv4(); // Generate a unique filename using UUID
      const destinationFileName = "images/" + fileName; // Use the generated filename

      await storage.bucket().file(destinationFileName).save(file.buffer, {
        contentType: file.mimetype,
      });

      const fileURL = await storage
        .bucket()
        .file(destinationFileName)
        .getSignedUrl({
          action: "read",
          expires: "01-01-3000",
        });

      const newNotification = new Notification(title, body, fileURL.toString());
      await db.collection("notifications").add({
        title: newNotification.title,
        body: newNotification.body,
        imageURL: newNotification.imageURL,
      });

      sendNotification(newNotification);

      res.status(201).send("Notifications created successfully");
    } catch (error) {
      res.status(500).send("Internal Server Error");
    }
  }
}

module.exports = new NotificationController();
