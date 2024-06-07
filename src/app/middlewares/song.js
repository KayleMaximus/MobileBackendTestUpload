const axios = require("axios");

const getSongByGenre_API_URL = process.env.API_URL + "songs/nameGenre";
const getSongBySongID_API_URL = process.env.API_URL + "songs/songID";

async function getSongByGenre(req, res, next) {
  const listGenre = req.listGenreName;
  const genreCounts = req.genreCounts;

  console.log(genreCounts);

  let listSong = [];

  try {
    const genrePromises = listGenre.map(async (item) => {
      try {
        if (item == "R&B") item = "R%26B";
        const songs = await axios.get(
          `${getSongByGenre_API_URL}?nameGenre=${item}`
        );

        const songData = songs.data;

        for (let i = 0; i < songData.length; i++) {
          listSong.push(songData[i]);
        }
      } catch (error) {
        console.error("Error:", item, error);
      }
    });

    await Promise.all(genrePromises);
  } catch (error) {
    console.error("Error:", error);
  }

  const result = handleRecommendFinal(listSong, genreCounts);

  req.result = result;

  next();
}

async function getSongBySongID(req, res, next) {
  const listSongID = req.listSongID;
  const listListenHistory = req.listBaseSort;

  let listSong = [];

  try {
    const songPromises = listSongID.map(async (item) => {
      try {
        const songs = await axios.get(
          `${getSongBySongID_API_URL}?songID=${item}`
        );

        const songData = songs.data;

        listSong.push(songData);
      } catch (error) {
        console.error("Error:", item, error);
      }
    });

    await Promise.all(songPromises);
  } catch (error) {
    console.error("Error:", error);
  }

  const genreCounts = handleRecommend(listSong, listListenHistory);

  req.genreCounts = genreCounts;

  next();
}

function handleRecommend(listSong, listListenHistory) {
  let myData = [];
  for (let i = 0; i < listSong.length; i++) {
    for (let j = 0; j < listListenHistory.length; j++) {
      if (listSong[i].songID === listListenHistory[j].songID) {
        let newObject = {
          songID: listSong[i].songID,
          genre: listSong[i].genre,
          count: listListenHistory[j].count,
        };

        myData.push(newObject);
      }
    }
  }

  const genreCounts = {};

  myData.forEach(function (item) {
    // Kiểm tra xem genre này đã được thêm vào đối tượng genreCounts chưa
    if (genreCounts[item.genre]) {
      // Nếu đã tồn tại, cộng giá trị count
      genreCounts[item.genre] += item.count;
    } else {
      // Nếu chưa tồn tại, thêm một cặp key-value mới
      genreCounts[item.genre] = item.count;
    }
  });

  return genreCounts;
}

function handleRecommendFinal(listSong, genreCounts) {
  let entries = Object.entries(genreCounts);

  entries.sort((a, b) => b[1] - a[1]);

  let sortedGenreCount = Object.fromEntries(entries);

  console.log(sortedGenreCount);

  let arraysByGenre = {};

  // Lặp qua từng khóa trong đối tượng genreCount
  for (let key in sortedGenreCount) {
    // Tạo một mảng mới với tên là key và đặt vào đối tượng arraysByGenre
    arraysByGenre[key] = [];
  }

  listSong.forEach((song) => {
    let genre = song.genre;
    if (arraysByGenre.hasOwnProperty(genre)) {
      arraysByGenre[genre].push(song);
    }
  });

  const newArray = Object.values(arraysByGenre);

  newArray.forEach((subArray) => {
    subArray.sort((a, b) => parseInt(b.views) - parseInt(a.views));
  });
  const result = [];

  newArray.forEach((subArray) => {
    subArray.forEach((song) => {
      result.push(song);
    });
  });

  if(result.length <= 10) {
    return result;
  } else {
    return result.slice(0, 10);
  }
}


module.exports = { getSongByGenre, getSongBySongID };
