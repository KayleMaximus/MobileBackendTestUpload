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

    async update(req, res) {
        const genreID = req.params.genreID;
        const { name } = req.body;
    
        // Tạo một object JSON chứa các trường cần cập nhật
        const updatedData = {};
    
        if (name) updatedData.name = name;
    
        try {
          // Tìm tài liệu có trường id phù hợp
          const genreRef = db.collection("genres").where("genreID", "==", genreID);
          const myGenre = await genreRef.get();
    
          if (myGenre.empty) {
            res.status(404).send("Genre not found");
            return;
          }
    
          // Cập nhật chỉ các trường đã được cung cấp trong updatedData
          const doc = myGenre.docs[0];
          await doc.ref.update(updatedData);
    
          res.status(200).send("Genre updated successfully");
        } catch (error) {
          console.error("Error updating user: ", error);
          res.status(500).send("Internal Server Error");
        }
      }

    async delete(req, res) {
        try {
          const genreID = req.params.genreID;
    
          const genreRef = db.collection("genres").where("genreID", "==", genreID);
          const myGenre = await genreRef.get();
    
          if (myGenre.empty) {
            res.status(404).send("Genre not found");
            return;
          }
    
          const doc = myGenre.docs[0];
          await doc.ref.delete();
    
          res.status(200).send("Genre deleted successfully");
        } catch (error) {
          console.error("Error updating user: ", error);
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
