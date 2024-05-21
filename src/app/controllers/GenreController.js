const { db, storage } = require("../../config/db/firebase");
const Genre = require("../models/Genre");
const { v4: uuidv4 } = require('uuid');


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
        try{
            const { genreID, name } = req.body;

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
}

module.exports = new GenreController;
