const userRouter = require('./user.route');
const siteRouter = require('./site.route');

function route(app) {

    app.use('/users', userRouter);
    app.use('/', siteRouter);

}

module.exports = route;