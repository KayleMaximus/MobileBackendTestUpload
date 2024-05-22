class Song {
    constructor(songID, name, artist, genre, album, views, createdAt, songURL, imageURL) {
      this.songID = songID;
      this.name = name;
      this.artist = artist;
      this.genre = genre;
      this.album = album;
      this.views = views;
      this.createdAt = createdAt;
      this.songURL = songURL;
      this.imageURL = imageURL;
    }
}

module.exports = Song;
