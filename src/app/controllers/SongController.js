require('dotenv').config();
const { db, storage } = require("../../config/db/firebase");
const { google } = require("googleapis");
const {authorize} = require("../../config/db/googleDrive");
const fs = require("fs");
const mm = require('music-metadata');
const { v4: uuidv4 } = require('uuid');
const Song = require("../models/Song");



class SongController {

    //[GET] /user
    async index(req, res, next){
        const list = [];
        await db.collection('songs').get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    const songData = doc.data();
                    const song = new Song(songData.songID, songData.name, songData.artist, songData.genre,
                         songData.album, songData.views, songData.songURL, songData.imageURL);
                    list.push(song);
                });
            })
            .catch(next);
        res.send(list);
    }

    //[POST] /users
    async create(req, res) {
        try{
            const { name, artist, genre, album, views } = req.body;
            const songFile = req.file;
            console.log(songFile.buffer);

            console.log("Uploading...");

            const authClient = await authorize();
            const drive = google.drive({ version: "v3", auth: authClient });
            
            const fileMetaData = {
                name: name,
                //parents: ["1BHXt7gFyOVyZ08yPwdk7dOhhIuAkdepv"], // A folder ID to which file will get uploaded
                parents: ["1TafzkI_G7A9DBIg-zzztYo8PrzQopFN6"], // A folder ID to which file will get uploaded
            };

            const media = {
                mimeType: 'audio/mpeg',
                body: fs.createReadStream(songFile.originalname), // Đọc dữ liệu từ tệp MP3
              };

            
            const response = await drive.files.create({
                resource: fileMetaData,
                media: media,
                fields: "id",
              });

            const songID = response.data.id;
            await drive.permissions.create({
                fileId: songID,
                requestBody: {
                    role: 'reader',
                    type: 'anyone',
                },
            });

            const songUrl = `https://drive.google.com/uc?id=${songID}&export=download`;
    const metadata = await mm.parseFile(songFile.originalname);

    let imageURL = "";

    if (metadata.common.picture && metadata.common.picture.length > 0) {
      console.log("Downloading image...");
      const imageBuffer = Buffer.from(metadata.common.picture[0].data);
      const imageName = `${name}_thumbnail.jpg`;

      console.log(imageBuffer.mimetype);
      console.log(imageName);

      console.log("Uploading image to Firestore storage...");
    const destinationFileName = "images/" + imageName; 
                
                await storage.bucket().file(destinationFileName).save(imageBuffer, {
                    contentType: 'image/jpeg',
                  });
    
                const fileURL = await storage.bucket().file(destinationFileName).getSignedUrl({
                    action:"read",
                    expires: "01-01-3000"
                })
                imageURL = fileURL;
    }
                
                

                const newSong = new Song(songID, name, artist, genre, album, views, songUrl, imageURL);

                console.log(newSong)

                await db.collection('songs').add({
                    songID: newSong.songID,
                    name: newSong.name,
                    artist: newSong.artist,
                    genre: newSong.genre,
                    album: newSong.album,
                    views: newSong.views,
                    songURL: newSong.songURL,
                    imageURL: newSong.imageURL,
                });
            fs.unlinkSync(songFile.originalname);

            res.status(201).send("Song created successfully");
        } catch(error){
            res.status(500).send("Internal Server Error"); 
        }
    }
}

module.exports = new SongController;
