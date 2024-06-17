const {  messaging } = require("../../config/db/firebase");

const sendNotification = (type, object) => {

  let notification = {};
  let message = {};
    const topic = 'AdouTinTran';
    
    

    if(type === "media") {
      notification.title = `THK Music Corner vừa cập nhật bài hát ${object.name}`;
      notification.body = `Ca sĩ ${object.artist} vừa cho ra mắt bài hát mới! Mời bạn thưởng thức tại THK Music Corner!`;
      notification.imageURL = object.imageURL;

      message = {
        data:{
          title: notification.title,
          body: notification.body,

          songID: object.songID,
          nameSong: object.name,
          artistSong: object.artist,
          genreSong: object.genre,
          albumSong: object.album,
          viewsSong: object.views,
          songURL: object.songURL,
          imageURL: notification.imageURL,
        },
        android: {
          "direct_boot_ok": true,
        },
          topic: topic
      };
    } else if(type === "marketing") {
      notification.title = object.title;
      notification.body = object.body;
      notification.imageURL = object.imageURL;
      
      message = {
        data:{
          title: notification.title,
          body: notification.body,

          bannerID: object.bannerID,
          link: object.link,
          imageURL: notification.imageURL,
        },
        android: {
          "direct_boot_ok": true,
        },
          topic: topic
      };
    }

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