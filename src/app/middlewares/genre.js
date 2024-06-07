const axios = require("axios");
const getGenreName_API_URL = process.env.API_URL + 'genres/genreName';
//const getGenreName_API_URL = 'http://localhost:8383/' + 'genres/genreName';

function removeDuplicates(listGenre) {
    const uniqueElements = [];
    for (const element of listGenre) {
      if (!uniqueElements.includes(element)) {
        uniqueElements.push(element);
      }
    }
    return uniqueElements;
  }

async function getGenreBySongID(req, res, next) {
    const listSongID = req.listSongID;
    const genreCounts = req.genreCounts;
  
    let listGenre = [];
  
    try {
      const genrePromises = listSongID.map(async (item) => {
        try {
          const genreName = await axios.get(getGenreName_API_URL, {
            data: {
              songID: item,
            },
          });
          listGenre.push(genreName.data);
        } catch (error) {
          console.error('Error fetching genre for songID:', item, error);
          // Handle individual song ID errors (optional)
          // You could return an error response or retry logic here
        }
      });
  
      await Promise.all(genrePromises);
    } catch (error) {
      console.error('Error fetching genres:', error);
      // Handle overall errors (e.g., network issues, unexpected responses)
      // You could return a generic error response or retry logic here
    }

    const cleanGenres = removeDuplicates(listGenre)
  
    req.listGenreName = cleanGenres;
    req.genreCounts = genreCounts;
    
    next();
  }

module.exports = getGenreBySongID;