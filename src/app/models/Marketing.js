const { db, storage, messaging } = require("../../config/db/firebase");

const sendNotification = (notification) => {

    const topic = 'AdouTinTran';

    console.log(notification.body);

    const message = {
        notification: {
            title: notification.title,
            body: notification.body,
            image: notification.imageURL
          },
          data:{
            songURL: "https://drive.google.com/uc?id=1myPWS6WLuVaEPmqeKzBOy8GPXDQcWMy3&export=download"
          },

        topic: topic
    };

// Send a message to devices subscribed to the provided topic.
    messaging.send(message)
  .then((response) => {
    // Response is a message ID string.
    console.log('Successfully sent message:', response);
  })
  .catch((error) => {
    console.log('Error sending message:', error);
  });

};

module.exports = sendNotification;