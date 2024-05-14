const { db, storage, messaging } = require("../../config/db/firebase");

const sendNotification = () => {

    const topic = 'AdouTinTran';

    const message = {
        notification: {
            title: 'Confirm',
            body: 'Gửi được'
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