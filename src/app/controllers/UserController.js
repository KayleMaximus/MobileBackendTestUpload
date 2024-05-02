class UserController {

    //[GET] /user
    index(req, res){
        res.render('user');
    }

}

module.exports = new UserController;