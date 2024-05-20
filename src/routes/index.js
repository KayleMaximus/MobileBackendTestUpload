const userRouter = require('./user.route');
const notificationRouter = require('./notification.route');
const siteRouter = require('./site.route');
const artistRouter = require('./artist.route');

function route(app) {

    app.use('/users', userRouter);
    app.use('/notifications', notificationRouter);
    app.use('/artists', artistRouter);
    app.use('/', siteRouter);

}

module.exports = route;