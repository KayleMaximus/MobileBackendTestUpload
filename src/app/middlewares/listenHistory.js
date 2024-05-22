const { db } = require("../../config/db/firebase");
const listenHistory = require('../utils/listenHistory');

async function checkHistoryExist(req, res, next){
    const { userID, songID } = req.body;
    try{
        const historyRef = db.collection('listenHistory')
            .where('userID', '==', userID)
            .where('songID', '==', songID).limit(1);
        const history = await historyRef.get();

        if (history.empty) {
            console.log("Create...");
            await listenHistory.create(req, res); // Gọi hàm create
          } else {
            console.log("Update...");
            const historyDoc = history.docs[0];
            await listenHistory.update(req, res, historyDoc); // Gửi dữ liệu cho hàm update
          }

        
    } catch(error) {
        console.error('Error updating user: ', error);
        res.status(500).send("Internal Server Error"); 
    }
    

}

module.exports = checkHistoryExist;