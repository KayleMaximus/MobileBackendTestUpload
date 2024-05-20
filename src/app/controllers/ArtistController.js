const { db, storage } = require("../../config/db/firebase");
const Artist = require("../models/Artist");
const { v4: uuidv4 } = require('uuid');


class ArtistController {
    async index(req, res, next){
        const list = [];
        await db.collection('artists').get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    const artistData = doc.data();
                    const artist = new Artist(artistData.artistID, artistData.name, 
                        artistData.description, artistData.imageURL, artistData.listSong);
                    list.push(artist);
                });
            })
            .catch(next);
        res.send(list);
    }

    async create(req, res) {
        try{
            const { artistID, name, description, listSong } = req.body;
            const file = req.file;

            const fileName = uuidv4(); // Generate a unique filename using UUID
            const destinationFileName = "images/" + fileName; // Use the generated filename

            await storage.bucket().file(destinationFileName).save(file.buffer, {
                contentType: req.file.mimetype,
            });

            const fileURL = await storage.bucket().file(destinationFileName).getSignedUrl({
                action:"read",
                expires: "01-01-3000"
            })

            const newArtist = new Artist(artistID, name, description, fileURL, []);
            await db.collection('artists').add({
                artistID: newArtist.artistID,
                name: newArtist.name,
                description: newArtist.description,
                imageURL: newArtist.imageURL,
                listSong: newArtist.listSong,
            })
            
            res.status(201).send("Artist created successfully"); 
        } catch(error){
            res.status(500).send("Internal Server Error"); 
        }
    }
}

module.exports = new ArtistController;
