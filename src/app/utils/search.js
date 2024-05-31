const elasticlunr = require("elasticlunr");
const Song = require("../models/Song");
const Artist = require("../models/Artist");
const Album = require("../models/Album");
const axios = require("axios");

//const songAPI_URL = "https://mobilebackendtestupload-q7eh.onrender.com/songs";
const songAPI_URL = "http://localhost:8383/songs";
//const artistAPI_URL = "https://mobilebackendtestupload-q7eh.onrender.com/artists";
const artistAPI_URL = "http://localhost:8383/artists";
//const albumAPI_URL = "https://mobilebackendtestupload-q7eh.onrender.com/albums";
const albumAPI_URL = "http://localhost:8383/albums";

// Hàm tiền xử lý để loại bỏ dấu câu và chuyển đổi văn bản về dạng chữ thường
function preprocess(query) {
  return query
    .toLowerCase()
    .normalize("NFD") // Chuẩn hóa Unicode normalization form D (NFD)
    .replace(/[\u0300-\u036f]/g, ""); // Loại bỏ các ký tự diacritical marks
}

async function searchSong(query) {
  const responseGetAllSongAPI = await axios.get(songAPI_URL);
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

    if (artist) {
      searchResults.push({
        type: "artist",
        score: result.score,
        data: new Artist(
          artist.artistID,
          artist.name,
          artist.description,
          artist.imageURL,
          artist.listSong
        ),
      });
    }
  });

  return searchResults;
}

