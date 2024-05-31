const elasticlunr = require("elasticlunr");
const Song = require("../models/Song");
const Artist = require("../models/Artist");
const axios = require("axios");

// Hàm tiền xử lý để loại bỏ dấu câu và chuyển đổi văn bản về dạng chữ thường
function preprocess(query) {
  return query
    .toLowerCase()
    .normalize("NFD") // Chuẩn hóa Unicode normalization form D (NFD)
    .replace(/[\u0300-\u036f]/g, ""); // Loại bỏ các ký tự diacritical marks
}

function handleArtist() {
  console.log("print artist");
}

async function searchSong(query) {
  const responseGetAllSongAPI = await axios.get(
    "https://mobilebackendtestupload-q7eh.onrender.com/songs"
  );
  const songs = responseGetAllSongAPI.data;

  // Tạo chỉ mục ElasticLunr
  const index = elasticlunr(function () {
    this.addField("name");
    this.setRef("songID");
  });

  // Thêm các bài hát vào chỉ mục sau khi tiền xử lý tên bài hát
  songs.forEach((song) => {
    index.addDoc({
      songID: song.songID,
      name: preprocess(song.name),
      artist: song.artist,
      genre: song.genre,
      album: song.album,
      views: song.views,
      createdAt: song.createdAt,
      songURL: song.songURL,
      imageURL: song.imageURL,
    });
  });

  // Tiền xử lý truy vấn
  const processedQuery = preprocess(query);
  const results = index.search(processedQuery, {
    fields: {
      name: { boost: 1 },
    },
    expand: true,
  });

  // Tạo mảng kết quả
  const searchResults = [];
  results.forEach((result) => {
    const song = songs.find((song) => song.songID === result.ref);
    //console.log(song);

    if (song) {
      searchResults.push({
        type: "song",
        score: result.score,
        data: new Song(
          song.songID,
          song.name,
          song.artist,
          song.genre,
          song.album,
          song.views,
          song.createdAt,
          song.songURL,
          song.imageURL
        ),
      });
    }
  });

  console.log(searchResults);

  return searchResults;
}

async function searchArtist(query) {
  const responseGetAllArtistAPI = await axios.get(
    "https://mobilebackendtestupload-q7eh.onrender.com/artists"
  );
  const artists = responseGetAllArtistAPI.data;

  // Tạo chỉ mục ElasticLunr
  const index = elasticlunr(function () {
    this.addField("name");
    this.setRef("artistID");
  });

  // Thêm các bài hát vào chỉ mục sau khi tiền xử lý tên bài hát
  artists.forEach((artist) => {
    index.addDoc({
      artistID: artist.artistID,
      name: preprocess(artist.name),
      description: artist.description,
      imageURL: artist.imageURL,
      listSong: artist.listSong,
    });
  });

  // Tiền xử lý truy vấn
  const processedQuery = preprocess(query);
  const results = index.search(processedQuery, {
    fields: {
      name: { boost: 1 },
    },
    expand: true,
  });

  // Tạo mảng kết quả
  const searchResults = [];
  results.forEach((result) => {
    const artist = artists.find((artist) => artist.artistID === result.ref);
    //console.log(song);

    if (artist) {
        searchResults.push({
                            type: 'artist',
                            score: result.score,
                            data: new Artist(
                                artist.artistID,
                                artist.name,
                                artist.description,
                                artist.imageURL,
                                artist.listSong
                            )
                        });
    }
  });

  console.log(searchResults);

  return searchResults;
}

// async function search(query) {
//     const [responseGetAllSongAPI, responseGetAllArtistAPI] = await Promise.all([
//         axios.get('https://mobilebackendtestupload-q7eh.onrender.com/songs'),
//         axios.get('https://mobilebackendtestupload-q7eh.onrender.com/artists')
//     ]);

//     const songs = responseGetAllSongAPI.data;
//     const artists = responseGetAllArtistAPI.data;

//     // Tạo chỉ mục ElasticLunr cho bài hát
//     const songIndex = elasticlunr(function () {
//         this.addField('name');
//         this.setRef('songID');
//     });

//     songs.forEach(song => {
//         songIndex.addDoc({
//             songID: song.songID,
//             name: preprocess(song.name),
//             artist: song.artist,
//             genre: song.genre,
//             album: song.album,
//             views: song.views,
//             createdAt: song.createdAt,
//             songURL: song.songURL,
//             imageURL: song.imageURL,
//         });
//     });

//     // Tạo chỉ mục ElasticLunr cho nghệ sĩ
//     const artistIndex = elasticlunr(function () {
//         this.addField('name');
//         this.setRef('artistID');
//     });

//     artists.forEach(artist => {
//         artistIndex.addDoc({
//             artistID: artist.artistID,
//             name: preprocess(artist.name),
//             description: artist.description,
//             imageURL: artist.imageURL,
//             listSong: artist.listSong,
//         });
//     });

//     // Tiền xử lý truy vấn
//     const processedQuery = preprocess(query);
//     const songResults = songIndex.search(processedQuery, {
//         fields: {
//             name: { boost: 1 }
//         },
//         expand: true
//     });

//     const artistResults = artistIndex.search(processedQuery, {
//         fields: {
//             name: { boost: 1 }
//         },
//         expand: true
//     });

//     // Tạo mảng kết quả
//     const searchResults = [];

//     songResults.forEach(result => {
//         const song = songs.find(song => song.songID === result.ref);
//         if (song) {
//             searchResults.push({
//                 type: 'song',
//                 score: result.score,
//                 data: new Song(
//                     song.songID,
//                     song.name,
//                     song.artist,
//                     song.genre,
//                     song.album,
//                     song.views,
//                     song.createdAt,
//                     song.songURL,
//                     song.imageURL
//                 )
//             });
//         }
//     });

//     artistResults.forEach(result => {
//         const artist = artists.find(artist => artist.artistID === result.ref);
//         if (artist) {
//             searchResults.push({
//                 type: 'artist',
//                 score: result.score,
//                 data: new Artist(
//                     artist.artistID,
//                     artist.name,
//                     artist.description,
//                     artist.imageURL,
//                     artist.listSong
//                 )
//             });
//         }
//     });

//     // Sắp xếp kết quả theo điểm số giảm dần
//     searchResults.sort((a, b) => b.score - a.score);

//     console.log(searchResults);

//     return searchResults;
// }

async function sumaryResponseData(query, artist) {
  let reponse = [];
  const songs = await searchSong(query);
  const artists = await searchArtist(query);

  songs.forEach(item => reponse.push(item));
  artists.forEach(item => reponse.push(item));

  reponse.sort((a, b) => b.score - a.score);

  return reponse;
}

module.exports = sumaryResponseData;
