const { db, storage } = require("../../config/db/firebase");
const Genre = require("../models/Genre");
const { v4: uuidv4 } = require('uuid');
const generateRandomID = require("../utils/randomID");


class GenreController {
    async index(req, res, next){
        const list = [];
        await db.collection('genres').get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    const genreData = doc.data();
                    const genre = new Genre(genreData.genreID, genreData.name);
                    list.push(genre);
                });
            })
            .catch(next);
        res.send(list);
    }

    async create(req, res) {
    const genreID = generateRandomID(23);

        try{
            const { name } = req.body;

            const newGenre = new Genre(genreID, name);
            await db.collection('genres').add({
                genreID: newGenre.genreID,
                name: newGenre.name,
            })
            
            res.status(201).send("Genres created successfully"); 
        } catch(error){
            res.status(500).send("Internal Server Error"); 
        }
    }

    async getGenreBySongID(req, res) {
        try{
            const { songID } = req.body;

            await db
            .collection("songs")
            .where("songID", "==", songID)
            .get()
            .then((snapshot) => {
              snapshot.forEach((doc) => {
                const songData = doc.data();
                res.send(songData.genre);
              });
            })
        } catch(error){
            res.status(500).send("Internal Server Error"); 
        }
    }
}

module.exports = new GenreController;