async function searchAlbum(query) {
  const responseGetAllAlbumAPI = await axios.get(
    "https://mobilebackendtestupload-q7eh.onrender.com/albums"
  );
  const albums = responseGetAllAlbumAPI.data;

  // Tạo chỉ mục ElasticLunr
  const index = elasticlunr(function () {
    this.addField("name");
    this.setRef("albumID");
  });

  // Thêm các bài hát vào chỉ mục sau khi tiền xử lý tên bài hát
  albums.forEach((album) => {
    index.addDoc({
      albumID: album.albumID,
      name: preprocess(album.name),
      artist: album.artist,
      imageURL: album.imageURL,
      listSong: album.listSong,
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
    const album = albums.find((album) => album.albumID === result.ref);

    if (album) {
      searchResults.push({
        type: "album",
        score: result.score,
        data: new Album(
          album.albumID,
          album.name,
          album.artist,
          album.imageURL,
          album.listSong
        ),
      });
    }
  });

  return searchResults;
}

async function handleGetSong(listAll) {
  let listSong = [];
  const artistPromises = listAll.map(async (item) => {
    if (item.type === "song") {
      // Thêm trường score cho các bài hát từ list song ban đầu
      item.data.score = item.score;
      listSong.push(item.data);
    } else if (item.type === "artist" && item.data.name) {
      const response = await axios.get(songAPI_URL + "/nameArtist", {
        params: {
          nameArtist: item.data.name,
        },
      });

      const existingSongIDs = new Set(listSong.map((song) => song.songID));
      const uniqueNewSongs = response.data.filter(
        (song) => !existingSongIDs.has(song.songID)
      );

      // Thêm trường score vào các bài hát mới từ artist
      uniqueNewSongs.forEach((song) => {
        song.score = item.score; // Sử dụng score của artist
      });

      listSong = [...listSong, ...uniqueNewSongs];
    } else if (item.type === "album" && item.data.name) {
      const response = await axios.get(songAPI_URL + "/nameAlbum", {
        params: {
          nameAlbum: item.data.name,
        },
      });

      const existingSongIDs = new Set(listSong.map((song) => song.songID));
      const uniqueNewSongs = response.data.filter(
        (song) => !existingSongIDs.has(song.songID)
      );

      // Thêm trường score vào các bài hát mới từ album
      uniqueNewSongs.forEach((song) => {
        song.score = item.score; // Sử dụng score của album
      });

      listSong = [...listSong, ...uniqueNewSongs];
    }
  });

  await Promise.all(artistPromises);

  return listSong;
}

async function handleGetArtist(listAll) {
  let listArtist = [];
  const artistPromises = listAll.map(async (item) => {
    if (item.type === "song" && item.data.name) {
      const response = await axios.get(artistAPI_URL + "/nameSong", {
        params: {
          nameSong: item.data.name,
        },
      });

      const existingArtists = new Set(listArtist.map((artist) => artist.artistID));
      const uniqueNewArtists = response.data.filter(
        (artist) => !existingArtists.has(artist.artistID)
      );

      // Thêm trường score vào các bài hát mới từ song
      uniqueNewArtists.forEach((artist) => {
        artist.score = item.score; // Sử dụng score của song
      });

      listArtist = [...listArtist, ...uniqueNewArtists];
    } else if (item.type === "artist") {
      // Thêm trường score cho các bài hát từ list song ban đầu
      item.data.score = item.score;
      listArtist.push(item.data);
    } else if (item.type === "album" && item.data.name) {
      const response = await axios.get(artistAPI_URL + "/nameAlbum", {
        params: {
          nameAlbum: item.data.name,
        },
      });

      const existingArtists = new Set(listArtist.map((artist) => artist.artistID));
      const uniqueNewArtists = response.data.filter(
        (artist) => !existingArtists.has(artist.artistID)
      );

      // Thêm trường score vào các bài hát mới từ album
      uniqueNewArtists.forEach((artist) => {
        artist.score = item.score; // Sử dụng score của album
      });

      listArtist = [...listArtist, ...uniqueNewArtists];
    }
  });

  await Promise.all(artistPromises);

  return listArtist;
}

async function handleGetAlbum(listAll) {
  let listAlbum = [];
  const albumPromises = listAll.map(async (item) => {
    if (item.type === "song" && item.data.name) {
      const response = await axios.get(albumAPI_URL + "/nameSong", {
        params: {
          nameSong: item.data.name,
        },
      });

      const existingAlbums = new Set(listAlbum.map((album) => album.albumID));
      const uniqueNewAlbums = response.data.filter(
        (album) => !existingAlbums.has(album.albumID)
      );

      // Thêm trường score vào các bài hát mới từ song
      uniqueNewAlbums.forEach((album) => {
        album.score = item.score; // Sử dụng score của song
      });

      listAlbum = [...listAlbum, ...uniqueNewAlbums];
    } else if (item.type === "artist" && item.data.name) {
      const response = await axios.get(albumAPI_URL + "/nameArtist", {
        params: {
          nameArtist: item.data.name,
        },
      });

      const existingAlbumIDs = new Set(listAlbum.map((album) => album.albumID));
      const uniqueNewAlbums = response.data.filter(
        (album) => !existingAlbumIDs.has(album.albumID)
      );

      // Thêm trường score vào các bài hát mới từ artist
      uniqueNewAlbums.forEach((album) => {
        album.score = item.score; // Sử dụng score của artist
      });

      listAlbum = [...listAlbum, ...uniqueNewAlbums];
    } else if (item.type === "album") {
      // Thêm trường score cho các bài hát từ list song ban đầu
      item.data.score = item.score;
      listAlbum.push(item.data);
    }
  });

  await Promise.all(albumPromises);

  return listAlbum;
}

async function sumaryResponseData(query, song, artist, album) {
  let reponseAll = [];
  const songs = await searchSong(query);
  const artists = await searchArtist(query);
  const albums = await searchAlbum(query);

  songs.forEach((item) => reponseAll.push(item));
  artists.forEach((item) => reponseAll.push(item));
  albums.forEach((item) => reponseAll.push(item));

  reponseAll.sort((a, b) => b.score - a.score);

  if (song) {
    const response = await handleGetSong(reponseAll);
    response.sort((a, b) => b.score - a.score);
    return response;
  } else if (artist) {
    const response = await handleGetArtist(reponseAll);
    response.sort((a, b) => b.score - a.score);
    return response;
  } else if (album) {
    const response = await handleGetAlbum(reponseAll);
    response.sort((a, b) => b.score - a.score);
    return response;
  } else {
    return reponseAll;
  }
}

module.exports = sumaryResponseData;
