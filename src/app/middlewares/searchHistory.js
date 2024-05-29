const { db } = require("../../config/db/firebase");
const searchHistory = require('../utils/searchHistory');

async function checkHistoryExist(req, res, next){
    const { userID } = req.body;
    try{
        const historyRef = db.collection('searchHistory')
            .where('userID', '==', userID).limit(1);
        const history = await historyRef.get();

        if (history.empty) {
            console.log("Create...");
            await searchHistory.create(req, res); // Gọi hàm create
          } else {
            console.log("Update...");
            await searchHistory.update(req, res); // Gửi dữ liệu cho hàm update
          }

        
    } catch(error) {
        console.error('Error updating user: ', error);
        res.status(500).send("Internal Server Error"); 
    }
    

}

module.exports = checkHistoryExist;