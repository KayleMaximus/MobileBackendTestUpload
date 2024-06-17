const userRouter = require('./user.route');
const loginController = require('./login.route');
const siteRouter = require('./site.route');
const songRouter = require('./song.route');
const artistRouter = require('./artist.route');
const genreRouter = require('./genre.route');
const albumRouter = require('./album.route');
const historyRouter = require('./listenHistory.route');
const searchRouter = require('./search.route');
const searchHistoryRouter = require('./searchHistory.route');
const bannerRouter = require('./banner.route');
const paymentRouter = require('./payment.route');
const peerRouter = require('./peer.route');

function route(app) {
    app.use('/login', loginController);
    app.use('/users', userRouter);
    app.use('/songs', songRouter);
    app.use('/artists', artistRouter);
    app.use('/genres', genreRouter);
    app.use('/albums', albumRouter);
    app.use('/listenHistory', historyRouter);
    app.use('/search', searchRouter);
    app.use('/searchHistory', searchHistoryRouter);
    app.use('/banners', bannerRouter);
    app.use('/payment', paymentRouter);
    app.use('/peerjs', peerRouter);
    app.use('/', siteRouter);
}

module.exports = route;