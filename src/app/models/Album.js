class Album {
    constructor(albumID, name, artist, imageURL, listSong) {
      this.albumID = albumID;
      this.name = name;
      this.artist = artist;
      this.imageURL = imageURL;
      this.listSong = listSong;
    }
}

module.exports = Album;