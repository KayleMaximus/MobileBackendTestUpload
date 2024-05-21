const userRouter = require('./user.route');
const notificationRouter = require('./notification.route');
const loginController = require('./login.route');
const siteRouter = require('./site.route');
const artistRouter = require('./artist.route');
<<<<<<< HEAD
const genreRouter = require('./genre.route')
const albumRouter = require('./album.route')
=======
const songRouter = require('./song.route');
>>>>>>> SongAPI

function route(app) {
    app.use('/login', loginController);
    app.use('/users', userRouter);
    app.use('/notifications', notificationRouter);
    app.use('/songs', songRouter);
    app.use('/artists', artistRouter);
    app.use('/genres', genreRouter)
    app.use('/albums', albumRouter)
    app.use('/', siteRouter);

}

module.exports = route;