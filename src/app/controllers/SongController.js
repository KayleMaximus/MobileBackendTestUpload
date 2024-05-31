require('dotenv').config();
const { db, storage } = require("../../config/db/firebase");
const { google } = require("googleapis");
const stream = require("stream");
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
                         songData.album, songData.views, songData.createdAt, songData.songURL, songData.imageURL);
                    list.push(song);
                });
            })
            .catch(next);
        res.send(list);
    }

    //[POST] 
    async create(req, res) {
        const { name, artist, genre, album, views } = req.body;
        const songFile = req.file;

        try{
            // Authentication with gg drive
            const authClient = await authorize();
            const drive = google.drive({ version: "v3", auth: authClient });
            
            // Handle songURL, save it in drive
            const fileMetaData = {
                name: name,
                //parents: ["1BHXt7gFyOVyZ08yPwdk7dOhhIuAkdepv"], // A folder ID to which file will get uploaded
                parents: ["1TafzkI_G7A9DBIg-zzztYo8PrzQopFN6"], // A folder ID to which file will get uploaded
            };
   
            const media = {
                mimeType: 'audio/mpeg',
                body: new stream.PassThrough().end(songFile.buffer), // Đọc dữ liệu từ tệp MP3
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
            // Done it

     
            // Handle Thumbnail, save it in firebase
            const metadata = await mm.parseBuffer(songFile.buffer);;

            let imageURL = "";

            if (metadata.common.picture && metadata.common.picture.length > 0) {
                const imageBuffer = Buffer.from(metadata.common.picture[0].data);
                const imageName = `${name}_thumbnail.jpg`;

                const destinationFileName = "images/" + imageName; 
                
                await storage.bucket().file(destinationFileName).save(imageBuffer, {
                    contentType: 'image/jpeg',
                  });
    
                const fileURL = await storage.bucket().file(destinationFileName).getSignedUrl({
                    action:"read",
                    expires: "01-01-3000"
                })

                imageURL = fileURL.toString();
            }
            // Done it

            //create prop createdAt
            const createdAt = new Date().toISOString().split('T')[0];

            // create object Song
            const newSong = new Song(songID, name, artist, genre, album, views, createdAt, songUrl, imageURL);

            await db.collection('songs').add({
                songID: newSong.songID,
                name: newSong.name,
                artist: newSong.artist,
                genre: newSong.genre,
                album: newSong.album,
                views: newSong.views,
                createdAt: newSong.createdAt,
                songURL: newSong.songURL,
                imageURL: newSong.imageURL,
            });

            res.status(201).send("Song created successfully");
        } catch(error){
            res.status(500).send("Internal Server Error"); 
        }
    }

    //[GET] /getAllSongName
    async getAllSongName(req, res, next){
        const list = [];
        await db.collection('songs').get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    const songData = doc.data();
                    list.push(songData.name);
                });
            })
            .catch(next);
        res.send(list);
    }

    //[GET] /nameArtist
    async getSongByArtistName(req, res, next){
        const nameArtist = req.query.nameArtist;
        let list = [];

        await db.collection('songs').where('artist', '==', nameArtist).get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    const songData = doc.data();
                    const song = new Song(songData.songID, songData.name, songData.artist, songData.genre,
                         songData.album, songData.views, songData.createdAt, songData.songURL, songData.imageURL);
                    list.push(song);
                });
            })
            .catch(next);
        res.send(list);
    }

    //[GET] /nameAlbum
    async getSongByAlbumName(req, res, next){
        const nameAlbum = req.query.nameAlbum;
        let list = [];
        
        await db.collection('songs').where('album', '==', nameAlbum).get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    const songData = doc.data();
                    const song = new Song(songData.songID, songData.name, songData.artist, songData.genre,
                         songData.album, songData.views, songData.createdAt, songData.songURL, songData.imageURL);
                    list.push(song);
                });
            })
            .catch(next);
        res.send(list);
    }
}

module.exports = new SongController;
