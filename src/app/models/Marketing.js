const { db, storage, messaging } = require("../../config/db/firebase");

const sendNotification = (user) => {

    const topic = 'AdouTinTran';

    const message = {
        notification: {
            title: 'Notification from Zeniit Deeptry',
            body: 'Gửi theo yêu cầu',
            image: 'https://firebasestorage.googleapis.com/v0/b/nodejsapp-89f00.appspot.com/o/images%2F029213fc-4bfd-4ffb-800e-72703c0c66d8?alt=media&token=328c9b79-660e-4a44-948a-a103402dc559'
          },
          data:{
            name: 'tin'
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