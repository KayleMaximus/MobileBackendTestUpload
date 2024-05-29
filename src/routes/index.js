const userRouter = require('./user.route');
const notificationRouter = require('./notification.route');
const loginController = require('./login.route');
const siteRouter = require('./site.route');
const songRouter = require('./song.route');
const artistRouter = require('./artist.route');
const genreRouter = require('./genre.route');
const albumRouter = require('./album.route');
const historyRouter = require('./listenHistory.route');
const searchRouter = require('./searchHistory.route');
const bannerRouter = require('./banner.route');


function route(app) {
    app.use('/login', loginController);
    app.use('/users', userRouter);
    app.use('/notifications', notificationRouter);
    app.use('/songs', songRouter);
    app.use('/artists', artistRouter);
    app.use('/genres', genreRouter);
    app.use('/albums', albumRouter);
    app.use('/history', historyRouter);
    app.use('/search', searchRouter);
    app.use('/banners', bannerRouter);
    app.use('/', siteRouter);

}

module.exports = route;