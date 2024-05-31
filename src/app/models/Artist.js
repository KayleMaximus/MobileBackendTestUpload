class Artist {
    constructor(artistID, name, description, imageURL, listSong, listAlbum) {
      this.artistID = artistID;
      this.name = name;
      this.description = description;
      this.imageURL = imageURL;
      this.listSong = listSong;
      this.listAlbum = listAlbum;
    }
}

module.exports = Artist;