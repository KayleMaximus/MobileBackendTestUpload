const elasticlunr = require('elasticlunr');
const Song = require('../models/Song');

// Hàm tiền xử lý để loại bỏ dấu câu và chuyển đổi văn bản về dạng chữ thường
function preprocess(query) {
    return query.toLowerCase()
                .normalize('NFD') // Chuẩn hóa Unicode normalization form D (NFD)
                .replace(/[\u0300-\u036f]/g, ''); // Loại bỏ các ký tự diacritical marks
}

function handleArtist(artist) {
    
}



function searchSong(query, songs) {
    // Tạo chỉ mục ElasticLunr
    const index = elasticlunr(function () {
        this.addField('name');
        this.setRef('songID');
    });

    // Thêm các bài hát vào chỉ mục sau khi tiền xử lý tên bài hát
    songs.forEach(song => {
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
            name: { boost: 1 }
        },
        expand: true
    });


    // Tạo mảng kết quả
    const searchResults = [];
    results.forEach(result => {
        const song = songs.find(song => song.songID === result.ref);
        console.log(song);

        if (song) {
            searchResults.push(new Song(
                song.songID,
                song.name,
                song.artist,
                song.genre,
                song.album,
                song.views,
                song.createdAt,
                song.songURL,
                song.imageURL
            ));
        }
    });

    return searchResults;
}

module.exports = searchSong;