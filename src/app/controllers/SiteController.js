const { db, storage } = require("../../config/db/firebase");
const User = require("../models/User");

class SiteController {

    //[GET] /home
    async index(req, res){
        res.render('home');
    }


}

module.exports = new SiteController;