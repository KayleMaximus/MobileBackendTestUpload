class ListenHistory {
    constructor(userID, songID, lastListen, isLove, count) {
      this.userID = userID;
      this.songID = songID;
      this.lastListen = lastListen;
      this.isLove = isLove;
      this.count = count;
    }

}

module.exports = ListenHistory;