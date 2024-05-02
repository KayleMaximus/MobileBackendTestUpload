const userRouter = require('./user.route');
const siteRouter = require('./site.route');

function route(app) {

    app.use('/user', userRouter);
    app.use('/', siteRouter);

}

module.exports = route;