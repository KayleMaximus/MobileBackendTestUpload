const { db, storage } = require("../../config/db/firebase");
const ListenHistory = require("../models/ListenHistory");

class ListenHistoryController {
        //[GET]
        async index(req, res, next){
            const list = [];
            await db.collection('listenHistory').get()
                .then(snapshot => {
                    snapshot.forEach(doc => {
                        const historyData = doc.data();
                        const listenHistory = new ListenHistory(historyData.userID, historyData.songID, 
                            historyData.lastListen, historyData.isLove, historyData.count);
                        list.push(listenHistory);
                    });
                })
                .catch(next);
            res.send(list);
        }

   
}

module.exports = new ListenHistoryController;
