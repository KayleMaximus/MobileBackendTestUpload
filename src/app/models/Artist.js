class Artist {
    constructor(artistID, name, description, imageURL, listSong) {
      this.artistID = artistID;
      this.name = name;
      this.description = description;
      this.imageURL = imageURL;
      this.listSong = listSong;
    }
}

module.exports = Artist;